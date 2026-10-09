import { useContext } from 'react'
import { ERROR_TYPE } from './constants'
import { LoadingContext } from '@/contexts/loading-context'
import {
  ApiCallError,
  logApiCall,
  reportApiCallError,
  reportError,
} from '@/libs/client-error-reporting'

/**
 * fetchData の URL から apiCall の label を決める。
 * 同じ fetchData を happiness/me と happiness/all の両方で使うため、呼び出し元ではなく URL で判別する。
 */
function resolveMapDataApiLabel(url: string): string | null {
  if (url.includes('/api/happiness/me')) return 'happiness/me'
  if (url.includes('/api/happiness/all')) return 'happiness/all'
  return null
}

function rethrowApiCallFailure(apiLabel: string, error: unknown): never {
  if (error instanceof ApiCallError) {
    if (error.reportable) {
      reportApiCallError(error)
    }
    console.error('Error:', error)
    throw error
  }
  const wrapped = new ApiCallError(
    apiLabel,
    error instanceof Error ? error : new Error(String(error)),
    true
  )
  reportApiCallError(wrapped)
  console.error('Error:', error)
  throw wrapped
}

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
    const apiLabel = resolveMapDataApiLabel(url)
    try {
      setIsFetching(true)
      if (apiLabel) {
        logApiCall(apiLabel)
      }
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
        if (apiLabel) {
          throw new ApiCallError(apiLabel, new Error(ERROR_TYPE.UNAUTHORIZED))
        }
        throw new Error(ERROR_TYPE.UNAUTHORIZED)
      }
      if (response.status >= 400) {
        if (apiLabel) {
          throw new ApiCallError(
            apiLabel,
            new Error(jsonData?.message ?? 'Request failed')
          )
        }
        throw new Error(jsonData?.message ?? 'Request failed')
      }

      return jsonData
    } catch (error) {
      if (apiLabel) {
        rethrowApiCallFailure(apiLabel, error)
      }
      reportError(error)
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
      logApiCall('happiness/list')
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
        throw new ApiCallError(
          'happiness/list',
          new Error(ERROR_TYPE.UNAUTHORIZED)
        )
      }
      if (response.status >= 400) {
        throw new ApiCallError(
          'happiness/list',
          new Error(jsonData?.message ?? 'Request failed')
        )
      }

      return jsonData
    } catch (error) {
      rethrowApiCallFailure('happiness/list', error)
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
      logApiCall('happiness/post')
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
        throw new ApiCallError(
          'happiness/post',
          new Error(ERROR_TYPE.UNAUTHORIZED)
        )
      }
      if (response.status >= 400) {
        throw new ApiCallError(
          'happiness/post',
          new Error(jsonData?.message ?? 'Request failed')
        )
      }
      return jsonData
    } catch (error) {
      rethrowApiCallFailure('happiness/post', error)
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
      logApiCall('happiness/import')
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: requestBody,
      })

      if (response.status === 401) {
        throw new ApiCallError(
          'happiness/import',
          new Error(ERROR_TYPE.UNAUTHORIZED)
        )
      }
      if (response.status >= 400) {
        const jsonData = await response.json()
        throw new ApiCallError(
          'happiness/import',
          new Error(jsonData?.message ?? 'Import failed')
        )
      }

      return response
    } catch (error) {
      rethrowApiCallFailure('happiness/import', error)
    } finally {
      setIsFetching(false)
    }
  }
  const download = async (url: string, token: string) => {
    try {
      setIsFetching(true)
      logApiCall('happiness/export')
      const response = await fetch(`${url}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 401) {
        throw new ApiCallError(
          'happiness/export',
          new Error(ERROR_TYPE.UNAUTHORIZED)
        )
      }
      if (response.status >= 400) {
        const jsonData = await response.json()
        throw new ApiCallError(
          'happiness/export',
          new Error(jsonData?.message ?? 'Request failed')
        )
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
      rethrowApiCallFailure('happiness/export', error)
    } finally {
      setIsFetching(false)
    }
  }
  const deleteData = async (url: string, token: string): Promise<any> => {
    try {
      setIsFetching(true)
      logApiCall('happiness/delete')
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 401) {
        throw new ApiCallError(
          'happiness/delete',
          new Error(ERROR_TYPE.UNAUTHORIZED)
        )
      }
      if (response.status >= 400) {
        const jsonData = await response.json()
        throw new ApiCallError(
          'happiness/delete',
          new Error(jsonData?.message ?? 'Request failed')
        )
      }
    } catch (error) {
      rethrowApiCallFailure('happiness/delete', error)
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
