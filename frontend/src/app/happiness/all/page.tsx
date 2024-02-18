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

import { LineGraph } from '@/components/happiness/graph'
import data from './ourHappiness.json'

const pinData = GetPin(data)

interface happinessObj {
  timestamp: any
  happiness1: number
  happiness2: number
  happiness3: number
  happiness4: number
  happiness5: number
  happiness6: number
  averageQ1: number
  averageQ2: number
  averageQ3: number
  averageQ4: number
  averageQ5: number
  averageQ6: number
}

function mergeWithTime(
  objects: {
    timestamp: number
    latitude: number
    longitude: number
    answers: {
      happiness1: number
      happiness2: number
      happiness3: number
      happiness4: number
      happiness5: number
      happiness6: number
    }
  }[],
  start: number,
  end: number,
  currentTime: number
): happinessObj[] {
  const sortedObjects = objects.sort((a, b) => a.timestamp - b.timestamp)
  const result: happinessObj[] = []

  for (let timestamp = start; timestamp <= end; timestamp++) {
    const matchingObjects = sortedObjects.filter(
      (obj) => obj.timestamp === timestamp
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

      const averageQ1 = (Q1 / matchingObjects.length).toFixed(1)
      const averageQ2 = (Q2 / matchingObjects.length).toFixed(1)
      const averageQ3 = (Q3 / matchingObjects.length).toFixed(1)
      const averageQ4 = (Q4 / matchingObjects.length).toFixed(1)
      const averageQ5 = (Q5 / matchingObjects.length).toFixed(1)
      const averageQ6 = (Q6 / matchingObjects.length).toFixed(1)

      result.push({
        timestamp,
        happiness1: Q1,
        happiness2: Q2,
        happiness3: Q3,
        happiness4: Q4,
        happiness5: Q5,
        happiness6: Q6,
        averageQ1: parseFloat(averageQ1),
        averageQ2: parseFloat(averageQ2),
        averageQ3: parseFloat(averageQ3),
        averageQ4: parseFloat(averageQ4),
        averageQ5: parseFloat(averageQ5),
        averageQ6: parseFloat(averageQ6),
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
        averageQ1: 0,
        averageQ2: 0,
        averageQ3: 0,
        averageQ4: 0,
        averageQ5: 0,
        averageQ6: 0,
      })
    }
  }
  const currentIndex = result.findIndex((obj) => obj.timestamp === currentTime)
  if (currentIndex !== -1) {
    result.unshift(...result.splice(currentIndex, result.length - currentIndex))
  }

  return result
}

const now = DateTime.local()
//折れ線グラフ用データ
const ourHappiness = [
  mergeWithTime(
    data.map((obj) => ({
      ...obj,
      timestamp: Number(DateTime.fromISO(obj.timestamp).toFormat('MM')),
    })),
    1,
    12,
    now.month
  ),
  mergeWithTime(
    data.map((obj) => ({
      ...obj,
      timestamp: Number(DateTime.fromISO(obj.timestamp).toFormat('dd')),
    })),
    1,
    31,
    now.day
  ),
  mergeWithTime(
    data.map((obj) => ({
      ...obj,
      timestamp: Number(DateTime.fromISO(obj.timestamp).toFormat('HH')),
    })),
    0,
    23,
    now.hour
  ),
]

const HappinessAll: React.FC = () => {
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
            <LineGraph
              plotdata={ourHappiness[period]}
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
