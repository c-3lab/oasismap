'use client'
import dynamic from 'next/dynamic'
import {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
  useLayoutEffect,
} from 'react'

import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Button, Grid } from '@mui/material'
import { PeriodType } from '@/types/period'
import { MessageType } from '@/types/message-type'
const Map = dynamic(() => import('@/components/map/map'), { ssr: false })
import { GetPin } from '@/components/utils/pin'
import { useDateTimeProps } from '@/components/fields/date-time-textbox'

import { messageContext } from '@/contexts/message-context'
import { useFetchData } from '@/libs/fetch'
import { ERROR_TYPE, PROFILE_TYPE, HAPPINESS_KEYS } from '@/libs/constants'
import { toDateTime } from '@/libs/date-converter'
import { useTokenFetchStatus } from '@/hooks/token-fetch-status'
import {
  HappinessAllResponse,
  MapData,
  MapDataItem,
} from '@/types/happiness-all-response'
import { LoadingContext } from '@/contexts/loading-context'
import { Pin } from '@/types/pin'
import { useSearchContext } from '@/contexts/search-context'
import { SearchParams, DateTimeProps } from '@/types/search-context'

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

const HappinessAll: React.FC = () => {
  const noticeMessageContext = useContext(messageContext)
  const router = useRouter()
  const [period, setPeriod] = useState(PeriodType.Month)
  const [pinData, setPinData] = useState<Pin[]>([])
  const willStop = useRef(false)
  const searchFunctionRef = useRef<
    | ((
        period: PeriodType,
        startProps: DateTimeProps,
        endProps: DateTimeProps
      ) => Promise<void>)
    | null
  >(null)

  const { isTokenFetched } = useTokenFetchStatus()
  const { startProps, endProps } = useDateTimeProps(period)
  const { data: session, update } = useSession()

  const { isLoading, setIsLoading } = useContext(LoadingContext)
  const { fetchData } = useFetchData()
  const { setOnSearch, setIsLoading: setContextIsLoading } = useSearchContext()

  const getData = useCallback(
    async (opts?: SearchParams) => {
      if (isLoading) return
      try {
        setIsLoading(true)
        willStop.current = false
        setPinData([])

        const url = backendUrl + '/api/happiness/all'
        const startValue = opts?.startValue ?? startProps.value
        const endValue = opts?.endValue ?? endProps.value
        const startDateTime = toDateTime(startValue).toISO()
        const endDateTime = toDateTime(endValue).endOf('minute').toISO()
        // 日付の変換に失敗した場合
        if (!startDateTime || !endDateTime) {
          console.error('Date conversion failed.')
          return
        }

        const limit = 1000
        let offset = 0
        const allMapData: HappinessAllResponse['map_data'] = {}

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
              period: opts?.searchPeriod ?? period,
              zoomLevel:
                parseInt(
                  process.env.NEXT_PUBLIC_DEFAULT_ZOOM_FOR_COLLECTION_RANGE!
                ) || 14,
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

          offset += data['count']
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        if (
          error instanceof Error &&
          error.message === ERROR_TYPE.UNAUTHORIZED
        ) {
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
      }
    },
    [
      isLoading,
      startProps.value,
      endProps.value,
      period,
      fetchData,
      update,
      noticeMessageContext,
      router,
      setIsLoading,
    ]
  )

  useEffect(() => {
    if (!isTokenFetched) return
    getData()

    return () => {
      willStop.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTokenFetched])

  // Create stable search function
  const handleSearch = useCallback(
    async (
      searchPeriod: PeriodType,
      searchStartProps: DateTimeProps,
      searchEndProps: DateTimeProps
    ) => {
      try {
        setPeriod(searchPeriod)
        const nextStart = searchStartProps?.value ?? startProps.value
        const nextEnd = searchEndProps?.value ?? endProps.value

        if (searchStartProps?.value) {
          startProps.setValue(searchStartProps.value)
        }
        if (searchEndProps?.value) {
          endProps.setValue(searchEndProps.value)
        }

        await getData({
          startValue: nextStart,
          endValue: nextEnd,
          searchPeriod: searchPeriod,
        })
      } catch (error) {
        console.error('Error in handleSearch:', error)
        noticeMessageContext.showMessage(
          '検索中にエラーが発生しました',
          MessageType.Error
        )
      }
    },
    [startProps, endProps, getData, noticeMessageContext]
  )

  // Set up search function for SearchDrawer
  useLayoutEffect(() => {
    searchFunctionRef.current = handleSearch
    setOnSearch(handleSearch)

    return () => {
      setOnSearch(null)
    }
  }, [handleSearch, setOnSearch])

  // Update loading state separately
  useEffect(() => {
    setContextIsLoading(isLoading)
  }, [isLoading, setContextIsLoading])

  return (
    <Grid
      container
      sx={{ height: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' } }}
    >
      <Grid container item xs={12} sx={{ height: '100%' }}>
        <Map
          pointEntities={[]}
          surfaceEntities={[]}
          fiware={{ servicePath: '', tenant: '' }}
          iconType="heatmap"
          pinData={pinData}
        />
      </Grid>
      {session?.user?.type === PROFILE_TYPE.GENERAL && (
        <Grid
          item
          xs={12}
          sx={{
            position: 'fixed',
            bottom: '10px',
            left: '10px',
            right: '10px',
            zIndex: 1000,
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
  )
}

export default HappinessAll
