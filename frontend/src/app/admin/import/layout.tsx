import React, { Suspense } from 'react'
import { Grid, CircularProgress } from '@mui/material'
import Layout from '@/components/layout'

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
            '@supports (min-height: 100dvh)': {
              minHeight: '100dvh',
            },
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
