'use client'
import dynamic from 'next/dynamic'
import { useState, useEffect, useContext, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Button, ButtonGroup, Grid } from '@mui/material'
import { PeriodType } from '@/types/period'
import { MessageType } from '@/types/message-type'
import { ResponsiveContainer } from 'recharts'
const Map = dynamic(() => import('@/components/map/map'), { ssr: false })
import { GetPin } from '@/components/utils/pin'
import { graphColors } from '@/theme/color'
import {
  DateTimeTextbox,
  useDateTimeProps,
} from '@/components/fields/date-time-textbox'

const BarGraph = dynamic(() => import('@/components/happiness/bar-graph'), {
  ssr: false,
})
import { myHappinessData, sumByTimestamp } from '@/libs/graph'
import { messageContext } from '@/contexts/message-context'
import { ERROR_TYPE } from '@/libs/constants'
import { fetchData } from '@/libs/fetch'
import { toDateTime } from '@/libs/date-converter'
import { useTokenFetchStatus } from '@/hooks/token-fetch-status'
import { happinessSet } from '@/types/happiness-set'
import { Pin } from '@/types/pin'

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

const highlight = (pin:any, period:PeriodType) => {
  if (pin === null) return null
  const timestamp = pin.timestamp
  const date = new Date(timestamp)
  if (period === PeriodType.Month) {
    // 直近1年以内なら
    if (date > new Date(new Date().getTime() - 365 * 24 * 60 * 60 * 1000)) {
      return date.getMonth() + 1
    }
  } else if (period === PeriodType.Day) {
    // 直近1ヶ月以内なら
    if (date > new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000)) {
      return date.getDate()
    }
  } else if (period === PeriodType.Time) {
    // 直近24時間以内なら
    if (date > new Date(new Date().getTime() - 24 * 60 * 60 * 1000)) {
      return date.getHours()
    }
  }
}

const getActiveTimestamp = (activeMonthDayHour: number | null, period:PeriodType) => {
  if (activeMonthDayHour === null) return null
  const nowYear = new Date().getFullYear()
  const nowMonth = new Date().getMonth() + 1
  const nowMonthIndex = nowMonth - 1
  const nowDate = new Date().getDate()
  const nowHour = new Date().getHours()
  if (period === PeriodType.Month) {
    const activeMonth = activeMonthDayHour
    const activeMonthIndex = activeMonth - 1
    if (activeMonth <= nowMonth) {
      return {
        start: new Date(nowYear, activeMonthIndex, 1),
        end: new Date(nowYear, activeMonthIndex + 1, 0, 23, 59, 59),
      }
    } else {
      return {
        start: new Date(nowYear - 1, activeMonthIndex, 1),
        end: new Date(nowYear - 1, activeMonthIndex + 1, 0, 23, 59, 59),
      }
    }
  } else if (period === PeriodType.Day) {
    const activeDay = activeMonthDayHour
    if (activeDay <= nowDate) {
      return {
        start: new Date(nowYear, nowMonthIndex, activeDay, 0, 0, 0),
        end: new Date(nowYear, nowMonthIndex, activeDay, 23, 59, 59),
      }
    } else {
      return {
        start: new Date(nowYear, nowMonthIndex - 1, activeDay, 0, 0, 0),
        end: new Date(nowYear, nowMonthIndex - 1, activeDay, 23, 59, 59),
      }
    }
  } else if (period === PeriodType.Time) {
    const activeHour = activeMonthDayHour
    if (activeHour <= nowHour) {
      return {
        start: new Date(nowYear, nowMonthIndex, nowDate, activeHour, 0, 0),
        end: new Date(nowYear, nowMonthIndex, nowDate, activeHour, 59, 59),
      }
    } else {
      return {
        start: new Date(nowYear, nowMonthIndex, nowDate - 1, activeHour, 0, 0),
        end: new Date(nowYear, nowMonthIndex, nowDate - 1, activeHour, 59, 59),
      }
    }
  }
}

