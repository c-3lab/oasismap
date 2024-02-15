'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { Button, Typography, Grid } from '@mui/material'

const Login: React.FC = () => {
  const router = useRouter()

  return (
    <Grid container justifyContent="center" alignItems="center">
      <Grid item xs={11} md={8}>
        <Typography variant="h5" align="center" sx={{ my: 6 }}>
          OASISMap
        </Typography>
        <Grid item xs={12} sx={{ p: 3, border: '1px solid' }}>
          <Typography variant="subtitle1" align="center">
            Googleアカウントでログイン
          </Typography>
          <Button
            variant="outlined"
            fullWidth
            sx={{ mt: 2, mb: 2, textTransform: 'none' }}
            onClick={() => router.push(`/happiness/me`)}
          >
            Google
          </Button>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default Login
