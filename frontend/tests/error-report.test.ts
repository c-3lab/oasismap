type ErrorReportModule = typeof import('@/libs/error-report')

const ACTION_LOG_SESSION_STORAGE_KEY = 'oasismap:client-error-action-log'

async function loadModule(): Promise<ErrorReportModule> {
  jest.resetModules()
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.clear()
  }
  return import('@/libs/error-report')
}

/** jsdom では geolocation が無いことがあり、getGeolocationStatus が常に not_supported になる */
function mockNavigatorGeolocation(): void {
  Object.defineProperty(global.navigator, 'geolocation', {
    value: {},
    configurable: true,
    writable: true,
  })
}

describe('pushActionLog / getActionLogSnapshot', () => {
  let mod: ErrorReportModule

  beforeEach(async () => {
    mod = await loadModule()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('push した直近の操作がスナップショットに含まれる', () => {
    mod.pushActionLog('click', 'testButton')

    const snapshot = mod.getActionLogSnapshot()
    expect(snapshot).toHaveLength(1)

    expect(snapshot[0]).toMatchObject({
      type: 'click',
      label: 'testButton',
    })
    expect(snapshot[0].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('getActionLogSnapshot は毎回新しい配列を返す', () => {
    mod.pushActionLog('click', 'a')
    const s1 = mod.getActionLogSnapshot()
    const s2 = mod.getActionLogSnapshot()
    expect(s1).toEqual(s2)
    expect(s1).not.toBe(s2)
  })

  it('logApiCall は apiCall 型で記録する', () => {
    mod.logApiCall('happiness/list')
    const last = mod.getActionLogSnapshot().at(-1)
    expect(last).toMatchObject({ type: 'apiCall', label: 'happiness/list' })
  })

  it('最大20件を超えると最古が削除される', () => {
    for (let i = 0; i < 21; i++) {
      mod.pushActionLog('click', `btn-${i}`)
    }
    const snapshot = mod.getActionLogSnapshot()
    expect(snapshot).toHaveLength(20)
    expect(snapshot[0].label).toBe('btn-1')
    expect(snapshot[19].label).toBe('btn-20')
  })

  it('モジュール再読み込み後も sessionStorage から操作ログを復元する', async () => {
    mod.pushActionLog('click', 'beforeReload')
    const before = mod.getActionLogSnapshot()

    jest.resetModules()
    mod = await import('@/libs/error-report')

    expect(mod.getActionLogSnapshot()).toEqual(before)
  })

  it('sessionStorage の不正 JSON は空配列として扱う', async () => {
    mod = await loadModule()
    sessionStorage.setItem(ACTION_LOG_SESSION_STORAGE_KEY, 'not-json{')
    jest.resetModules()
    mod = await import('@/libs/error-report')
    expect(mod.getActionLogSnapshot()).toEqual([])
  })

  it('sessionStorage の非配列 JSON は空配列として扱う', async () => {
    mod = await loadModule()
    sessionStorage.setItem(
      ACTION_LOG_SESSION_STORAGE_KEY,
      JSON.stringify({ type: 'click' })
    )
    jest.resetModules()
    mod = await import('@/libs/error-report')
    expect(mod.getActionLogSnapshot()).toEqual([])
  })

  it('sessionStorage から復元時に不正エントリを除外し nickname を保持する', async () => {
    mod = await loadModule()
    sessionStorage.setItem(
      ACTION_LOG_SESSION_STORAGE_KEY,
      JSON.stringify([
        null,
        { type: 'invalid', label: 'x', timestamp: '2020-01-01T00:00:00.000Z' },
        {
          type: 'click',
          label: 'valid',
          timestamp: '2020-01-01T00:00:00.000Z',
          nickname: 'nick',
        },
        {
          type: 'click',
          label: 'no-nick',
          timestamp: '2020-01-01T00:00:00.000Z',
          nickname: 123,
        },
      ])
    )
    jest.resetModules()
    mod = await import('@/libs/error-report')
    expect(mod.getActionLogSnapshot()).toEqual([
      {
        type: 'click',
        label: 'valid',
        timestamp: '2020-01-01T00:00:00.000Z',
        nickname: 'nick',
      },
      {
        type: 'click',
        label: 'no-nick',
        timestamp: '2020-01-01T00:00:00.000Z',
      },
    ])
  })

  it('sessionStorage に 21 件以上あるとき復元は直近 20 件に切り詰める', async () => {
    mod = await loadModule()
    const entries = Array.from({ length: 21 }, (_, i) => ({
      type: 'click' as const,
      label: `stored-${i}`,
      timestamp: '2020-01-01T00:00:00.000Z',
    }))
    sessionStorage.setItem(
      ACTION_LOG_SESSION_STORAGE_KEY,
      JSON.stringify(entries)
    )
    jest.resetModules()
    mod = await import('@/libs/error-report')
    const snapshot = mod.getActionLogSnapshot()
    expect(snapshot).toHaveLength(20)
    expect(snapshot[0].label).toBe('stored-1')
    expect(snapshot[19].label).toBe('stored-20')
  })

  it('sessionStorage.getItem が throw しても空配列を返す', async () => {
    mod = await loadModule()
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage denied')
    })
    expect(mod.getActionLogSnapshot()).toEqual([])
  })

  it('sessionStorage.setItem が throw しても pushActionLog は例外を投げない', async () => {
    mod = await loadModule()
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded')
    })
    expect(() => mod.pushActionLog('click', 'quota')).not.toThrow()
  })

  it('sessionStorage 無しでは push しても getActionLogSnapshot は空', async () => {
    const saved = global.sessionStorage
    try {
      // @ts-expect-error テスト用に sessionStorage を外す
      delete global.sessionStorage
      mod = await loadModule()
      mod.pushActionLog('click', 'ephemeral')
      expect(mod.getActionLogSnapshot()).toEqual([])
    } finally {
      global.sessionStorage = saved
    }
  })
})

describe('setActionLogNickname', () => {
  let mod: ErrorReportModule

  beforeEach(async () => {
    mod = await loadModule()
  })

  it('ニックネーム設定後の push に nickname が付く', () => {
    mod.setActionLogNickname('test-user')
    mod.pushActionLog('click', 'sidebarNav')
    expect(mod.getActionLogSnapshot()[0].nickname).toBe('test-user')
  })

  it('undefined でニックネームをクリアすると付与しない', () => {
    mod.setActionLogNickname('test-user')
    mod.setActionLogNickname(undefined)
    mod.pushActionLog('click', 'sidebarSignOut')
    expect(mod.getActionLogSnapshot()[0].nickname).toBeUndefined()
  })
})

describe('positionErrorCodeToStatus', () => {
  let mod: ErrorReportModule

  beforeEach(async () => {
    mod = await loadModule()
  })

  it.each([
    [1, 'permission_denied'],
    [2, 'position_unavailable'],
    [3, 'timeout'],
    [99, 'position_unavailable'],
  ] as const)('code %i → %s', (code, expected) => {
    expect(mod.positionErrorCodeToStatus(code)).toBe(expected)
  })
})

describe('getGeolocationStatus / setGeolocationStatus', () => {
  let mod: ErrorReportModule

  beforeEach(async () => {
    mockNavigatorGeolocation()
    mod = await loadModule()
  })

  it('初期状態は not_attempted', () => {
    expect(mod.getGeolocationStatus()).toBe('not_attempted')
  })

  it('setGeolocationStatus 後 getGeolocationStatus が同じ値になる', () => {
    mod.setGeolocationStatus('available')
    expect(mod.getGeolocationStatus()).toBe('available')
  })

  it('navigator.geolocation が無いとき not_supported を返す', async () => {
    const geolocation = navigator.geolocation
    Object.defineProperty(navigator, 'geolocation', {
      value: undefined,
      configurable: true,
    })
    mod = await loadModule()
    expect(mod.getGeolocationStatus()).toBe('not_supported')
    Object.defineProperty(navigator, 'geolocation', {
      value: geolocation,
      configurable: true,
    })
  })
})

describe('isDuplicate / markSent', () => {
  let mod: ErrorReportModule

  beforeEach(async () => {
    jest.useFakeTimers()
    mod = await loadModule()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('isDuplicate は markSent 直後の同一 message+url で true', () => {
    mod.markSent('err', 'https://example.com/')
    expect(mod.isDuplicate('err', 'https://example.com/')).toBe(true)
  })

  it('isDuplicate は markSent から 5 秒後は false', () => {
    mod.markSent('err', 'https://example.com/')
    jest.advanceTimersByTime(5000)
    expect(mod.isDuplicate('err', 'https://example.com/')).toBe(false)
  })

  it('message が異なれば重複とみなさない', () => {
    mod.markSent('err-a', 'https://example.com/')
    expect(mod.isDuplicate('err-b', 'https://example.com/')).toBe(false)
  })
})

describe('buildReportPayload', () => {
  let mod: ErrorReportModule

  beforeEach(async () => {
    mockNavigatorGeolocation()
    mod = await loadModule()
  })

  it('actionLog.entries に操作ログスナップショットが入る', () => {
    mod.pushActionLog('routeChange', '/happiness/me')
    const parsed = JSON.parse(
      mod.buildReportPayload({ message: 'm', url: 'https://x/' })
    )
    expect(parsed.actionLog.entries).toEqual(mod.getActionLogSnapshot())
  })

  it('not_attempted のとき environment に geolocationStatus を付けない', () => {
    const parsed = JSON.parse(
      mod.buildReportPayload({ message: 'm', url: 'https://x/' })
    )
    expect(parsed.environment.userAgent).toBe(navigator.userAgent)
    expect(parsed.environment.geolocationStatus).toBeUndefined()
  })

  it('not_attempted 以外のとき geolocationStatus を含める', () => {
    mod.setGeolocationStatus('permission_denied')
    const parsed = JSON.parse(
      mod.buildReportPayload({ message: 'm', url: 'https://x/' })
    )
    expect(parsed.environment.geolocationStatus).toBe('permission_denied')
  })

  it('stack と geolocationErrorCode を error に含める', () => {
    const parsed = JSON.parse(
      mod.buildReportPayload({
        message: 'geo',
        url: 'https://x/',
        stack: 'stack-line',
        geolocationErrorCode: 1,
      })
    )
    expect(parsed.error.stack).toBe('stack-line')
    expect(parsed.error.geolocationErrorCode).toBe(1)
  })

  it('空の message は error.message を空文字にする', () => {
    const parsed = JSON.parse(
      mod.buildReportPayload({ message: '', url: 'https://x/' })
    )
    expect(parsed.error.message).toBe('')
  })

  it('message / url / stack は MAX_STRING_LENGTH で切り詰める', () => {
    const long = 'x'.repeat(2500)
    const parsed = JSON.parse(
      mod.buildReportPayload({
        message: long,
        url: long,
        stack: long,
      })
    )
    expect(parsed.error.message).toHaveLength(2000)
    expect(parsed.error.url).toHaveLength(2000)
    expect(parsed.error.stack).toHaveLength(2000)
  })
})

describe('reportError', () => {
  let mod: ErrorReportModule

  beforeEach(async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true })
    mod = await loadModule()
  })

  describe('正規化', () => {
    it('Error.message を client-errors の body に載せる', () => {
      mod.reportError(new Error('native'))
      const body = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body)
      expect(body.error.message).toBe('native')
    })

    it('非 Error は文字列化して client-errors の body に載せる', () => {
      mod.reportError('oops')
      const body = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body)
      expect(body.error.message).toBe('oops')
    })

    it('ApiCallError は無視し fetch しない', () => {
      mod.reportError(
        new mod.ApiCallError('happiness/import', new Error('csv invalid'))
      )
      expect(fetch).not.toHaveBeenCalled()
    })
  })

  describe('POST /api/client-errors', () => {
    it('POST し error.message を載せる', () => {
      mod.reportError(new Error('test'))
      expect(fetch).toHaveBeenCalledWith(
        '/api/client-errors',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      )
      const body = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body)
      expect(body.error.message).toBe('test')
    })
  })

  describe('重複抑制', () => {
    it('同一 message+url は 5 秒以内に 2 回目 POST しない', () => {
      mod.reportError(new Error('dup'))
      mod.reportError(new Error('dup'))
      expect(fetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('getClientErrorPageUrl 経由', () => {
    it('document 無しでは error.url が空文字', () => {
      const documentDescriptor = Object.getOwnPropertyDescriptor(
        globalThis,
        'document'
      )
      try {
        Object.defineProperty(globalThis, 'document', {
          configurable: true,
          get: () => undefined,
        })
        mod.reportError(new Error('no document'))
        const body = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body)
        expect(body.error.url).toBe('')
      } finally {
        if (documentDescriptor) {
          Object.defineProperty(globalThis, 'document', documentDescriptor)
        }
      }
    })
  })
})

describe('ApiCallError / reportApiCallError', () => {
  let mod: ErrorReportModule

  beforeEach(async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true })
    mod = await loadModule()
  })

  it('ApiCallError は元の message を保持する', () => {
    const err = new mod.ApiCallError(
      'happiness/import',
      new Error('csv invalid')
    )
    expect(err).toBeInstanceOf(mod.ApiCallError)
    expect(err.apiLabel).toBe('happiness/import')
    expect(err.message).toBe('csv invalid')
  })

  it('reportApiCallError は apiLabel 付き message で POST する', () => {
    const err = new mod.ApiCallError('happiness/import', new Error('fail'))
    mod.reportApiCallError(err)
    const body = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body)
    expect(body.error.message).toBe('[apiCall:happiness/import] fail')
  })
})

