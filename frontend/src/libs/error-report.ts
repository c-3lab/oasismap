/**
 * クライアントエラー報告 API（操作ログ・環境状態・ペイロード組立・送信・重複防止）。
 * グローバル捕捉は components/action-log/global-error-listener.tsx。
 */

const ACTION_LOG_MAX = 20
const ACTION_LOG_SESSION_STORAGE_KEY = 'oasismap:client-error-action-log'
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
  nickname?: string
}

const VALID_ACTION_LOG_TYPES = new Set<ActionLogType>([
  'routeChange',
  'apiCall',
  'click',
  'mapInteraction',
])

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

function parseStoredActionLog(raw: string): ActionLogEntry[] {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    const entries: ActionLogEntry[] = []
    for (const item of parsed) {
      if (
        item &&
        typeof item === 'object' &&
        VALID_ACTION_LOG_TYPES.has((item as ActionLogEntry).type) &&
        typeof (item as ActionLogEntry).label === 'string' &&
        typeof (item as ActionLogEntry).timestamp === 'string'
      ) {
        const entry: ActionLogEntry = {
          type: (item as ActionLogEntry).type,
          label: (item as ActionLogEntry).label,
          timestamp: (item as ActionLogEntry).timestamp,
        }
        const nickname = (item as ActionLogEntry).nickname
        if (typeof nickname === 'string') {
          entry.nickname = nickname
        }
        entries.push(entry)
      }
    }
    return entries.length > ACTION_LOG_MAX
      ? entries.slice(-ACTION_LOG_MAX)
      : entries
  } catch {
    return []
  }
}

function loadActionLogFromSessionStorage(): ActionLogEntry[] {
  if (typeof sessionStorage === 'undefined') return []
  try {
    const raw = sessionStorage.getItem(ACTION_LOG_SESSION_STORAGE_KEY)
    if (!raw) return []
    return parseStoredActionLog(raw)
  } catch {
    return []
  }
}

function persistActionLogToSessionStorage(entries: ActionLogEntry[]): void {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.setItem(
      ACTION_LOG_SESSION_STORAGE_KEY,
      JSON.stringify(entries)
    )
  } catch {
    // quota 超過などは無視
  }
}

function updateActionLog(mutate: (entries: ActionLogEntry[]) => void): void {
  const entries = loadActionLogFromSessionStorage()
  mutate(entries)
  persistActionLogToSessionStorage(entries)
}

// 位置情報状態（getCurrentPosition / watchPosition の結果で更新）
let geolocationStatus: GeolocationStatus = 'not_attempted'

// 操作ログ記録時に付与するニックネーム（SessionProvider 内で同期）
let currentNickname: string | undefined

// 重複送信防止用
let lastSentKey: string | null = null
let lastSentAt = 0

function truncate(s: string | undefined, max: number): string {
  if (s == null || s === '') return ''
  return s.length <= max ? s : s.slice(0, max)
}

/**
 * クライアントエラー報告ペイロード用のページ URL（reportError / reportPositionError 発生時のページのURL）を返す。
 * document が無い環境（SSR・テストなど）では空文字を返し、参照エラーを避ける。
 * globalThis 経由で参照する（ブラウザでは location.href、無い場合は ''）。
 */
function getClientErrorPageUrl(): string {
  if (typeof globalThis.document === 'undefined') return ''
  return globalThis.document.location.href
}

/**
 * 操作ログ記録時に付与するニックネームを設定する。
 * ログアウト時は undefined を渡してクリアする。
 */
export function setActionLogNickname(nickname: string | undefined): void {
  currentNickname = nickname
}

/**
 * 操作ログに 1 件追加（sessionStorage、最大 ACTION_LOG_MAX 件のリングバッファ）
 */
export function pushActionLog(type: ActionLogType, label: string): void {
  const entry: ActionLogEntry = {
    type,
    label,
    timestamp: new Date().toISOString(),
    ...(currentNickname && { nickname: currentNickname }),
  }
  updateActionLog((entries) => {
    entries.push(entry)
    if (entries.length > ACTION_LOG_MAX) {
      entries.shift()
    }
  })
}

/** apiCall 型の操作ログを記録する（label は詳細設計の API 種別文字列を直接渡す） */
export function logApiCall(label: string): void {
  pushActionLog('apiCall', label)
}

/** fetch 層で throw する API 失敗（401/4xx 含む）。報告は fetch の rethrowApiCallFailure で行う */
export class ApiCallError extends Error {
  readonly apiLabel: string
  readonly reportable: boolean

  constructor(apiLabel: string, cause: Error, reportable = false) {
    super(cause.message)
    this.name = 'ApiCallError'
    this.apiLabel = apiLabel
    this.reportable = reportable
  }
}

/** API 失敗の client-errors 報告（apiLabel を message に付与） */
export function reportApiCallError(error: ApiCallError): void {
  reportError(new Error(`[apiCall:${error.apiLabel}] ${error.message}`))
}

/**
 * 現在の操作ログのスナップショットを返す（送信用）
 */
export function getActionLogSnapshot(): ActionLogEntry[] {
  return [...loadActionLogFromSessionStorage()]
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
 * ApiCallError は fetch 層で reportApiCallError 済みのため報告しない。
 * 重複防止（同一 message+url の短時間再送抑制）がかかる。
 */
export function reportError(error: unknown): void {
  if (error instanceof ApiCallError) return
  const normalized = error instanceof Error ? error : new Error(String(error))
  const message = normalized.message
  const stack = normalized.stack
  const url = getClientErrorPageUrl()
  if (isDuplicate(message, url)) return
  const payload = buildReportPayload({
    message,
    stack,
    url,
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
  const url = getClientErrorPageUrl()
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
  }).catch((err) => {
    console.error('Failed to send client error report:', err)
  })
}