const HappinessMe: React.FC = () => {
  const noticeMessageContext = useContext(messageContext)
  const router = useRouter()
  const [period, setPeriod] = useState(PeriodType.Month)
  const [pinData, setPinData] = useState<any>([])
  const [isFetching, setIsfetching] = useState(false)
  const willStop = useRef(false)
  const [MyHappiness, setMyHappiness] = useState<any>([])
  const { isTokenFetched } = useTokenFetchStatus()
  const { startProps, endProps, updatedPeriod } = useDateTimeProps(period)
  const { update } = useSession()
  const [ clickedPin, setClickedPin ] = useState<Pin | null>(null)
  const [activeMonthDayHour, setActiveMonthDayHour] = useState<number | null>(null)

  const getData = async () => {
    try {
      willStop.current = false
      setIsfetching(true)
      setPinData([])
      setMyHappiness([])
      setClickedPin(null)
      setActiveMonthDayHour(null)

      const url = backendUrl + '/api/happiness/me'
      const startDateTime = toDateTime(startProps.value).toISO()
      const endDateTime = toDateTime(endProps.value).endOf('minute').toISO()
      // 日付の変換に失敗した場合
      if (!startDateTime || !endDateTime) {
        console.error('Date conversion failed.')
        return
      }

      const limit = 1000
      let offset = 0
      while (!willStop.current) {
        // アクセストークンを再取得
        const updatedSession = await update()

        const data = await fetchData(
          url,
          {
            start: startDateTime,
            end: endDateTime,
            limit: limit,
            offset: offset,
          },
          updatedSession?.user?.accessToken!
        )
        if (data['count'] === 0) break

        setPinData((prevPinData: Pin[]) => [
          ...prevPinData,
          ...GetPin(data['data']),
        ])
        setMyHappiness((prevHappiness: happinessSet) => {
          const nextHappiness = myHappinessData(data['data'])
          if (Object.keys(prevHappiness).length === 0) return nextHappiness
          return {
            month: sumByTimestamp([
              ...prevHappiness['month'],
              ...nextHappiness['month'],
            ]),
            day: sumByTimestamp([
              ...prevHappiness['day'],
              ...nextHappiness['day'],
            ]),
            time: sumByTimestamp([
              ...prevHappiness['time'],
              ...nextHappiness['time'],
            ]),
          }
        })

        offset += data['count']
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      if (error instanceof Error && error.message === ERROR_TYPE.UNAUTHORIZED) {
        noticeMessageContext.showMessage(
          '再ログインしてください',
          MessageType.Error
        )
        signOut({ redirect: false })
        router.push('/login')
      } else {
        noticeMessageContext.showMessage(
          '幸福度の検索に失敗しました',
          MessageType.Error
        )
      }
    } finally {
      setIsfetching(false)
    }
  }

  useEffect(() => {
    if (!isTokenFetched) return
    getData()

    return () => {
      willStop.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTokenFetched, updatedPeriod])

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
    <Grid container sx={{ paddingBottom: { xs: '50px', md: '0px' } }}>
      <Grid
        container
        item
        xs={12}
        md={6}
        sx={{ height: { xs: '50vh', md: 'calc(100vh - 64px)' } }}
      >
        <Map
          pointEntities={[]}
          surfaceEntities={[]}
          fiware={{ servicePath: '', tenant: '' }}
          iconType="pin"
          pinData={pinData}
          setClickedPin={setClickedPin}
          activeTimestamp={getActiveTimestamp(activeMonthDayHour, period)}
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
            <BarGraph
              plotdata={MyHappiness[period]}
              color={graphColors}
              xTickFormatter={renderCustomDayTick}
              highlight={
                clickedPin !== null ? highlight(clickedPin, period) : null
              }
              activeMonthDayHour={activeMonthDayHour}
              setActiveMonthDayHour={setActiveMonthDayHour}
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
                disabled={isFetching}
              >
                月
              </Button>
              <Button
                key="day"
                variant={period === PeriodType.Day ? 'contained' : 'outlined'}
                onClick={() => {
                  setPeriod(PeriodType.Day)
                }}
                disabled={isFetching}
              >
                日
              </Button>
              <Button
                key="time"
                variant={period === PeriodType.Time ? 'contained' : 'outlined'}
                onClick={() => {
                  setPeriod(PeriodType.Time)
                }}
                disabled={isFetching}
              >
                時間
              </Button>
            </ButtonGroup>
          </Grid>
          <Grid item xs={12} md={12} lg={8}>
            <DateTimeTextbox
              dateLabel="開始日"
              timeLabel="時間"
              period={period}
              disabled={isFetching}
              {...startProps}
            />
          </Grid>
          <Grid item xs={12} md={12} lg={8}>
            <DateTimeTextbox
              dateLabel="終了日"
              timeLabel="時間"
              period={period}
              disabled={isFetching}
              {...endProps}
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
                disabled={isFetching}
              >
                検索
              </Button>
            </Grid>
          </Grid>
          <Grid
            item
            md={12}
            lg={8}
            sx={{
              position: { xs: 'fixed', md: 'static' },
              bottom: { xs: '10px', md: 'auto' },
              left: { xs: '10px', md: 'auto' },
              right: { xs: '10px', md: 'auto' },
            }}
          >
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
