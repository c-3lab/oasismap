import { useContext } from 'react'
import { ERROR_TYPE } from './constants'
import { LoadingContext } from '@/contexts/loading-context'

interface HappinessParams {
  limit: number
  offset: number
  start: string
  end: string
  zoomLevel?: number
  boundsNESW?: string
}

export interface HappinessRequestBody {
  latitude: number
  longitude: number
  memo: string
  answers: {
    happiness1: number
    happiness2: number
    happiness3: number
    happiness4: number
    happiness5: number
    happiness6: number
  }
  timestamp?: string
}

interface HappinessListParams {
  limit: number
  offset: number
}

export const useFetchData = () => {
  const { setIsFetching } = useContext(LoadingContext)

  const fetchData = async (
    url: string,
    params: HappinessParams,
    token: string
  ): Promise<any> => {
    try {
      setIsFetching(true)
      const query = new URLSearchParams({
        start: params.start,
        end: params.end,
        limit: params.limit.toString(),
        offset: params.offset.toString(),
        ...(params.zoomLevel && { zoomLevel: params.zoomLevel.toString() }),
        ...(params.boundsNESW && { boundsNESW: params.boundsNESW }),
      })

      const response = await fetch(`${url}?${query}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      const jsonData = await response.json()

      if (response.status === 401) {
        throw Error(ERROR_TYPE.UNAUTHORIZED)
      }
      if (response.status >= 400) {
        throw Error(jsonData?.message)
      }

      return jsonData
    } catch (error) {
      console.error('Error:', error)
      throw error
    } finally {
      setIsFetching(false)
    }
  }
  const fetchListData = async (
    url: string,
    params: HappinessListParams,
    token: string
  ): Promise<any> => {
    try {
      setIsFetching(true)
      const query = new URLSearchParams({
        limit: params.limit.toString(),
        offset: params.offset.toString(),
      })

      const response = await fetch(`${url}?${query}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      const jsonData = await response.json()

      if (response.status === 401) {
        throw Error(ERROR_TYPE.UNAUTHORIZED)
      }
      if (response.status >= 400) {
        throw Error(jsonData?.message)
      }

      return jsonData
    } catch (error) {
      console.error('Error:', error)
      throw error
    } finally {
      setIsFetching(false)
    }
  }
  const postData = async (
    url: string,
    requestBody: HappinessRequestBody,
    token: string
  ): Promise<any> => {
    try {
      setIsFetching(true)
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
      const jsonData = await response.json()

      if (response.status === 401) {
        throw Error(ERROR_TYPE.UNAUTHORIZED)
      }
      if (response.status >= 400) {
        throw Error(jsonData?.message)
      }
      return jsonData
    } catch (error) {
      console.error('Error:', error)
      throw error
    } finally {
      setIsFetching(false)
    }
  }
  const upload = async (
    url: string,
    requestBody: FormData,
    token: string
  ): Promise<any> => {
    try {
      setIsFetching(true)
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: requestBody,
      })

      if (response.status === 401) {
        throw Error(ERROR_TYPE.UNAUTHORIZED)
      }
      if (response.status >= 400) {
        const jsonData = await response.json()
        throw Error(jsonData?.message)
      }

      return response
    } catch (error) {
      console.error('Error:', error)
      throw error
    } finally {
      setIsFetching(false)
    }
  }
  const download = async (url: string, token: string) => {
    try {
      setIsFetching(true)
      const response = await fetch(`${url}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 401) {
        throw Error(ERROR_TYPE.UNAUTHORIZED)
      }
      if (response.status >= 400) {
        const jsonData = await response.json()
        throw Error(jsonData?.message)
      }

      const fileName = getFileName(response) || 'export.csv'
      const blob = new Blob([await response.blob()])
      const objectUrl = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = objectUrl
      link.download = fileName
      link.click()

      // Firefoxで問題になるため、処理を待ってからObjectURLを失効させる
      setTimeout(() => {
        window.URL.revokeObjectURL(objectUrl)
      }, 250)
    } catch (error) {
      console.error('Error:', error)
      throw error
    } finally {
      setIsFetching(false)
    }
  }
  const deleteData = async (url: string, token: string): Promise<any> => {
    try {
      setIsFetching(true)
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 401) {
        throw Error(ERROR_TYPE.UNAUTHORIZED)
      }
      if (response.status >= 400) {
        const jsonData = await response.json()
        throw Error(jsonData?.message)
      }
    } catch (error) {
      console.error('Error:', error)
      throw error
    } finally {
      setIsFetching(false)
    }
  }
  return { fetchData, fetchListData, postData, upload, download, deleteData }
}

const getFileName = (response: Response) => {
  const disposition = response.headers.get('Content-Disposition') || ''
  if (disposition) {
    const pattern = /filename=(['"])(.*?)\1/
    const matches = pattern.exec(disposition)
    if (matches) {
      return matches[2]
    }
  }
}
