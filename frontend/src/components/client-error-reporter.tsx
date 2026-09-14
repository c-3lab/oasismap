'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { routeActions } from '@/libs/action-log-definitions'
import type { ActionDefinition } from '@/libs/action-log-definitions'
import { logAction } from '@/libs/action-log'
import type { ActionLogType } from '@/libs/client-error-reporting'
import {
  buildReportPayload,
  sendClientError,
  isDuplicate,
  markSent,
} from '@/libs/client-error-reporting'

declare global {
  interface Window {
    __clientErrorReporting?: {
      logAction: (action: ActionDefinition) => void
      pushAction: (type: ActionLogType, label: string, target?: string) => void
    }
  }
}

export default function ClientErrorReporter() {
  const pathname = usePathname()

  // ルート遷移を操作ログに記録
  useEffect(() => {
    if (pathname) {
      logAction(routeActions.routeChange(pathname))
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

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    window.__clientErrorReporting = {
      logAction,
      pushAction: (type, label, target) =>
        logAction(
          target !== undefined ? { type, label, target } : { type, label }
        ),
    }

    return () => {
      delete window.__clientErrorReporting
    }
  }, [])

  return null
}
