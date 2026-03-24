'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import {
  buildReportPayload,
  sendClientError,
  isDuplicate,
  markSent,
  pushActionLog,
} from '@/libs/client-error-reporting'

export default function ClientErrorReporter() {
  const pathname = usePathname()

  // ルート遷移を操作ログに記録
  useEffect(() => {
    if (pathname) {
      pushActionLog('routeChange', pathname)
    }
  }, [pathname])

  useEffect(() => {
    const handleError = (e: ErrorEvent): void => {
      const url = typeof document !== 'undefined' ? document.location.href : ''
      const message =
        e.message || (e.error as Error)?.message || 'Unknown error'
      if (isDuplicate(message, url)) return
      const payload = buildReportPayload({
        message,
        stack: (e.error as Error)?.stack,
        url,
      })
      sendClientError(payload)
      markSent(message, url)
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
      const reason = event.reason
      const url = typeof document !== 'undefined' ? document.location.href : ''
      const message = reason instanceof Error ? reason.message : String(reason)
      if (isDuplicate(message, url)) return
      const stack = reason instanceof Error ? reason.stack : undefined
      const payload = buildReportPayload({ message, stack, url })
      sendClientError(payload)
      markSent(message, url)
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return null
}
