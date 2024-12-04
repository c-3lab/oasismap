'use client'
import React, { Suspense } from 'react'
import { Grid, CircularProgress } from '@mui/material'
import Layout from '@/components/layout'
import { SessionProvider } from 'next-auth/react'
import TokenChecker from '@/components/utils/token-checker'
import { LoadingProvider } from '@/components/spinner'

export default function HappinessLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
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
      <Layout>
        <LoadingProvider>{children}</LoadingProvider>
      </Layout>
      <SessionProvider refetchOnWindowFocus={false}>
        <TokenChecker />
      </SessionProvider>
    </Suspense>
  )
}
