'use client'
import dynamic from 'next/dynamic'
import { useState, useEffect, useContext, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Button, Grid } from '@mui/material'
import { PeriodType } from '@/types/period'
import { MessageType } from '@/types/message-type'
const Map = dynamic(() => import('@/components/map/map'), { ssr: false })
import { GetPin } from '@/components/utils/pin'
import { useDateTimeProps } from '@/components/fields/date-time-textbox'
import { EntityByEntityId } from '@/types/entityByEntityId'
import { Data } from '@/types/happiness-me-response'

import { messageContext } from '@/contexts/message-context'
import { ERROR_TYPE } from '@/libs/constants'
import { useFetchData } from '@/libs/fetch'
import { toDateTime } from '@/libs/date-converter'
import { DateTime as OasismapDateTime } from '@/types/datetime'
import { useTokenFetchStatus } from '@/hooks/token-fetch-status'

import { Pin } from '@/types/pin'
import { LoadingContext } from '@/contexts/loading-context'
import { useSearchContext } from '@/contexts/search-context'
import { DateTimeProps } from '@/types/search-context'

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

const HappinessMe: React.FC = () => {
  const noticeMessageContext = useContext(messageContext)
  const router = useRouter()
  const [period, setPeriod] = useState(PeriodType.Month)
  const [pinData, setPinData] = useState<Pin[]>([])
  const [entityByEntityId, setEntityByEntityId] = useState<EntityByEntityId>({})
  const willStop = useRef(false)
  const isMounted = useRef(false)

  const { isTokenFetched } = useTokenFetchStatus()
  const searchParams = useSearchParams()
  const searchEntityId = searchParams.get('entityId')
  const timestamp = searchParams.get('timestamp')
  const { startProps, endProps } = useDateTimeProps(period, timestamp)
  const { update } = useSession()
  const { isLoading, setIsLoading } = useContext(LoadingContext)
  const { fetchData } = useFetchData()
  const { setOnSearch, setIsLoading: setContextIsLoading } = useSearchContext()

  const [initialEntityId, setInitialEntityId] = useState<
    string | null | undefined
  >(undefined)
  const [targetEntity, setTargetEntity] = useState<Data | undefined>(undefined)
  if (searchEntityId && initialEntityId === undefined) {
    setInitialEntityId(searchEntityId)
  }

  const getData = useCallback(
    async (opts?: {
      startValue?: OasismapDateTime
      endValue?: OasismapDateTime
    }) => {
      try {
        setIsLoading(true)
        willStop.current = false
        setPinData([])

        setEntityByEntityId({})

        const url = backendUrl + '/api/happiness/me'
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

          if (data['count'] === 0 || data['data'].length === 0) {
            break
          }

          try {
            const newPins = GetPin(data['data'])
            setPinData((prevPinData: Pin[]) => [...prevPinData, ...newPins])
          } catch (error) {
            console.error('Error in GetPin or setPinData:', error)
          }

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

          offset += data['data'].length

          break
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
      startProps.value,
      endProps.value,
      fetchData,
      update,
      noticeMessageContext,
      router,
      setIsLoading,
      initialEntityId,
      timestamp,
      entityByEntityId,
    ]
  )

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
  }, [isTokenFetched])

  useEffect(() => {
    if (initialEntityId && entityByEntityId) {
      setTargetEntity(entityByEntityId[initialEntityId])
    }
  }, [initialEntityId, entityByEntityId])

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

        await getData({ startValue: nextStart, endValue: nextEnd })
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

  useEffect(() => {
    setOnSearch(handleSearch)
    return () => setOnSearch(null)
  }, [handleSearch, setOnSearch])

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
          iconType="pin"
          pinData={pinData}
          targetEntity={targetEntity}
          onPopupClose={() => {
            // 画面遷移時に発火させないため、マウント時のみクエリパラメータの削除を実行
            isMounted.current && router.replace('/happiness/me')
            setInitialEntityId(null)
          }}
          period={period}
        />
      </Grid>
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
          onClick={() => router.push('/happiness/input?referral=me')}
        >
          幸福度を入力
        </Button>
      </Grid>
    </Grid>
  )
}

export default HappinessMe
