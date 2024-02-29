import NextAuth from 'next-auth'
import KeycloakProvider from 'next-auth/providers/keycloak'
import jwt, { JwtHeader, JwtPayload, SigningKeyCallback } from 'jsonwebtoken'
import jwksClient, { SigningKey } from 'jwks-rsa'

const handler = NextAuth({
  providers: [
    KeycloakProvider({
      id: 'general-user-keycloak-client',
      clientId: process.env.GENERAL_USER_KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.GENERAL_USER_KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_CLIENT_ISSUER,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (!account) {
        return token
      }

      const url =
        process.env.KEYCLOAK_CLIENT_ISSUER + '/.well-known/openid-configuration'
      const response = await fetch(url)
      const json = await response.json()
      const client = jwksClient({
        jwksUri: json.jwks_uri,
      })

      function getKey(header: JwtHeader, callback: SigningKeyCallback) {
        client.getSigningKey(header.kid, function (err, key?: SigningKey) {
          callback(null, key?.getPublicKey())
        })
      }

      const decodedToken = await new Promise<JwtPayload>((resolve) => {
        jwt.verify(account.access_token as string, getKey, (err, decoded) => {
          resolve(decoded as JwtPayload)
        })
      })

      token.nickname = decodedToken.nickname

      return token
    },
    async session({ session, token }) {
      if (token.nickname) {
        session.user.nickname = token.nickname as string
      }

      return session
    },
  },
})

export { handler as GET, handler as POST }
