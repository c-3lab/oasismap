import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      accessToken?: string
      nickname?: string
      type?: string
      realm_access?: {
        roles?: string[]
      }
    } & DefaultSession['user']
    error?: string
  }
}
