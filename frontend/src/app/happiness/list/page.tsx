'use client'
import { useState, useEffect, useContext, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Grid } from '@mui/material'
import { messageContext } from '@/contexts/message-context'
import { MessageType } from '@/types/message-type'
import ListTable from '@/components/happiness/list-table'
import { HappinessListResponse, Data } from '@/types/happiness-list-response'
import { useFetchData } from '@/libs/fetch'
import { useTokenFetchStatus } from '@/hooks/token-fetch-status'
import { LoadingContext } from '@/contexts/loading-context'
import { useApiErrorHandler } from '@/hooks/use-api-error-handler'
import { useRuntimeConfig } from '@/contexts/runtime-config-context'

const HappinessList: React.FC = () => {
  const config = useRuntimeConfig()
  const backendUrl = config.NEXT_PUBLIC_BACKEND_URL ?? ''
  const noticeMessageContext = useContext(messageContext)
  const { isTokenFetched } = useTokenFetchStatus()
  const { handleApiError } = useApiErrorHandler()
  const { update } = useSession()
  const [listData, setListData] = useState<Data[]>([])
  const willStop = useRef(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const { setIsLoading } = useContext(LoadingContext)
  const { fetchListData, deleteData } = useFetchData()

  const getData = async () => {
    try {
      setIsLoading(true)
      willStop.current = false
      setListData([])

      const url = backendUrl + '/api/happiness'
      const limit = 1000
      let offset = 0

      while (!willStop.current) {
        // アクセストークンを再取得
        const updatedSession = await update()

        const data: HappinessListResponse = await fetchListData(
          url,
          { limit, offset },
          updatedSession?.user?.accessToken!
        )

        if (data['count'] === 0) break

        setListData((prevListData) => [...prevListData, ...data.data])

        offset += data['count']
      }
    } catch (error) {
      handleApiError(error, {
        failureMessage: '幸福度の取得に失敗しました',
      })
    } finally {
      setIsLoaded(true)
      setIsLoading(false)
    }
  }

  const deleteListData = async (id: string) => {
    try {
      const url = `${backendUrl}/api/happiness/${id}`
      const updatedSession = await update()

      await deleteData(url, updatedSession?.user?.accessToken!)
      noticeMessageContext.showMessage(
        '幸福度の削除が完了しました',
        MessageType.Success
      )
      setListData((prevListData) =>
        prevListData.filter((data) => data.id !== id)
      )
    } catch (error) {
      handleApiError(error, {
        failureMessage: '幸福度の削除に失敗しました',
      })
    }
  }

  useEffect(() => {
    if (!isTokenFetched) return
    getData()

    return () => {
      willStop.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTokenFetched])

  return (
    <Grid sx={{ p: '16px' }}>
      <ListTable
        listData={listData}
        deleteListData={deleteListData}
        isLoaded={isLoaded}
      />
    </Grid>
  )
}

export default HappinessList
