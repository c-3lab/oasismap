'use client'
import dynamic from 'next/dynamic'
import { useState, useEffect, useContext, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, ButtonGroup, Grid, Box } from '@mui/material'
import { PeriodType } from '@/types/period'
import { MessageType } from '@/types/message-type'
import { ResponsiveContainer } from 'recharts'
const Map = dynamic(() => import('@/components/map/map'), { ssr: false })
import { graphColors } from '@/theme/color'
import {
  DateTimeTextbox,
  useDateTimeProps,
} from '@/components/fields/date-time-textbox'

const BarGraph = dynamic(() => import('@/components/happiness/bar-graph'), {
  ssr: false,
})
import { messageContext } from '@/contexts/message-context'
import { useTokenFetchStatus } from '@/hooks/token-fetch-status'
import { happinessSet } from '@/types/happiness-set'
import { HighlightTarget } from '@/types/highlight-target'
import { Pin } from '@/types/pin'
import { LoadingContext } from '@/contexts/loading-context'

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
  const { isLoading, setIsLoading } = useContext(LoadingContext)
  const [isLoaded, setIsLoaded] = useState(false)

  const [highlightTarget, setHighlightTarget] = useState<HighlightTarget>({
    lastUpdateBy: 'init',
    xAxisValue: null,
  })
  const [initialEntityId, setInitialEntityId] = useState<
    string | null | undefined
  >(undefined)
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null)
  
  if (searchEntityId && initialEntityId === undefined) {
    setInitialEntityId(searchEntityId)
  }

  const getData = async () => {
    try {
      setIsLoading(true)
      willStop.current = false
      setPinData([])
      setMyHappiness({ month: [], day: [], time: [] })
      setHighlightTarget({ lastUpdateBy: 'init', xAxisValue: null })

      // Start performance measurement
      const startTime = performance.now()
      console.log('Generating 1000 test pins for happiness/me with clustering...')
      const testPins: Pin[] = []
      
      for (let i = 0; i < 1000; i++) {
        // Generate random coordinates across Tokyo area
        const lat = 35.65 + Math.random() * 0.4  // 35.65 to 36.05
        const lng = 139.65 + Math.random() * 0.6  // 139.65 to 140.25
        const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        
        testPins.push({
          id: `test-pin-${i}`,
          latitude: lat,
          longitude: lng,
          type: `happiness${Math.floor(Math.random() * 6) + 1}` as any,
          timestamp: timestamp,
          answer: Math.floor(Math.random() * 5) + 1,
          answer1: Math.floor(Math.random() * 5) + 1,
          answer2: Math.floor(Math.random() * 5) + 1,
          answer3: Math.floor(Math.random() * 5) + 1,
          answer4: Math.floor(Math.random() * 5) + 1,
          answer5: Math.floor(Math.random() * 5) + 1,
          answer6: Math.floor(Math.random() * 5) + 1,
          basetime: undefined,
          memo: undefined,
          memos: undefined,
        })
      }
      
      console.log(`Generated ${testPins.length} test pins`)
      setPinData(testPins)
      
      // Create mock happiness data for charts
      const mockHappinessData = {
        month: Array.from({ length: 12 }, (_, i) => ({
          timestamp: `${i + 1}`,
          happiness1: Math.floor(Math.random() * 100),
          happiness2: Math.floor(Math.random() * 100),
          happiness3: Math.floor(Math.random() * 100),
          happiness4: Math.floor(Math.random() * 100),
          happiness5: Math.floor(Math.random() * 100),
          happiness6: Math.floor(Math.random() * 100),
        })),
        day: Array.from({ length: 31 }, (_, i) => ({
          timestamp: `${i + 1}`,
          happiness1: Math.floor(Math.random() * 100),
          happiness2: Math.floor(Math.random() * 100),
          happiness3: Math.floor(Math.random() * 100),
          happiness4: Math.floor(Math.random() * 100),
          happiness5: Math.floor(Math.random() * 100),
          happiness6: Math.floor(Math.random() * 100),
        })),
        time: Array.from({ length: 24 }, (_, i) => ({
          timestamp: `${i}`,
          happiness1: Math.floor(Math.random() * 100),
          happiness2: Math.floor(Math.random() * 100),
          happiness3: Math.floor(Math.random() * 100),
          happiness4: Math.floor(Math.random() * 100),
          happiness5: Math.floor(Math.random() * 100),
          happiness6: Math.floor(Math.random() * 100),
        })),
      }
      
      setMyHappiness(mockHappinessData)
      
      // End performance measurement
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      const metrics = {
        pinCount: testPins.length,
        renderTime: renderTime.toFixed(2),
        timestamp: new Date().toISOString(),
        memoryUsage: (performance as any).memory ? {
          used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024)
        } : null,
        performanceRating: renderTime < 1000 ? 'Excellent' : 
                          renderTime < 3000 ? 'Good' : 
                          renderTime < 5000 ? 'Fair' : 'Poor'
      }
      
      setPerformanceMetrics(metrics)
      console.log('Performance metrics:', metrics)
      console.log('1000 test pins loaded successfully with clustering!')
      
      if (timestamp) {
        noticeMessageContext.showMessage(
          `1000 test pins loaded in ${renderTime.toFixed(2)}ms (${metrics.performanceRating})`,
          MessageType.Success
        )
      }
    } catch (error) {
      console.error('Error loading test data:', error)
      noticeMessageContext.showMessage(
        'Test data loading failed',
        MessageType.Error
      )
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
          entityByEntityId={{}}
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
      
      {/* Performance Metrics Display */}
      {performanceMetrics && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            p: 2,
            zIndex: 1000,
            fontSize: '12px',
            fontFamily: 'monospace'
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <strong>Pins:</strong> {performanceMetrics.pinCount.toLocaleString()}
            </Grid>
            <Grid item xs={12} sm={3}>
              <strong>Render Time:</strong> {performanceMetrics.renderTime}ms
            </Grid>
            <Grid item xs={12} sm={3}>
              <strong>Rating:</strong> {performanceMetrics.performanceRating}
            </Grid>
            <Grid item xs={12} sm={3}>
              <strong>Memory:</strong> {performanceMetrics.memoryUsage ? 
                `${performanceMetrics.memoryUsage.used}MB / ${performanceMetrics.memoryUsage.total}MB` : 
                'N/A'
              }
            </Grid>
            <Grid item xs={12}>
              <strong>Last Update:</strong> {new Date(performanceMetrics.timestamp).toLocaleString()}
            </Grid>
          </Grid>
        </Box>
      )}
    </Grid>
  )
}

export default HappinessMe
