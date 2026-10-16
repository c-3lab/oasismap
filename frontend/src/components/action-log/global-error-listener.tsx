'use client'

import { useCallback, useEffect } from 'react'
import {
  buildReportPayload,
  sendClientError,
  isDuplicate,
  markSent,
} from '@/libs/error-report'

/** 未処理例外・rejection の捕捉（描画なし） */
export default function GlobalErrorListener() {
  const handleError = useCallback((e: ErrorEvent): void => {
    const url = typeof document !== 'undefined' ? document.location.href : ''
    const message = e.message || (e.error as Error)?.message || 'Unknown error'
    if (isDuplicate(message, url)) return
    const payload = buildReportPayload({
      message,
      stack: (e.error as Error)?.stack,
      url,
    })
    sendClientError(payload)
    markSent(message, url)
  }, [])

  const handleUnhandledRejection = useCallback(
    (event: PromiseRejectionEvent): void => {
      const reason = event.reason
      const url = typeof document !== 'undefined' ? document.location.href : ''
      const message = reason instanceof Error ? reason.message : String(reason)
      if (isDuplicate(message, url)) return
      const stack = reason instanceof Error ? reason.stack : undefined
      const payload = buildReportPayload({ message, stack, url })
      sendClientError(payload)
      markSent(message, url)
    },
    []
  )

  useEffect(() => {
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [handleError, handleUnhandledRejection])

  return null
}
