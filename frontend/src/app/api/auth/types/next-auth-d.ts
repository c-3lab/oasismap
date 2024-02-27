import { DefaultSession } from 'next-auth'
import { JwtPayload } from "jsonwebtoken";
// import { KeycloakProfile } from 'keycloak-js'

declare module 'next-auth' {
  interface Session {
    user: {
      nickname?: string
    } & DefaultSession['user']
  }
}

declare module 'jsonwebtoken' {
  export interface CustomizeJwtPayload extends JwtPayload {
    nickname: string
  }
}

// declare module 'next-auth/providers/keycloak' {
//   export interface KeycloakProfileToken extends KeycloakProfile {
//     realm_access: { roles: [string] }
//   }
// }
