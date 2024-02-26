'use client'
import { signIn } from 'next-auth/react'

const Login: React.FC = () => {
  signIn('admin-keycloak-client', { callbackUrl: '/happiness/all' })

  return null
}

export default Login
