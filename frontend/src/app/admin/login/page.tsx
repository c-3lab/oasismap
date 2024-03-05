'use client'
import { useEffect } from 'react'
import { signIn } from 'next-auth/react'

export default function Login() {
  useEffect(() => {
    signIn('admin-keycloak-client', { callbackUrl: '/happiness/all' })
  }, [])

  return <></>
}
