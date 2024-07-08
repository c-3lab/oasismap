import NextAuth from 'next-auth'
import KeycloakProvider from 'next-auth/providers/keycloak'
import { JWT } from 'next-auth/jwt'
import jwt, { JwtHeader, JwtPayload, SigningKeyCallback } from 'jsonwebtoken'
import jwksClient, { SigningKey } from 'jwks-rsa'
import { ERROR_TYPE } from '@/libs/constants'

const handler = NextAuth({
  providers: [
    KeycloakProvider({
      id: 'general-user-keycloak-client',
      clientId: process.env.GENERAL_USER_KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.GENERAL_USER_KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_CLIENT_ISSUER,
    }),
    KeycloakProvider({
      id: 'admin-keycloak-client',
      clientId: process.env.ADMIN_KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.ADMIN_KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_CLIENT_ISSUER,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        const url =
          process.env.KEYCLOAK_CLIENT_ISSUER +
          '/.well-known/openid-configuration'
        const response = await fetch(url)
        const json = await response.json()
        const client = jwksClient({
          jwksUri: json.jwks_uri,
        })

        const getKey = (header: JwtHeader, callback: SigningKeyCallback) => {
          client.getSigningKey(header.kid, (err, key?: SigningKey) => {
            callback(null, key?.getPublicKey())
          })
        }

        const decodedToken = await new Promise<JwtPayload>((resolve) => {
          jwt.verify(account.access_token as string, getKey, (err, decoded) => {
            resolve(decoded as JwtPayload)
          })
        })

        token.accessToken = account.access_token
        token.accessTokenExpires = (decodedToken.exp as number) * 1000
        token.refreshToken = account.refresh_token
        token.idToken = account.id_token
        token.clientId = decodedToken.azp
        token.nickname = decodedToken.nickname
        token.userType = decodedToken.userType
        return token
      }

      const accessTokenExpires = new Date(token.accessTokenExpires as number)
      if (new Date() < accessTokenExpires) {
        return token
      }

      return await refreshAccessToken(token)
    },
    async session({ session, token }) {
      if (token.accessToken) {
        session.user.accessToken = token.accessToken as string
      }
      if (token.nickname) {
        session.user.nickname = token.nickname as string
      }
      if (token.userType) {
        session.user.type = token.userType as string
      }
      if (token.error) {
        session.error = token.error as string
      }

      return session
    },
  },
  events: {
    async signOut({ token }) {
      if (token.idToken) {
        const url =
          process.env.KEYCLOAK_CLIENT_ISSUER + '/protocol/openid-connect/logout'
        const query = new URLSearchParams({
          id_token_hint: token.idToken as string,
        })
        await fetch(`${url}?${query}`)
      }
    },
  },
})

const refreshAccessToken = async (token: JWT): Promise<JWT> => {
  try {
    const clientId = token.clientId as string
    const refreshToken = token.refreshToken as string
    const url =
      process.env.KEYCLOAK_CLIENT_ISSUER + '/protocol/openid-connect/token'
    const clientSecrets = {
      [process.env.GENERAL_USER_KEYCLOAK_CLIENT_ID!]:
        process.env.GENERAL_USER_KEYCLOAK_CLIENT_SECRET,
      [process.env.ADMIN_KEYCLOAK_CLIENT_ID!]:
        process.env.ADMIN_KEYCLOAK_CLIENT_SECRET,
    }
    const requestBody = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecrets[clientId] as string,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    })
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: requestBody,
    })

    const refreshedTokens = await response.json()

    if (!response.ok) {
      throw refreshedTokens
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    }
  } catch (error) {
    if (typeof error === 'object' && error !== null) {
      if ('error' in error && 'error_description' in error) {
        const keycloakError = error as {
          error: string
          error_description: string
        }
        if (
          !(
            keycloakError.error === 'invalid_grant' &&
            keycloakError.error_description === 'Token is not active'
          )
        ) {
          console.log(keycloakError)
        }
      } else {
        console.log(error)
      }
    } else {
      console.log(error)
    }

    return {
      ...token,
      error: ERROR_TYPE.REFRESH_ACCESS_TOKEN_ERROR,
    }
  }
}

export { handler as GET, handler as POST }
