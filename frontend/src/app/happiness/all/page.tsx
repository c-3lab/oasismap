'use client'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import { Button, ButtonGroup, Container, Grid } from '@mui/material'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'

import LoggedinHeader from '@/components/header/loggedin'
import SidebarHeader from '@/components/sidebar/header'
import GeneralSidebar from '@/components/sidebar/general'
import Main from '@/components/main'
import DateTimeTextbox from '@/components/textbox/datetime'
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

  type PeriodType = 'month' | 'day' | 'time'
  const [period, setPeriod] = useState<PeriodType>('month')

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <LoggedinHeader
        drawerWidth={drawerWidth}
        open={open}
        handleDrawerOpen={handleDrawerOpen}
      />
      <Main drawerWidth={drawerWidth}>
        <SidebarHeader />
        <Container maxWidth={false} sx={{ px: { xs: 0, md: 0 } }}>
          <Grid container>
            <Grid
              container
              item
              xs={12}
              md={6}
              sx={{ height: { xs: '50vh', md: '90vh' } }}
            >
              <Grid item xs={12} md={12}>
                <Map
                  pointEntities={[]}
                  surfaceEntities={[]}
                  fiware={{ servicePath: '', tenant: '' }}
                />
              </Grid>
            </Grid>
            <Grid
              container
              item
              xs={12}
              md={6}
              rowSpacing={4}
              columnSpacing={1}
              justifyContent={'center'}
              sx={{ px: { md: '16px' }, mt: { xs: '32px', md: 0 } }}
            >
              <Grid
                item
                xs={12}
                md={12}
                sx={{
                  backgroundColor: '#a0a0a0',
                  height: '300px',
                }}
              >
                グラフ表示エリア
              </Grid>
              <Grid
                container
                item
                justifyContent="center"
                rowSpacing={4}
                columnSpacing={1}
              >
                <Grid item xs={12} lg={8}>
                  <ButtonGroup
                    size="large"
                    aria-label="large button group"
                    fullWidth
                  >
                    <Button key="month" onClick={() => setPeriod('month')}>
                      月
                    </Button>
                    <Button key="day" onClick={() => setPeriod('day')}>
                      日
                    </Button>
                    <Button key="time" onClick={() => setPeriod('time')}>
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
                <Grid item xs={8} lg={5} />
                <Grid item xs={4} lg={3}>
                  <Button variant="outlined" color="secondary" fullWidth>
                    検索
                  </Button>
                </Grid>
                <Grid item xs={12} lg={8}>
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
