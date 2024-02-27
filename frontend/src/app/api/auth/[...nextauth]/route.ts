import NextAuth from 'next-auth'
import KeycloakProvider from 'next-auth/providers/keycloak'
import jwt, { CustomizeJwtPayload } from 'jsonwebtoken'
import fetchData from '@/components/happiness/fetch'

const GENERAL_USER_KEYCLOAK_CLIENT_ID =
  process.env.GENERAL_USER_KEYCLOAK_CLIENT_ID
const GENERAL_USER_KEYCLOAK_CLIENT_SECRET =
  process.env.GENERAL_USER_KEYCLOAK_CLIENT_SECRET
const KEYCLOAK_CLIENT_ISSUER = process.env.KEYCLOAK_CLIENT_ISSUER

const fetchPublicKey = async () => {
  const openidConfiguration = await fetchData(
    `${process.env.KC_HOSTNAME_URL}/realms/oasismap/.well-known/openid-configuration`
  )
  const certs = await fetchData(openidConfiguration.jwks_uri)
  const key = certs.keys.find((item: { alg: string }) => item.alg === 'RS256')
  return `-----BEGIN CERTIFICATE-----\n${key.x5c.pop()}\n-----END CERTIFICATE-----\n`
}

const handler = NextAuth({
  providers: [
    ...(GENERAL_USER_KEYCLOAK_CLIENT_ID && GENERAL_USER_KEYCLOAK_CLIENT_SECRET
      ? [
          KeycloakProvider({
            id: 'general-user-keycloak-client',
            clientId: GENERAL_USER_KEYCLOAK_CLIENT_ID,
            clientSecret: GENERAL_USER_KEYCLOAK_CLIENT_SECRET,
            issuer: KEYCLOAK_CLIENT_ISSUER,
          }),
        ]
      : []),
    ...(process.env.ADMIN_KEYCLOAK_CLIENT_ID &&
    process.env.ADMIN_KEYCLOAK_CLIENT_SECRET
      ? [
          KeycloakProvider({
            id: 'admin-keycloak-client',
            clientId: process.env.ADMIN_KEYCLOAK_CLIENT_ID,
            clientSecret: process.env.ADMIN_KEYCLOAK_CLIENT_SECRET,
            issuer: process.env.KEYCLOAK_CLIENT_ISSUER,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, account }) {
      return account && token
        ? Object.assign({}, token, { access_token: account.access_token })
        : token
    },
    async session({ session, token }) {
      if (session && token) {
        const publicKey = await fetchPublicKey()
        const decodedToken = <CustomizeJwtPayload>(
          jwt.verify(`${token.access_token}`, publicKey)
        )
        session.user = Object.assign({}, session.user, {
          nickname: decodedToken.nickname,
        })
      }
      return session
    },
  },
})

export { handler as GET, handler as POST }