describe('reportPositionError', () => {
  let mod: ErrorReportModule

  beforeEach(async () => {
    mockNavigatorGeolocation()
    global.fetch = jest.fn().mockResolvedValue({ ok: true })
    mod = await loadModule()
  })

  it('geolocationErrorCode と geolocationStatus を載せて POST し setGeolocationStatus を更新する', () => {
    mod.reportPositionError(1)
    expect(fetch).toHaveBeenCalledWith(
      '/api/client-errors',
      expect.objectContaining({ method: 'POST' })
    )
    const body = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body)
    expect(body.error.message).toBe(
      'Geolocation error: permission_denied (code 1)'
    )
    expect(body.error.geolocationErrorCode).toBe(1)
    expect(body.environment.geolocationStatus).toBe('permission_denied')
    expect(mod.getGeolocationStatus()).toBe('permission_denied')
  })

  it('同一 message+url は 5 秒以内に 2 回目 POST しない', () => {
    mod.reportPositionError(2)
    mod.reportPositionError(2)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('getClientErrorPageUrl 経由: document 無しでは error.url が空文字', () => {
    const documentDescriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      'document'
    )
    try {
      Object.defineProperty(globalThis, 'document', {
        configurable: true,
        get: () => undefined,
      })
      mod.reportPositionError(3)
      const body = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body)
      expect(body.error.url).toBe('')
    } finally {
      if (documentDescriptor) {
        Object.defineProperty(globalThis, 'document', documentDescriptor)
      }
    }
  })
})

describe('sendClientError', () => {
  let mod: ErrorReportModule

  beforeEach(async () => {
    mod = await loadModule()
  })

  it('fetch 失敗時は console.error に記録する', async () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    global.fetch = jest.fn().mockRejectedValue(new Error('network down'))
    mod.sendClientError('{}')
    await Promise.resolve()
    await Promise.resolve()
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to send client error report:',
      expect.any(Error)
    )
    consoleSpy.mockRestore()
  })
})
