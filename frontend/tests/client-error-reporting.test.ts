type ClientErrorReporting = typeof import('@/libs/client-error-reporting')

async function loadModule(): Promise<ClientErrorReporting> {
  jest.resetModules()
  return import('@/libs/client-error-reporting')
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
  let mod: ClientErrorReporting

  beforeEach(async () => {
    mod = await loadModule()
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

  it('スナップショットは内部配列のコピーである', () => {
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
})

describe('setActionLogNickname', () => {
  let mod: ClientErrorReporting

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
  let mod: ClientErrorReporting

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
  let mod: ClientErrorReporting

  beforeEach(async () => {
    mockNavigatorGeolocation()
    mod = await loadModule()
  })

  it('初期状態は not_attempted', () => {
    expect(mod.getGeolocationStatus()).toBe('not_attempted')
  })

  it('setGeolocationStatus で返却値が変わる', () => {
    mod.setGeolocationStatus('available')
    expect(mod.getGeolocationStatus()).toBe('available')
  })
})

describe('isDuplicate / markSent', () => {
  let mod: ClientErrorReporting

  beforeEach(async () => {
    jest.useFakeTimers()
    mod = await loadModule()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('markSent 直後の同一 message+url は重複', () => {
    mod.markSent('err', 'https://example.com/')
    expect(mod.isDuplicate('err', 'https://example.com/')).toBe(true)
  })

  it('5秒後は重複とみなさない', () => {
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
  let mod: ClientErrorReporting

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
})

describe('toError', () => {
  let mod: ClientErrorReporting

  beforeEach(async () => {
    mod = await loadModule()
  })

  it('Error インスタンスはそのまま返す', () => {
    const err = new Error('native')
    expect(mod.toError(err)).toBe(err)
  })

  it('非 Error は Error に変換する', () => {
    const err = mod.toError('oops')
    expect(err).toBeInstanceOf(Error)
    expect(err.message).toBe('oops')
  })
})

describe('reportError', () => {
  let mod: ClientErrorReporting

  beforeEach(async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true })
    mod = await loadModule()
  })

  it('/api/client-errors に JSON を POST する', () => {
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

  it('短時間の同一エラーは2回目送信しない', () => {
    mod.reportError(new Error('dup'))
    mod.reportError(new Error('dup'))
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})
