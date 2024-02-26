import { DefaultSession } from 'next-auth'
import { KeycloakProfile } from 'keycloak-js'

declare module 'next-auth' {
  interface Session {
    user: {
      nickname?: string
    } & DefaultSession['user']
  }
}

declare module 'next-auth/providers/keycloak' {
  export interface KeycloakProfileToken extends KeycloakProfile {
    realm_access: { roles: [string] }
  }
}
