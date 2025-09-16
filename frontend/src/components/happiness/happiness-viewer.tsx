'use client'
import dynamic from 'next/dynamic'
import { useEffect, useContext, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, ButtonGroup, Grid } from '@mui/material'
import { PeriodType } from '@/types/period'
import { MessageType } from '@/types/message-type'
import { ResponsiveContainer } from 'recharts'
const Map = dynamic(() => import('@/components/map/map'), { ssr: false })
import { graphColors } from '@/theme/color'
import {
  DateTimeTextbox,
  useDateTimeProps,
} from '@/components/fields/date-time-textbox'
import { EntityByEntityId } from '@/types/entityByEntityId'
import { DateTime as OasismapDateTime } from '@/types/datetime'

const BarGraph = dynamic(() => import('@/components/happiness/bar-graph'), {
  ssr: false,
})
import { messageContext } from '@/contexts/message-context'
import { happinessSet } from '@/types/happiness-set'
import { HighlightTarget } from '@/types/highlight-target'
import { Pin } from '@/types/pin'

type HappinessViewerProps = {
  pinData: Pin[]
  happinessData: happinessSet
  entityByEntityId: EntityByEntityId
  isLoading: boolean
  period: PeriodType
  highlightTarget: HighlightTarget
  initialEntityId: string | null | undefined
  type: 'me' | 'all'
  onSearch: (
    startDateTime: OasismapDateTime,
    endDateTime: OasismapDateTime
  ) => Promise<void>
  onPeriodChange: (period: PeriodType) => void
  onHighlightChange: (highlightTarget: HighlightTarget) => void
}

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

const HappinessViewer = ({
  pinData,
  happinessData,
  entityByEntityId,
  isLoading,
  period,
  highlightTarget,
  initialEntityId,
  type,
  onSearch,
  onPeriodChange,
  onHighlightChange,
}: HappinessViewerProps) => {
  const noticeMessageContext = useContext(messageContext)
  const router = useRouter()
  const isMounted = useRef(false)
  const searchParams = useSearchParams()
  const timestamp = searchParams.get('timestamp')
  const { startProps, endProps } = useDateTimeProps(period, timestamp)

  const handleSearch = async () => {
    const startDateTime = startProps.value
    const endDateTime = endProps.value
    await onSearch(startDateTime, endDateTime)
  }

  const handlePeriodChange = (newPeriod: PeriodType) => {
    onPeriodChange(newPeriod)
  }

  const handleHighlightChange = (
    newHighlightTarget: React.SetStateAction<HighlightTarget>
  ) => {
    const target =
      typeof newHighlightTarget === 'function'
        ? newHighlightTarget(highlightTarget)
        : newHighlightTarget
    onHighlightChange(target)
  }

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

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
            isMounted.current && router.replace(`/happiness/${type}`)
          }}
          period={period}
          highlightTarget={highlightTarget}
          setHighlightTarget={handleHighlightChange}
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
              plotdata={happinessData[period]}
              color={graphColors}
              xTickFormatter={renderCustomDayTick}
              isLoaded={!isLoading}
              highlightTarget={highlightTarget}
              setHighlightTarget={handleHighlightChange}
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
                onClick={() => handlePeriodChange(PeriodType.Month)}
                disabled={isLoading}
              >
                月
              </Button>
              <Button
                key="day"
                variant={period === PeriodType.Day ? 'contained' : 'outlined'}
                onClick={() => handlePeriodChange(PeriodType.Day)}
                disabled={isLoading}
              >
                日
              </Button>
              <Button
                key="time"
                variant={period === PeriodType.Time ? 'contained' : 'outlined'}
                onClick={() => handlePeriodChange(PeriodType.Time)}
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
                onClick={handleSearch}
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
              onClick={() => router.push('/happiness/input')}
            >
              幸福度を入力
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default HappinessViewer
