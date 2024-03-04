'use client'
import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button, ButtonGroup, Grid } from '@mui/material'
import { PeriodType } from '@/types/period'
import { ResponsiveContainer } from 'recharts'
const MapSet = dynamic(() => import('@/components/map/mapset'), { ssr: false })
import { GetPin, COLORS } from '@/components/utils/pin'
import {
  DateTimeTextbox,
  useDateTime,
} from '@/components/fields/date-time-textbox'

import { LineGraph, ourHappinessData } from '@/components/happiness/graph'
import fetchData from '@/components/happiness/fetch'
import { PROFILE_TYPE } from '@/libs/constants'
import { current, previous, toISO8601 } from '@/libs/date-format'
const backendurl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/happiness/all`

const HappinessAll: React.FC = () => {
  const router = useRouter()
  const [period, setPeriod] = useState(PeriodType.Month)
  const [pinData, setPinData] = useState<any>([])
  const [OurHappiness, setOurHappiness] = useState<any>([])
  const { data: session } = useSession()

  const defaultStart = previous()
  const defaultEnd = current()

  const getData = async () => {
    try {
      const params = {
        start: toISO8601(startDateTimeProps.value),
        end: toISO8601(endDateTimeProps.value),
        period: period,
        zoomLevel: 12,
      }
      const data = await fetchData(
        backendurl,
        session?.user!.accessToken!,
        params
      )
      setPinData(GetPin(data['map_data']))
      setOurHappiness(ourHappinessData(data['graph_data']))
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  useEffect(() => {
    if (!session) return
    getData()
  }, [session])

  const startDateTimeProps = useDateTime({
    date: defaultStart.date,
    time: defaultStart.time,
  })
  const endDateTimeProps = useDateTime({
    date: defaultEnd.date,
    time: defaultEnd.time,
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
          <ResponsiveContainer width="100%" height={300}>
            <LineGraph
              plotdata={OurHappiness[period]}
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
                onClick={getData}
              >
                検索
              </Button>
            </Grid>
          </Grid>
          {session?.user?.type === PROFILE_TYPE.GENERAL && (
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
          )}
        </Grid>
      </Grid>
    </Grid>
  )
}

export default HappinessAll
