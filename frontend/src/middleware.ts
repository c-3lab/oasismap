import { withAuth } from 'next-auth/middleware'

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
      if (!Object.keys(paths).includes(req.nextUrl.pathname)) {
        return false
      }
      const permissions = paths[req.nextUrl.pathname]
      const userType = token?.userType as 'general' | 'admin'
      return permissions.includes('pubilc') || permissions.includes(userType)
    },
  },
})
