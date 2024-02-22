import NextAuth from 'next-auth'
import KeycloakProvider, {
  KeycloakProfileToken,
} from 'next-auth/providers/keycloak'

function parseJwt(token: string) {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
}

const handler = NextAuth({
  debug: true,
  providers: [
    KeycloakProvider({
      clientId: process.env.GENERAL_USER_KEYCLOAK_CLIENT_ID,
      clientSecret: process.env.GENERAL_USER_KEYCLOAK_CLIENT_SECRET,
      issuer: process.env.GENERAL_USER_KEYCLOAK_CLIENT_ISSUER,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token = Object.assign({}, token, { access_token: account.access_token })
      }
      return token
    },
    async session({ session, token }) {
      if (session) {
        const tokenData: KeycloakProfileToken = parseJwt(token.access_token)
        session.user = Object.assign({}, session.user, {
          nickname: tokenData.nickname,
        })
      }
      return session
    },
  },
})

export { handler as GET, handler as POST }
