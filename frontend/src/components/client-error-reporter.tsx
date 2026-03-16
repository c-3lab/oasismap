'use client'

import { useEffect } from 'react'

const MAX_STRING_LENGTH = 2000

function truncate(s: string | undefined, max: number): string {
  if (s == null || s === '') return ''
  return s.length <= max ? s : s.slice(0, max)
}

function buildPayload(error: {
  message: string
  stack?: string
  url: string
}): string {
  const occurredAt = new Date().toISOString()
  const payload = {
    environment: { userAgent: navigator.userAgent },
    actionLog: { entries: [] as unknown[] },
    error: {
      message: truncate(error.message, MAX_STRING_LENGTH),
      stack: error.stack ? truncate(error.stack, MAX_STRING_LENGTH) : undefined,
      url: truncate(error.url, MAX_STRING_LENGTH),
      occurredAt,
    },
  }
  return JSON.stringify(payload)
}

function sendClientError(payload: string): void {
  fetch('/api/client-errors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
  }).catch(() => {
    // fire-and-forget: 送信失敗は無視
  })
}

export default function ClientErrorReporter() {
  useEffect(() => {
    const handleError = (e: ErrorEvent): void => {
      const url = typeof document !== 'undefined' ? document.location.href : ''
      const payload = buildPayload({
        message: e.message || (e.error as Error)?.message || 'Unknown error',
        stack: (e.error as Error)?.stack,
        url,
      })
      sendClientError(payload)
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
      const reason = event.reason
      const url = typeof document !== 'undefined' ? document.location.href : ''
      const message = reason instanceof Error ? reason.message : String(reason)
      const stack = reason instanceof Error ? reason.stack : undefined
      const payload = buildPayload({ message, stack, url })
      sendClientError(payload)
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
