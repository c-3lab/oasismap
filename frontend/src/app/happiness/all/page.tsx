'use client'
import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { DateTime } from 'luxon'
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
import fetchData from '@/libs/fetch'
import { PROFILE_TYPE } from '@/libs/constants'
import { toDateTime } from '@/libs/date-converter'

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

const HappinessAll: React.FC = () => {
  const router = useRouter()
  const [period, setPeriod] = useState(PeriodType.Month)
  const [pinData, setPinData] = useState<any>([])
  const [OurHappiness, setOurHappiness] = useState<any>([])
  const [isLoading, setIsLoading] = useState(true)
  const { data: session, status } = useSession()

  const defaultStart = DateTime.local().minus({ days: 1 })
  const defaultEnd = DateTime.local()

  const getData = async () => {
    try {
      const url = backendUrl + '/api/happiness/all'
      const startDateTime = toDateTime(startDateTimeProps.value).toISO()
      const endDateTime = toDateTime(endDateTimeProps.value)
        .endOf('minute')
        .toISO()
      // 日付の変換に失敗した場合
      if (!startDateTime || !endDateTime) {
        console.error('Date conversion failed.')
        return
      }
      const data = await fetchData(url, {
        start: startDateTime,
        end: endDateTime,
        period: period,
        zoomLevel: parseInt(process.env.NEXT_PUBLIC_MAP_DEFAULT_ZOOM!) || 13,
      })
      setPinData(GetPin(data['map_data']))
      setOurHappiness(ourHappinessData(data['graph_data']))
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  useEffect(() => {
    return setIsLoading(false)
  }, [])

  useEffect(() => {
    if (isLoading) return
    if (status !== 'authenticated') return
    getData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, status])

  const startDateTimeProps = useDateTime({
    date: defaultStart.toFormat('yyyy-MM-dd'),
    time: defaultStart.toFormat('HH:mm'),
  })
  const endDateTimeProps = useDateTime({
    date: defaultEnd.toFormat('yyyy-MM-dd'),
    time: defaultEnd.toFormat('HH:mm'),
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
                onClick={getData}
              >
                検索
              </Button>
            </Grid>
          </Grid>
          {session?.user!.type === PROFILE_TYPE.GENERAL && (
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
