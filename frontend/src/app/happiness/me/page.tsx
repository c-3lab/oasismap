'use client'
import dynamic from 'next/dynamic'
import { useState, useEffect, useContext, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { EntityByEntityId } from '@/types/entityByEntityId'
import { Data } from '@/types/happiness-me-response'

const BarGraph = dynamic(() => import('@/components/happiness/bar-graph'), {
  ssr: false,
})
import { myHappinessData, sumByTimestamp } from '@/libs/graph'
import { messageContext } from '@/contexts/message-context'
import { ERROR_TYPE } from '@/libs/constants'
import { useFetchData } from '@/libs/fetch'
import { toDateTime } from '@/libs/date-converter'
import { useTokenFetchStatus } from '@/hooks/token-fetch-status'
import { happinessSet } from '@/types/happiness-set'
import { HighlightTarget } from '@/types/highlight-target'
import { Pin } from '@/types/pin'
import { LoadingContext } from '@/contexts/loading-context'

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

function getSnackbarMessage(xAxisValue: number, period: PeriodType) {
  const date = new Date()
  let nowYear = date.getFullYear()
  let nowMonthIndex = date.getMonth()
  let nowMonth = nowMonthIndex + 1
  let nowDate = date.getDate()
  const nowHour = date.getHours()
  if (xAxisValue < 0) {
    return ''
  }

  switch (period) {
    case PeriodType.Month:
      // 現在の月数よりも大きい値の月数が指定された場合、指定された月は去年である
      if (nowMonth < xAxisValue) nowYear -= 1
      return `${nowYear}年${xAxisValue}月`

    case PeriodType.Day:
      // 現在の日数よりも大きい値の日数が指定された場合、指定された日にちは先月である
      if (nowDate < xAxisValue) nowMonthIndex -= 1
      return `${nowYear}年${nowMonth}月${xAxisValue}日`

    case PeriodType.Time:
      // 現在の時間よりも大きい値の時間が指定された場合、指定された時間は昨日である
      if (nowHour < xAxisValue) nowDate -= 1
      return `${nowYear}年${nowMonth}月${nowDate}日${xAxisValue}時`
  }
}

const HappinessMe: React.FC = () => {
  const noticeMessageContext = useContext(messageContext)
  const router = useRouter()
  const [period, setPeriod] = useState(PeriodType.Month)
  const [pinData, setPinData] = useState<Pin[]>([])
  const [entityByEntityId, setEntityByEntityId] = useState<EntityByEntityId>({})
  const willStop = useRef(false)
  const isMounted = useRef(false)
  const [MyHappiness, setMyHappiness] = useState<happinessSet>({
    month: [],
    day: [],
    time: [],
  })
  const { isTokenFetched } = useTokenFetchStatus()
  const searchParams = useSearchParams()
  const searchEntityId = searchParams.get('entityId')
  const timestamp = searchParams.get('timestamp')
  const { startProps, endProps, updatedPeriod } = useDateTimeProps(
    period,
    timestamp
  )
  const { update } = useSession()
  const { isLoading, setIsLoading } = useContext(LoadingContext)
  const { fetchData } = useFetchData()
  const [isLoaded, setIsLoaded] = useState(false)

  const [highlightTarget, setHighlightTarget] = useState<HighlightTarget>({
    lastUpdateBy: 'init',
    xAxisValue: null,
  })
  const [initialEntityId, setInitialEntityId] = useState<
    string | null | undefined
  >(undefined)
  if (searchEntityId && initialEntityId === undefined) {
    setInitialEntityId(searchEntityId)
  }

  const getData = async () => {
    try {
      setIsLoading(true)
      willStop.current = false
      setPinData([])
      setMyHappiness({ month: [], day: [], time: [] })
      setEntityByEntityId({})
      setHighlightTarget({ lastUpdateBy: 'init', xAxisValue: null })

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
        console.log('Frontend received data:', data);
        console.log('Data count:', data['count']);
        console.log('Data length:', data['data']?.length);
        
        if (data['count'] === 0 || data['data'].length === 0) {
          console.log('Breaking loop: count is 0 or data is empty');
          break;
        }
        
        console.log('About to call GetPin with data:', data['data'].length, 'items');
        console.log('Current offset:', offset);
        console.log('Total pins so far:', pinData.length);
        
        try {
          const newPins = GetPin(data['data']);
          console.log('New pins from GetPin:', newPins.length);
          console.log('First pin:', newPins[0]);
          
          setPinData((prevPinData: Pin[]) => {
            const updatedPinData = [...prevPinData, ...newPins];
            console.log('Updated pinData length:', updatedPinData.length);
            console.log('First pin in updated data:', updatedPinData[0]);
            return updatedPinData;
          })
        } catch (error) {
          console.error('Error in GetPin or setPinData:', error);
        }
        
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

        if (
          initialEntityId &&
          timestamp &&
          Object.keys(entityByEntityId).length === 0
        ) {
          setEntityByEntityId((prevEntityByEntityId: EntityByEntityId) => {
            const nextEntityByEntityId = { ...prevEntityByEntityId }
            data['data'].forEach((entity: Data) => {
              if (entity.answers[entity.type] === 0) return
              nextEntityByEntityId[entity['entityId']] = entity
            })
            return nextEntityByEntityId
          })
        }

        // Tăng offset theo số data thực tế nhận được
        offset += data['data'].length
        
        // Break ngay sau lần fetch đầu tiên vì backend trả về tất cả data
        console.log('Breaking loop: fetched all data in first request');
        break;
      }

      if (timestamp && Object.keys(entityByEntityId).length === 0) {
        noticeMessageContext.showMessage(
          startProps.value.date.replace(/-/g, '/') +
            ' ' +
            'のデータを表示しました',
          MessageType.Success
        )
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
      setIsLoading(false)
      setIsLoaded(true)
    }
  }

  useEffect(() => {
    isMounted.current = true

    return () => {
      isMounted.current = false
    }
  }, [])

  useEffect(() => {
    if (!isTokenFetched) return
    getData()

    return () => {
      willStop.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTokenFetched, updatedPeriod])

  useEffect(() => {
    if (highlightTarget.xAxisValue && highlightTarget.xAxisValue > 0) {
      noticeMessageContext.showMessage(
        `${getSnackbarMessage(highlightTarget.xAxisValue, period)}のデータをハイライトします`,
        MessageType.Success
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightTarget.xAxisValue])

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
          initialEntityId={initialEntityId}
          entityByEntityId={entityByEntityId}
          onPopupClose={() => {
            // 画面遷移時に発火させないため、マウント時のみクエリパラメータの削除を実行
            isMounted.current && router.replace('/happiness/me')
            setInitialEntityId(null)
          }}
          period={period}
          highlightTarget={highlightTarget}
          setHighlightTarget={setHighlightTarget}
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
              isLoaded={isLoaded}
              highlightTarget={highlightTarget}
              setHighlightTarget={setHighlightTarget}
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
                disabled={isLoading}
              >
                月
              </Button>
              <Button
                key="day"
                variant={period === PeriodType.Day ? 'contained' : 'outlined'}
                onClick={() => {
                  setPeriod(PeriodType.Day)
                }}
                disabled={isLoading}
              >
                日
              </Button>
              <Button
                key="time"
                variant={period === PeriodType.Time ? 'contained' : 'outlined'}
                onClick={() => {
                  setPeriod(PeriodType.Time)
                }}
                disabled={isLoading}
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
              disabled={isLoading}
              {...startProps}
            />
          </Grid>
          <Grid item xs={12} md={12} lg={8}>
            <DateTimeTextbox
              dateLabel="終了日"
              timeLabel="時間"
              period={period}
              disabled={isLoading}
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
                disabled={isLoading}
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