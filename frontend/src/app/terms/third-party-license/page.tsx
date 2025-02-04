'use client'
import React from 'react'
import { Grid, Typography, Link } from '@mui/material'

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
          <Typography variant="h4">
            サードパーティ
            <br />
            ライセンス
          </Typography>
        </Grid>
        <Grid item textAlign="left" sx={{ my: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            OpenStreetMap&apos;s Standard tile layer
          </Typography>
          <Link variant="body1" href="http://osm.org/copyright">
            © OpenStreetMap
          </Link>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Vector Map Level 0
          </Typography>
          <Link
            variant="body1"
            href="https://maps.gsi.go.jp/development/ichiran.html"
          >
            出典：地理院タイル「Shoreline data is derived from: United States.
            National Imagery and Mapping Agency. \Vector Map Level 0 (VMAP0).\
            Bethesda, MD: Denver, CO: The Agency; USGS Information Services,
            1997.」
          </Link>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default PrivacyPolicy
