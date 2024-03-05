'use client'
import React from 'react'
import { Grid, Typography } from '@mui/material'

const PrivacyPolicy: React.FC = () => {
  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      sx={{ px: '32px' }}
    >
      <Grid item xs={12} md={6}>
        <Grid item textAlign="center" sx={{ my: 2 }}>
          <Typography variant="h3">
            プライバシーポリシー
          </Typography>
        </Grid>
        <Grid item textAlign="left" sx={{ my: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold'}}>
            第１条
          </Typography>
          <Typography variant="body1">
            プライバシーポリシーの内容
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            第２条
          </Typography>
          <Typography variant="body1">
            プライバシーポリシーの内容
          </Typography>
        </Grid>
        <Grid item textAlign="right">
          <Typography variant="body1">yyyy年m月d日 制定</Typography>
          <Typography variant="body1">yyyy年m月d日 最終改定</Typography>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default PrivacyPolicy
