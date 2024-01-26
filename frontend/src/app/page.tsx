'use client'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import { Button, ButtonGroup, Container, Grid } from '@mui/material'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'

import LoggedinHeader from '@/component/header/loggedin'
import SidebarHeader from '@/component/sidebar/header'
import GeneralSidebar from '@/component/sidebar/general'
import Main from '@/component/main'
import DateTimeTextbox from '@/component/textbox/datetime'
import useDateTimeText from '@/hooks/textbox/datetime'

const Map = dynamic(
  () => import('starseeker-frontend').then((module) => module.Map),
  { ssr: false }
)

const Home: React.FC = () => {
  const drawerWidth = 240

  const [open, setOpen] = useState(false)

  const startDateTime = useDateTimeText({
    date: '2024-01-26',
    time: '09:00',
  })
  const endDateTime = useDateTimeText({
    date: '2024-01-27',
    time: '12:00',
  })

  const handleDrawerOpen = () => {
    setOpen(true)
  }

  const handleDrawerClose = () => {
    setOpen(false)
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <LoggedinHeader
        drawerWidth={drawerWidth}
        open={open}
        handleDrawerOpen={handleDrawerOpen}
      />
      <Main drawerWidth={drawerWidth}>
        <SidebarHeader />
        <Map
          pointEntities={[]}
          surfaceEntities={[]}
          fiware={{ servicePath: '', tenant: '' }}
        />
        <Container maxWidth="xs" sx={{ paddingTop: '32px' }}>
          <Grid container rowSpacing={4} columnSpacing={1} wrap="wrap">
            <Grid item xs={12}>
              <ButtonGroup
                size="large"
                aria-label="large button group"
                fullWidth
              >
                <Button key="month" onClick={() => {}}>
                  月
                </Button>
                <Button key="day" onClick={() => {}}>
                  日
                </Button>
                <Button key="time" onClick={() => {}}>
                  時間
                </Button>
              </ButtonGroup>
            </Grid>
            <DateTimeTextbox
              dateLabel="開始日"
              timeLabel="時間"
              value={startDateTime.dateTimeText}
              onChange={startDateTime.onChangeInputValue}
            />
            <DateTimeTextbox
              dateLabel="終了日"
              timeLabel="時間"
              value={endDateTime.dateTimeText}
              onChange={endDateTime.onChangeInputValue}
            />
          </Grid>
          <Grid
            container
            columnSpacing={1}
            justifyContent="flex-end"
            sx={{
              paddingTop: '16px',
            }}
          >
            <Grid item xs={4}>
              <Button variant="outlined" color="secondary" fullWidth>
                検索
              </Button>
            </Grid>
          </Grid>
          <Grid container columnSpacing={1} sx={{ paddingTop: '32px' }}>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
              >
                幸福度を入力
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Main>
      <GeneralSidebar
        drawerWidth={drawerWidth}
        open={open}
        handleDrawerClose={handleDrawerClose}
      />
    </Box>
  )
}

export default Home
