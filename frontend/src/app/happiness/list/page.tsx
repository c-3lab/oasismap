'use client'
import { useState, useEffect, useContext, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Grid } from '@mui/material'
import { messageContext } from '@/contexts/message-context'
import { MessageType } from '@/types/message-type'
import { ERROR_TYPE } from '@/libs/constants'
import ListTable from '@/components/happiness/list-table'
import { HappinessListResponse, Data } from '@/types/happiness-list-response'
import { useFetchData } from '@/libs/fetch'
import { useTokenFetchStatus } from '@/hooks/token-fetch-status'
import { LoadingContext } from '@/components/spinner'

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

const HappinessList: React.FC = () => {
  const noticeMessageContext = useContext(messageContext)
  const router = useRouter()
  const { isTokenFetched } = useTokenFetchStatus()
  const { update } = useSession()
  const [listData, setListData] = useState<Data[]>([])
  const willStop = useRef(false)
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
          '幸福度の取得に失敗しました',
          MessageType.Error
        )
      }
    } finally {
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
      console.error('Error:', error)
      if (error instanceof Error && error.message === ERROR_TYPE.UNAUTHORIZED) {
        noticeMessageContext.showMessage(
          '再ログインしてください',
          MessageType.Error
        )
        signOut({ redirect: false })
        router.push('/login')
      } else {
        noticeMessageContext.showMessage(
          '幸福度の削除に失敗しました',
          MessageType.Error
        )
      }
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
      <ListTable listData={listData} deleteListData={deleteListData} />
    </Grid>
  )
}

export default HappinessList
