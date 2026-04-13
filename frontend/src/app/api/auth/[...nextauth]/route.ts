import NextAuth from 'next-auth'
import KeycloakProvider from 'next-auth/providers/keycloak'
import { JWT } from 'next-auth/jwt'
import jwt, { JwtHeader, JwtPayload, SigningKeyCallback } from 'jsonwebtoken'
import jwksClient, { SigningKey } from 'jwks-rsa'
import { ERROR_TYPE } from '@/libs/constants'
import { KeycloakRole, UserType } from '@/types/keycloak-roles'

interface RealmAccess {
  roles?: string[]
}

/**
 * Function to get service account access token
 * @returns Promise<string | null> - Access token or null if failed
 */
async function getServiceAccountToken(): Promise<string | null> {
  try {
    const keycloakBaseUrl = process.env.KEYCLOAK_CLIENT_ISSUER?.replace(
      '/realms/oasismap',
      ''
    )
    const realmName = 'oasismap'

    const tokenUrl = `${keycloakBaseUrl}/realms/${realmName}/protocol/openid-connect/token`

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id:
          process.env.SERVICE_ACCOUNT_CLIENT_ID || 'role-assignment-service',
        client_secret: process.env.SERVICE_ACCOUNT_CLIENT_SECRET || '',
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to get service account token:', response.statusText)
      console.error('Error response body:', errorText)
      return null
    }

    const tokenData = await response.json()

    return tokenData.access_token
  } catch (error) {
    console.error('Error getting service account token:', error)
    return null
  }
}

/**
 * Function to get user type based on realm access
 * @param realmAccess - Realm access object with roles
 * @returns UserType - ADMIN or GENERAL
 */
function getUserType(realmAccess: RealmAccess | undefined): UserType {
  if (realmAccess?.roles?.includes(KeycloakRole.ADMIN)) {
    return UserType.ADMIN
  }
  return UserType.GENERAL
}

/**
 * Function to check if user is new (no roles assigned)
 * @param clientId - Client ID from token
 * @param realmRoles - Array of realm roles from token
 * @returns boolean - true if user is new, false if user has roles
 */
function isNewUser(clientId: string, realmRoles: string[]): boolean {
  // If user is using admin client and doesn't have admin role => is not new user
  if (
    clientId === process.env.ADMIN_KEYCLOAK_CLIENT_ID &&
    !realmRoles.includes(KeycloakRole.ADMIN)
  ) {
    return false
  }

  // Check if not include general-user-role and admin-role => is new user
  if (
    !realmRoles.includes(KeycloakRole.GENERAL_USER) &&
    !realmRoles.includes(KeycloakRole.ADMIN)
  ) {
    return true
  }

  return false
}

/**
 * Function to handle new user role assignment and token updates
 * @param token - JWT token object
 * @param decodedToken - Decoded JWT payload
 * @returns Promise<JWT> - Updated token with role information
 */
async function handleNewUserRoleAssignment(
  token: JWT,
  decodedToken: JwtPayload
): Promise<JWT> {
  // Assign default role to new user
  const userId = decodedToken.sub
  const clientId = decodedToken.azp

  token.userType = UserType.GENERAL // Fallback to general user
  if (!userId || !clientId) {
    console.error('❌ [JWT Callback] Missing required data for role assignment')

    return token
  }

  const success = await assignDefaultRoleToNewUser(userId)
  if (!success) {
    console.error('❌ [JWT Callback] Failed to assign default role to new user')

    return token
  }

  // Update realm roles after assigning role
  const updatedDefaultRole = KeycloakRole.GENERAL_USER

  // Update realm_access with new role
  token.realm_access = {
    roles: [updatedDefaultRole],
  }

  return token
}

/**
 * Function to check user authorization based on client ID and roles
 * @param clientId - Client ID from token
 * @param realmAccess - Realm access object with roles
 * @returns string | null - Error message if unauthorized, null if authorized
 */
function checkUserAuthorization(
  clientId: string,
  realmAccess: RealmAccess | undefined
): string | null {
  // Check if user is using general-user client or basic auth client but doesn't have general-user role
  if (
    (clientId === process.env.GENERAL_USER_KEYCLOAK_CLIENT_ID ||
      clientId === process.env.BASIC_AUTH_CLIENT_ID) &&
    !realmAccess?.roles?.includes(KeycloakRole.GENERAL_USER)
  ) {
    return ERROR_TYPE.UNAUTHORIZED
  }

  // Check if user is using admin client but doesn't have admin role
  if (
    clientId === process.env.ADMIN_KEYCLOAK_CLIENT_ID &&
    !realmAccess?.roles?.includes(KeycloakRole.ADMIN)
  ) {
    return ERROR_TYPE.UNAUTHORIZED
  }

  return null // User is authorized
}

