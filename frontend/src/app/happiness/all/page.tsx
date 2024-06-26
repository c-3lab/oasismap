'use client'
import dynamic from 'next/dynamic'
import { useState, useEffect, useContext } from 'react'
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

const LineGraph = dynamic(() => import('@/components/happiness/line-graph'), {
  ssr: false,
})
import { ourHappinessData } from '@/libs/graph'
import { messageContext } from '@/contexts/message-context'
import { fetchData } from '@/libs/fetch'
import { ERROR_TYPE, PROFILE_TYPE } from '@/libs/constants'
import { toDateTime } from '@/libs/date-converter'
import { useTokenFetchStatus } from '@/hooks/token-fetch-status'

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

const HappinessAll: React.FC = () => {
  const noticeMessageContext = useContext(messageContext)
  const router = useRouter()
  const [period, setPeriod] = useState(PeriodType.Month)
  const [pinData, setPinData] = useState<any>([])
  const [OurHappiness, setOurHappiness] = useState<any>([])
  const { isTokenFetched } = useTokenFetchStatus()
  const { startProps, endProps, updatedPeriod } = useDateTimeProps(period)
  const { data: session, update } = useSession()

  const getData = async () => {
    try {
      const url = backendUrl + '/api/happiness/all'
      const startDateTime = toDateTime(startProps.value).toISO()
      const endDateTime = toDateTime(endProps.value).endOf('minute').toISO()
      // 日付の変換に失敗した場合
      if (!startDateTime || !endDateTime) {
        console.error('Date conversion failed.')
        return
      }
      // アクセストークンを再取得
      const updatedSession = await update()

      const data = await fetchData(
        url,
        {
          start: startDateTime,
          end: endDateTime,
          period: period,
          zoomLevel:
            parseInt(
              process.env.NEXT_PUBLIC_DEFAULT_ZOOM_FOR_COLLECTION_RANGE!
            ) || 14,
        },
        updatedSession?.user?.accessToken!
      )
      setPinData(GetPin(data['map_data']))
      setOurHappiness(ourHappinessData(data['graph_data']))
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
    }
  }

  useEffect(() => {
    if (!isTokenFetched) return
    getData()
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
    <Grid
      container
      sx={{
        paddingBottom: {
          xs: session?.user?.type === PROFILE_TYPE.GENERAL ? '50px' : '0px',
          md: '0px',
        },
      }}
    >
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
          iconType="heatmap"
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
              color={graphColors}
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
              period={period}
              {...startProps}
            />
          </Grid>
          <Grid item xs={12} md={12} lg={8}>
            <DateTimeTextbox
              dateLabel="終了日"
              timeLabel="時間"
              period={period}
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
              >
                検索
              </Button>
            </Grid>
          </Grid>
          {session?.user?.type === PROFILE_TYPE.GENERAL && (
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
