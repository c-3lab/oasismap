/**
 * クライアントエラー報告の操作ログ・環境状態・重複防止を管理するモジュール。
 */

const ACTION_LOG_MAX = 20
const MAX_STRING_LENGTH = 2000
const DEDUP_MS = 5000

export type ActionLogType =
  | 'routeChange'
  | 'apiCall'
  | 'click'
  | 'mapInteraction'

export type ActionLogEntry = {
  type: ActionLogType
  label: string
  timestamp: string
}

/**
 * 報告時点での位置情報（GPS）の状態。
 * PositionError.code は 1/2/3 の3種のみだが、ここでは「状態全体」を表すため6値。
 * - permission_denied / position_unavailable / timeout: PositionError の3種に対応
 * - available: getCurrentPosition / watchPosition の取得成功後
 * - not_supported: navigator.geolocation が無い、または非セキュアコンテキスト（http:）
 * - not_attempted: まだ取得を試していない、またはエラー・成功どちらにもなっていない初期状態
 */
export type GeolocationStatus =
  | 'available'
  | 'permission_denied'
  | 'position_unavailable'
  | 'timeout'
  | 'not_supported'
  | 'not_attempted'

// モジュールスコープのリングバッファ
const actionLogEntries: ActionLogEntry[] = []

// 位置情報状態（getCurrentPosition / watchPosition の結果で更新）
let geolocationStatus: GeolocationStatus = 'not_attempted'

// 重複送信防止用
let lastSentKey: string | null = null
let lastSentAt = 0

function truncate(s: string | undefined, max: number): string {
  if (s == null || s === '') return ''
  return s.length <= max ? s : s.slice(0, max)
}

/**
 * 操作ログに 1 件追加（リングバッファ、最大 ACTION_LOG_MAX 件）
 */
export function pushActionLog(type: ActionLogType, label: string): void {
  const entry: ActionLogEntry = {
    type,
    label,
    timestamp: new Date().toISOString(),
  }
  actionLogEntries.push(entry)
  if (actionLogEntries.length > ACTION_LOG_MAX) {
    actionLogEntries.shift()
  }
}

/**
 * 現在の操作ログのスナップショットを返す（送信用）
 */
export function getActionLogSnapshot(): ActionLogEntry[] {
  return [...actionLogEntries]
}

/**
 * 報告時点の位置情報状態を返す
 */
export function getGeolocationStatus(): GeolocationStatus {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return 'not_supported'
  }
  return geolocationStatus
}

/**
 * 位置情報状態を設定（getCurrentPosition / watchPosition のコールバックから呼ぶ）
 */
export function setGeolocationStatus(status: GeolocationStatus): void {
  geolocationStatus = status
}

/**
 * PositionError.code を detailed-design の geolocationStatus に変換
 */
export function positionErrorCodeToStatus(code: number): GeolocationStatus {
  switch (code) {
    case 1:
      return 'permission_denied'
    case 2:
      return 'position_unavailable'
    case 3:
      return 'timeout'
    default:
      return 'position_unavailable'
  }
}

/**
 * 同一エラーの短時間連続送信を抑制するかどうか
 */
export function isDuplicate(message: string, url: string): boolean {
  const key = `${truncate(message, 200)}|${truncate(url, 500)}`
  if (lastSentKey === key && Date.now() - lastSentAt < DEDUP_MS) {
    return true
  }
  return false
}

/**
 * 送信済みとして記録（重複防止用）
 */
export function markSent(message: string, url: string): void {
  const key = `${truncate(message, 200)}|${truncate(url, 500)}`
  lastSentKey = key
  lastSentAt = Date.now()
}

/**
 * 報告ペイロードを組み立て（environment.actionLog / geolocationStatus / error を含む）
 */
export function buildReportPayload(error: {
  message: string
  stack?: string
  url: string
  geolocationErrorCode?: number
}): string {
  const occurredAt = new Date().toISOString()
  const env: { userAgent: string; geolocationStatus?: string } = {
    userAgent: navigator.userAgent,
  }
  const status = getGeolocationStatus()
  if (status !== 'not_attempted') {
    env.geolocationStatus = status
  }

  const errorPayload: {
    message: string
    stack?: string
    url: string
    occurredAt: string
    geolocationErrorCode?: number
  } = {
    message: truncate(error.message, MAX_STRING_LENGTH),
    url: truncate(error.url, MAX_STRING_LENGTH),
    occurredAt,
  }
  if (error.stack) {
    errorPayload.stack = truncate(error.stack, MAX_STRING_LENGTH)
  }
  if (error.geolocationErrorCode !== undefined) {
    errorPayload.geolocationErrorCode = error.geolocationErrorCode
  }

  const payload = {
    environment: env,
    actionLog: { entries: getActionLogSnapshot() },
    error: errorPayload,
  }
  return JSON.stringify(payload)
}

/**
 * 任意のエラーを /api/client-errors に送信する。
 * try/catch 内から呼ぶことで、キャッチしたエラーも報告できる。
 * 重複防止（同一 message+url の短時間再送抑制）がかかる。
 */
export function reportError(
  error: Error | { message: string },
  options?: { geolocationErrorCode?: number }
): void {
  const message = error instanceof Error ? error.message : String(error.message)
  const stack = error instanceof Error ? error.stack : undefined
  const url = typeof document !== 'undefined' ? document.location.href : ''
  if (isDuplicate(message, url)) return
  const payload = buildReportPayload({
    message,
    stack,
    url,
    geolocationErrorCode: options?.geolocationErrorCode,
  })
  sendClientError(payload)
  markSent(message, url)
}

/**
 * 位置情報エラー（PositionError）を報告送信する。
 * getCurrentPosition / watchPosition のエラーコールバックから呼ぶ。
 */
export function reportPositionError(code: number): void {
  const status = positionErrorCodeToStatus(code)
  setGeolocationStatus(status)
  const url = typeof document !== 'undefined' ? document.location.href : ''
  const message = `Geolocation error: ${status} (code ${code})`
  if (isDuplicate(message, url)) return
  const payload = buildReportPayload({
    message,
    url,
    geolocationErrorCode: code,
  })
  sendClientError(payload)
  markSent(message, url)
}

/**
 * POST 送信（fire-and-forget）
 */
export function sendClientError(payload: string): void {
  fetch('/api/client-errors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
  }).catch(() => {
    // fire-and-forget: 送信失敗は無視
  })
}
