'use client'

import { useCallback, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { messageContext } from '@/contexts/message-context'
import { MessageType } from '@/types/message-type'
import { ERROR_TYPE } from '@/libs/constants'

export type HandleApiErrorOptions = {
  failureMessage: string
  onUnauthorized?: () => void
  onOther?: (error: Error) => void
}

/**
 * useFetchData 経由の API 失敗向け UX（報告は fetch.ts で済ませる）。
 */
export function useApiErrorHandler() {
  const noticeMessageContext = useContext(messageContext)
  const router = useRouter()

  const handleApiError = useCallback(
    (error: unknown, options: HandleApiErrorOptions) => {
      console.error('Error:', error)
      if (error instanceof Error && error.message === ERROR_TYPE.UNAUTHORIZED) {
        noticeMessageContext.showMessage(
          '再ログインしてください',
          MessageType.Error
        )
        signOut({ redirect: false })
        router.push('/login')
        options.onUnauthorized?.()
        return
      }
      noticeMessageContext.showMessage(
        options.failureMessage,
        MessageType.Error
      )
      if (error instanceof Error) {
        options.onOther?.(error)
      }
    },
    [noticeMessageContext, router]
  )

  return { handleApiError }
}
