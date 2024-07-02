'use client'
import React, { Suspense, useEffect } from 'react'
import { Grid, CircularProgress } from '@mui/material'
import Layout from '@/components/layout'
import { useSession, signOut } from 'next-auth/react'

export default function HappinessLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { data: session, status, update } = useSession()

  useEffect(() => {
    const onVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        // タブのコンテンツが表示状態になった時の処理
        await update();
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [session, update]);

  useEffect(() => {
    if (session?.error === 'RefreshAccessTokenError') {
      signOut({ callbackUrl: '/login' })
    }
  }, [session,status]);

  return (
    <Suspense
      fallback={
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          sx={{
            minHeight: '100vh',
          }}
        >
          <CircularProgress />
        </Grid>
      }
    >
      <Layout>{children}</Layout>
    </Suspense>
  )
}
