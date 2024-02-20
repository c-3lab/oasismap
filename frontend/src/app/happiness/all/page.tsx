'use client'
import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, ButtonGroup, Grid } from '@mui/material'
import { PeriodType } from '@/types/period'
import { ResponsiveContainer } from 'recharts'
//import Map from '@/components/happiness/map'
const MapSet = dynamic(() => import('@/components/map/mapset'), { ssr: false })
import { GetPin, COLORS } from '@/components/utils/pin'
import {
  DateTimeTextbox,
  useDateTime,
} from '@/components/fields/date-time-textbox'

import { LineGraph, ourHappinessData } from '@/components/happiness/graph'

const HappinessAll: React.FC = () => {
  const router = useRouter()
  const [period, setPeriod] = useState(PeriodType.Month)
  const [pinData, setPinData] = useState<any>([])
  const [OurHappiness, setOurHappiness] = useState<any>([])

  useEffect(() => {
    Start()
  }, [])

  const Start = async () => {
    const backendUrl = 'http://localhost:8000/api/happiness/all'

    try {
      const response = await fetch(`${backendUrl}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      const pinDataResult = GetPin(data)
      const OurHappinessResult = ourHappinessData(data)

      setPinData(pinDataResult)
      setOurHappiness(OurHappinessResult)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const startDateTimeProps = useDateTime({
    date: '2024-01-26',
    time: '09:00',
  })
  const endDateTimeProps = useDateTime({
    date: '2024-01-27',
    time: '12:00',
  })

  const renderCustomDayTick = (tickProps: any) => {
    const { x, y, payload } = tickProps
    const hour = payload.value
    if (hour % 2 === 0) {
      return (
        <text x={x} y={y} dy={16} fill="#666" textAnchor="middle">
          {hour}
        </text>
      )
    }
    return null
  }

  const handleSearch = async () => {
    const backendUrl = 'http://localhost:8000/api/happiness/all'

    try {
      const response = await fetch(`${backendUrl}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      const pinDataResult = GetPin(data)
      const ourHappinessResult = ourHappinessData(data)

      setPinData(pinDataResult)
      setOurHappiness(ourHappinessResult)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  return (
    <Grid container>
      <Grid
        container
        item
        xs={12}
        md={6}
        sx={{ height: { xs: '50vh', md: 'calc(100vh - 64px)' } }}
      >
        <MapSet
          pointEntities={[]}
          surfaceEntities={[]}
          fiware={{ servicePath: '', tenant: '' }}
          pinData={pinData}
        />
      </Grid>
      <Grid
        container
        item
        xs={12}
        md={6}
        rowSpacing={4}
        columnSpacing={1}
        justifyContent={'center'}
        sx={{ px: { md: '16px' }, my: { xs: '32px', md: 0 } }}
      >
        <Grid
          item
          xs={12}
          md={12}
          sx={{
            backgroundColor: '#FFFFFF',
            minHeight: '300px',
          }}
        >
          グラフ表示エリア
          <ResponsiveContainer width="100%" height={300}>
            <LineGraph
              plotdata={OurHappiness[period]}
              title="時間"
              color={COLORS}
              xTickFormatter={renderCustomDayTick}
            />
          </ResponsiveContainer>
        </Grid>
        <Grid
          container
          justifyContent="center"
          rowSpacing={4}
          columnSpacing={1}
          sx={{ px: { xs: '16px', md: 0 }, my: { xs: '0px' } }}
        >
          <Grid item xs={12} md={12} lg={8}>
            <ButtonGroup size="large" aria-label="large button group" fullWidth>
              <Button
                key="month"
                variant={period === PeriodType.Month ? 'contained' : 'outlined'}
                onClick={() => {
                  setPeriod(PeriodType.Month)
                }}
              >
                月
              </Button>
              <Button
                key="day"
                variant={period === PeriodType.Day ? 'contained' : 'outlined'}
                onClick={() => {
                  setPeriod(PeriodType.Day)
                }}
              >
                日
              </Button>
              <Button
                key="time"
                variant={period === PeriodType.Time ? 'contained' : 'outlined'}
                onClick={() => {
                  setPeriod(PeriodType.Time)
                }}
              >
                時間
              </Button>
            </ButtonGroup>
          </Grid>
          <Grid item xs={12} md={12} lg={8}>
            <DateTimeTextbox
              dateLabel="開始日"
              timeLabel="時間"
              {...startDateTimeProps}
            />
          </Grid>
          <Grid item xs={12} md={12} lg={8}>
            <DateTimeTextbox
              dateLabel="終了日"
              timeLabel="時間"
              {...endDateTimeProps}
            />
          </Grid>
          <Grid container item xs={12} md={12} lg={8} columnSpacing={1}>
            <Grid item xs={8} md={8} />
            <Grid item xs={4} md={4}>
              <Button
                variant="outlined"
                fullWidth
                sx={{ borderColor: 'primary.light' }}
                onClick={handleSearch}
              >
                検索
              </Button>
            </Grid>
          </Grid>
          <Grid item xs={12} md={12} lg={8}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              onClick={() => router.push('/happiness/input?referral=all')}
            >
              幸福度を入力
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default HappinessAll
