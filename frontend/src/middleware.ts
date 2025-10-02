import { withAuth } from 'next-auth/middleware'
import { UserType } from './types/keycloak-roles'

type Permission = 'pubilc' | 'general' | 'admin'

const paths: Record<string, Permission[]> = {
  '/': ['pubilc'],
  '/login': ['pubilc'],
  '/terms/use': ['pubilc'],
  '/terms/privacy-policy': ['pubilc'],
  '/terms/third-party-license': ['pubilc'],
  '/happiness/me': ['general'],
  '/happiness/all': ['general', 'admin'],
  '/happiness/input': ['general'],
  '/happiness/list': ['general'],
  '/admin/login': ['pubilc'],
  '/admin/import': ['admin'],
}

export default withAuth({
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized: ({ token, req }) => {
      if (
        req.nextUrl.pathname.startsWith('/_next/') ||
        req.nextUrl.pathname.includes('.') ||
        req.nextUrl.pathname.startsWith('/happy') ||
        req.nextUrl.pathname.startsWith('/assets/')
      ) {
        return true
      }

      if (!Object.keys(paths).includes(req.nextUrl.pathname)) {
        return false
      }

      const permissions = paths[req.nextUrl.pathname]
      const userType = token?.userType as UserType
      if (permissions.includes('pubilc')) {
        return true
      }

      if (!token || token?.error) {
        return false
      }

      if (userType === UserType.GENERAL) {
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return false
        }
      }

      if (userType === UserType.ADMIN) {
        if (
          req.nextUrl.pathname === '/happiness/me' ||
          req.nextUrl.pathname === '/happiness/input' ||
          req.nextUrl.pathname === '/happiness/list'
        ) {
          return false
        }
      }

      return permissions.includes(userType)
    },
  },
})
