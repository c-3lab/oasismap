import NextAuth from 'next-auth'
import KeycloakProvider, {
  KeycloakProfileToken,
} from 'next-auth/providers/keycloak'

const GENERAL_USER_KEYCLOAK_CLIENT_ID =
  process.env.GENERAL_USER_KEYCLOAK_CLIENT_ID
const GENERAL_USER_KEYCLOAK_CLIENT_SECRET =
  process.env.GENERAL_USER_KEYCLOAK_CLIENT_SECRET
const KEYCLOAK_CLIENT_ISSUER = process.env.KEYCLOAK_CLIENT_ISSUER

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
        const decodedToken: KeycloakProfileToken = JSON.parse(
          Buffer.from(
            `${token.access_token}`.split('.')[1],
            'base64'
          ).toString()
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
