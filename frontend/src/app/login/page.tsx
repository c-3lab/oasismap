'use client'
import React from 'react'
import { Button, Typography, Grid } from '@mui/material'
import { signIn } from 'next-auth/react'

const Login: React.FC = () => {
  return (
    <Grid container justifyContent="center" alignItems="center" sx={{ px: 2 }}>
      <Grid item xs={12} md={8}>
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
            sx={{ my: 2, textTransform: 'none' }}
            onClick={() =>
              signIn('general-user-keycloak-client', {
                callbackUrl: '/happiness/me',
              })
            }
          >
            Google
          </Button>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default Login