/**
 * Function to assign default role to newly registered user
 * @param userId - User ID
 * @param clientId - Client ID (general-user or admin)
 * @returns Promise<boolean> - true if successful, false if failed
 */
async function assignDefaultRoleToNewUser(userId: string): Promise<boolean> {
  try {
    // Get service account token
    const serviceToken = await getServiceAccountToken()
    if (!serviceToken) {
      console.error('Failed to get service account token')
      return false
    }

    const keycloakBaseUrl = process.env.KEYCLOAK_CLIENT_ISSUER?.replace(
      '/realms/oasismap',
      ''
    )
    const realmName = 'oasismap'

    // Determine default role based on client
    let defaultRole = KeycloakRole.GENERAL_USER
    // Get role information from Keycloak
    const roleUrl = `${keycloakBaseUrl}/admin/realms/${realmName}/roles/${defaultRole}`
    const roleResponse = await fetch(roleUrl, {
      headers: {
        Authorization: `Bearer ${serviceToken}`,
        'Content-Type': 'application/json',
      },
    })
    if (!roleResponse.ok) {
      const errorText = await roleResponse.text()
      console.error(
        `Failed to get role ${defaultRole}:`,
        roleResponse.statusText
      )
      console.error('Error response body:', errorText)
      return false
    }

    // Assign role to user
    const roleData = await roleResponse.json()
    const assignRoleUrl = `${keycloakBaseUrl}/admin/realms/${realmName}/users/${userId}/role-mappings/realm`
    const assignResponse = await fetch(assignRoleUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([roleData]),
    })
    if (!assignResponse.ok) {
      const errorText = await assignResponse.text()
      console.error(
        `Failed to assign role to user ${userId}:`,
        assignResponse.statusText
      )
      console.error('Error response body:', errorText)
      return false
    }

    return true
  } catch (error) {
    console.error('Error assigning default role to new user:', error)
    return false
  }
}

/**
 * Function to logout user from Keycloak
 * @param idToken - ID token for logout
 * @returns Promise<void>
 */
async function logoutFromKeycloak(idToken: string): Promise<void> {
  try {
    const url =
      process.env.KEYCLOAK_CLIENT_ISSUER + '/protocol/openid-connect/logout'
    const query = new URLSearchParams({
      id_token_hint: idToken,
    })
    await fetch(`${url}?${query}`)
  } catch (error) {
    console.error('❌ Error during logout:', error)
  }
}

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
    KeycloakProvider({
      id: 'basic-auth-keycloak-client',
      clientId: process.env.BASIC_AUTH_CLIENT_ID!,
      clientSecret: process.env.BASIC_AUTH_CLIENT_SECRET!,
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

        const realmRoles = decodedToken.realm_access?.roles || []
        // Check if user is new using the new function
        if (isNewUser(token.clientId as string, realmRoles)) {
          token = await handleNewUserRoleAssignment(token, decodedToken)
        } else {
          // User already has registered, update realm_access
          token.realm_access = decodedToken.realm_access
        }

        // Update userType based on realm_access
        const realmAccess = token.realm_access as RealmAccess
        token.userType = getUserType(realmAccess)

        // Check user authorization using the new function
        const authError = checkUserAuthorization(
          token.clientId as string,
          realmAccess
        )
        if (authError) {
          // Logout user from Keycloak before returning error
          if (token.idToken) {
            await logoutFromKeycloak(token.idToken as string)
          }

          return {
            ...token,
            error: authError,
          }
        }

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
      if (token.realm_access) {
        session.user.realm_access = token.realm_access as any
      }
      if (token.error) {
        session.error = token.error as string
      }

      // Update userType based on realm_access
      session.user.type = getUserType(token.realm_access as RealmAccess)

      return session
    },
  },
  events: {
    async signOut({ token }) {
      if (token.idToken) {
        await logoutFromKeycloak(token.idToken as string)
      }
    },
  },
  pages: {
    signIn: '/login',
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
      [process.env.BASIC_AUTH_CLIENT_ID!]: process.env.BASIC_AUTH_CLIENT_SECRET,
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
