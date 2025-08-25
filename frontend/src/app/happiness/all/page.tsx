'use client'
import dynamic from 'next/dynamic'
import { useState, useEffect, useContext, useRef } from 'react'
import { LatLngBounds } from 'leaflet'
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
import { useFetchData } from '@/libs/fetch'
import { ERROR_TYPE, PROFILE_TYPE, HAPPINESS_KEYS } from '@/libs/constants'
import { HappinessKey } from '@/types/happiness-key'
import { toDateTime } from '@/libs/date-converter'
import { useTokenFetchStatus } from '@/hooks/token-fetch-status'
import {
  HappinessAllResponse,
  MapData,
  MapDataItem,
} from '@/types/happiness-all-response'
import { LoadingContext } from '@/contexts/loading-context'
import { Pin } from '@/types/pin'
import { happinessSet } from '@/types/happiness-set'

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

const HappinessAll: React.FC = () => {
  const noticeMessageContext = useContext(messageContext)
  const router = useRouter()
  const [period, setPeriod] = useState(PeriodType.Month)
  const [pinData, setPinData] = useState<Pin[]>([])
  const willStop = useRef(false)
  const [OurHappiness, setOurHappiness] = useState<happinessSet>({
    month: [],
    day: [],
    time: [],
  })
  const { isTokenFetched } = useTokenFetchStatus()
  const { startProps, endProps, updatedPeriod } = useDateTimeProps(period)
  const { data: session, update } = useSession()
  const [selectedLayers] = useState<HappinessKey[]>(HAPPINESS_KEYS)
  const [bounds, setBounds] = useState<LatLngBounds | undefined>(undefined)
  const { isLoading, setIsLoading } = useContext(LoadingContext)
  const { fetchData } = useFetchData()
  const [isLoaded, setIsLoaded] = useState(false)

  const getBoundsNESW = (): string | undefined => {
    if (session?.user?.type !== PROFILE_TYPE.ADMIN) return undefined
    if (!bounds) return undefined

    const boundsNESW = `${bounds.getNorth()},${bounds.getEast()},${bounds.getSouth()},${bounds.getWest()}`

    // 画面上部・画面下部の緯度、左端・右端の経度が全て取得できている事を確認する
    if (!/^[\d.-]+,[\d.-]+,[\d.-]+,[\d.-]+$/.test(boundsNESW)) {
      console.error('Invalid boundsNESW format:', boundsNESW)
      return undefined
    }

    return boundsNESW
  }

  const getData = async () => {
    if (isLoading) return
    try {
      setIsLoading(true)
      willStop.current = false
      setPinData([])
      setOurHappiness({ month: [], day: [], time: [] })

      const url = backendUrl + '/api/happiness/all'
      const startDateTime = toDateTime(startProps.value).toISO()
      const endDateTime = toDateTime(endProps.value).endOf('minute').toISO()
      // 日付の変換に失敗した場合
      if (!startDateTime || !endDateTime) {
        console.error('Date conversion failed.')
        return
      }

      const limit = 1000
      let offset = 0
      const allMapData: HappinessAllResponse['map_data'] = {}
      const allGraphData: HappinessAllResponse['graph_data'] = []

      const boundsNESW: string | undefined = getBoundsNESW()

      while (!willStop.current) {
        // アクセストークンを再取得
        const updatedSession = await update()

        const data: HappinessAllResponse = await fetchData(
          url,
          {
            start: startDateTime,
            end: endDateTime,
            limit: limit,
            offset: offset,
            period: period,
            zoomLevel:
              parseInt(
                process.env.NEXT_PUBLIC_DEFAULT_ZOOM_FOR_COLLECTION_RANGE!
              ) || 14,
            boundsNESW: boundsNESW,
          },
          updatedSession?.user?.accessToken!
        )
        if (data['count'] === 0) break

        for (const [gridKey, fetchedMapData] of Object.entries(
          data['map_data']
        )) {
          const existedMapData = allMapData[gridKey]
          if (existedMapData) {
            const existedAnswers = existedMapData['data'][0].answers
            const fetchedAnswers = fetchedMapData['data'][0].answers
            const newAnswers: MapDataItem['answers'] = {
              happiness1: 0,
              happiness2: 0,
              happiness3: 0,
              happiness4: 0,
              happiness5: 0,
              happiness6: 0,
            }

            HAPPINESS_KEYS.forEach((type) => {
              const totalAnswerByType =
                existedAnswers[type] * existedMapData['count'] +
                fetchedAnswers[type] * fetchedMapData['count']
              const totalCount =
                existedMapData['count'] + fetchedMapData['count']
              newAnswers[type] = totalAnswerByType / totalCount
            })
            allMapData[gridKey]['data'].forEach((data: MapDataItem) => {
              data.answers = { ...newAnswers }
              data.memos = data.memos.concat(fetchedMapData['data'][0].memos)
            })
            allMapData[gridKey]['count'] += fetchedMapData['count']
          } else {
            allMapData[gridKey] = fetchedMapData
          }
        }
        setPinData(
          GetPin(
            Object.values(allMapData)
              .map((mapData: MapData) => mapData.data)
              .flat()
          )
        )

        for (let i = 0; i < data['graph_data'].length; i++) {
          const existedGraphData = allGraphData[i]
          const fetchedGraphData = data['graph_data'][i]
          if (existedGraphData) {
            if (fetchedGraphData['count'] === 0) continue

            HAPPINESS_KEYS.forEach((key) => {
              allGraphData[i][key] =
                (existedGraphData[key] * existedGraphData['count'] +
                  fetchedGraphData[key] * fetchedGraphData['count']) /
                (existedGraphData['count'] + fetchedGraphData['count'])
            })
            allGraphData[i]['count'] += fetchedGraphData['count']
          } else {
            allGraphData.push(fetchedGraphData)
          }
        }
        setOurHappiness(ourHappinessData(allGraphData))

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
      setIsLoading(false)
      setIsLoaded(true)
    }
  }

  useEffect(() => {
    if (!isTokenFetched) return
    getData()

    return () => {
      willStop.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTokenFetched, updatedPeriod, bounds])

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
          setBounds={
            session?.user?.type === PROFILE_TYPE.ADMIN ? setBounds : undefined
          }
        />
      </Grid>
      <Grid
        item
        xs={12}
        md={6}
        rowSpacing={4}
        columnSpacing={1}
        justifyContent={'center'}
        sx={{ px: { md: '16px' }, my: { xs: '32px', md: 0 } }}
      >
        {/* <Grid
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
              isLoaded={isLoaded}
              selectedLayers={selectedLayers}
            />
          </ResponsiveContainer>
        </Grid> */}
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
