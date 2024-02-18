'use client'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, ButtonGroup, Grid } from '@mui/material'
import { PeriodType } from '@/types/period'
import { DateTime } from 'luxon'
import { ResponsiveContainer } from 'recharts'
//import Map from '@/components/happiness/map'
const MapSet = dynamic(() => import('@/components/map/mapset'), { ssr: false })
import { GetPin, COLORS } from '@/components/utils/pin'
import {
  DateTimeTextbox,
  useDateTime,
} from '@/components/fields/date-time-textbox'

import { BPlot } from '@/components/happiness/graph'
import data from './myHappiness.json'

const pinData = GetPin(data)

interface happinessObj {
  timestamp: any
  happiness1: number
  happiness2: number
  happiness3: number
  happiness4: number
  happiness5: number
  happiness6: number
}

interface dataObj {
  id: string
  type: string
  timestamp: number
  location: {
    type: string
    value: {
      type: string
      coordinates: [number, number]
    }
  }
  answers: {
    happiness1: number
    happiness2: number
    happiness3: number
    happiness4: number
    happiness5: number
    happiness6: number
  }
}

function mergeWithTime(
  objects: dataObj[],
  start: number,
  end: number,
  currentTime: number,
  format: string
): happinessObj[] {
  const sortedObjects = objects
    .sort((a, b) => a.timestamp - b.timestamp)
    .filter((h) => h.type == 'happiness1')
    .map((obj) => ({
      ...obj,
      roundTimestamp: DateTime.fromISO(obj.timestamp).toFormat(format),
    }))

  const result: happinessObj[] = []

  for (let timestamp = start; timestamp <= end; timestamp++) {
    const matchingObjects = sortedObjects.filter(
      (obj) => Number(obj.roundTimestamp) === timestamp
    )
    if (matchingObjects.length > 0) {
      const Q1 = matchingObjects.reduce(
        (acc, obj) => acc + obj.answers.happiness1,
        0
      )
      const Q2 = matchingObjects.reduce(
        (acc, obj) => acc + obj.answers.happiness2,
        0
      )
      const Q3 = matchingObjects.reduce(
        (acc, obj) => acc + obj.answers.happiness3,
        0
      )
      const Q4 = matchingObjects.reduce(
        (acc, obj) => acc + obj.answers.happiness4,
        0
      )
      const Q5 = matchingObjects.reduce(
        (acc, obj) => acc + obj.answers.happiness5,
        0
      )
      const Q6 = matchingObjects.reduce(
        (acc, obj) => acc + obj.answers.happiness6,
        0
      )

      result.push({
        timestamp,
        happiness1: Q1,
        happiness2: Q2,
        happiness3: Q3,
        happiness4: Q4,
        happiness5: Q5,
        happiness6: Q6,
      })
    } else {
      result.push({
        timestamp,
        happiness1: 0,
        happiness2: 0,
        happiness3: 0,
        happiness4: 0,
        happiness5: 0,
        happiness6: 0,
      })
    }
  }
  const currentIndex = result.findIndex(
    (obj) => Number(obj.timestamp) === currentTime
  )
  if (currentIndex !== -1) {
    result.unshift(...result.splice(currentIndex, result.length - currentIndex))
  }

  return result
}

const now = DateTime.local()
//積み上げ棒グラフ用データ
const MyHappiness = {
  month: mergeWithTime(data, 1, 12, now.month, 'MM'),
  day: mergeWithTime(data, 1, 31, now.day, 'dd'),
  time: mergeWithTime(data, 0, 23, now.hour, 'HH'),
}

const HappinessMe: React.FC = () => {
  const router = useRouter()
  const [period, setPeriod] = useState(PeriodType.Month)

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
            <BPlot
              plotdata={MyHappiness[period]}
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
              onClick={() => router.push('/happiness/input?referral=me')}
            >
              幸福度を入力
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default HappinessMe
