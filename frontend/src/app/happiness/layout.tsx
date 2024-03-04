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
