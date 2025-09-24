import { useState, useEffect, useContext, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { PeriodType } from '@/types/period'
import { MessageType } from '@/types/message-type'
import { GetPin } from '@/components/utils/pin'
// import { myHappinessData, sumByTimestamp } from '@/libs/graph'
import { messageContext } from '@/contexts/message-context'
import { ERROR_TYPE } from '@/libs/constants'
import { useFetchData } from '@/libs/fetch'
import { DateTime } from 'luxon'
import { toDateTime } from '@/libs/date-converter'
import { useTokenFetchStatus } from '@/hooks/token-fetch-status'
import { Pin } from '@/types/pin'
import { LoadingContext } from '@/contexts/loading-context'
import { EntityByEntityId } from '@/types/entityByEntityId'
import { Data } from '@/types/happiness-me-response'
import { DateTime as OasismapDateTime } from '@/types/datetime'

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

type UseHappinessDataProps = {
  type: 'me' | 'all'
}

export const useHappinessData = ({ type }: UseHappinessDataProps) => {
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
  const { update } = useSession()
  const { isLoading, setIsLoading } = useContext(LoadingContext)
  const { fetchData } = useFetchData()
  const [targetEntity, setTargetEntity] = useState<Data | undefined>(undefined)

  const [initialEntityId, setInitialEntityId] = useState<
    string | null | undefined
  >(undefined)

  if (searchEntityId && initialEntityId === undefined) {
    setInitialEntityId(searchEntityId)
  }

  const getData = async (startDateTime?: string, endDateTime?: string) => {
    try {
      setIsLoading(true)
      willStop.current = false
      setPinData([])
      setEntityByEntityId({})

      const url =
        backendUrl +
        (type === 'me' ? '/api/happiness/me' : '/api/happiness/all')

      // Use provided dates or default to current period
      // Backend expects ISO string format, so we use DateTime.fromJSDate().toISO()
      const start =
        startDateTime || DateTime.fromJSDate(new Date()).startOf('day').toISO()
      const end =
        endDateTime || DateTime.fromJSDate(new Date()).endOf('day').toISO()

      if (!start || !end) {
        console.error('Date conversion failed.')
        return
      }

      const limit = 1000
      let offset = 0
      while (!willStop.current) {
        // アクセストークンを再取得
        const updatedSession = await update()

        // Prepare request parameters
        const requestParams: any = {
          start: start,
          end: end,
          limit: limit,
          offset: offset,
        }

        const data = await fetchData(
          url,
          requestParams,
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
        const dateTime = DateTime.fromISO(timestamp)
        const formattedDate = dateTime.toFormat('yyyy/MM/dd')

        noticeMessageContext.showMessage(
          formattedDate + ' ' + 'のデータを表示しました',
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
    }
  }

  const handleSearch = async (
    startDateTime: OasismapDateTime,
    endDateTime: OasismapDateTime
  ) => {
    // Convert OasismapDateTime to ISO string format
    const startISO = toDateTime(startDateTime).toISO()
    const endISO = toDateTime(endDateTime).endOf('minute').toISO()

    if (!startISO || !endISO) {
      console.error('Date conversion failed in handleSearch.')
      return
    }

    await getData(startISO, endISO)
  }

  const handlePeriodChange = (newPeriod: PeriodType) => {
    setPeriod(newPeriod)
    // Optionally trigger data refetch with new period
  }

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  useEffect(() => {
    if (!isTokenFetched) return

    const start = timestamp
      ? DateTime.fromISO(timestamp).startOf('day').toISO() || undefined
      : undefined
    const end = timestamp
      ? DateTime.fromISO(timestamp).endOf('day').toISO() || undefined
      : undefined

    getData(start, end)

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

  return {
    // Data
    pinData,
    entityByEntityId,
    isLoading,
    period,
    initialEntityId,
    targetEntity,

    // Actions
    handleSearch,
    handlePeriodChange,

    // Utils
    isMounted,
  }
}
