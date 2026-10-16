'use client'

import { pushActionLog } from '@/libs/error-report'

export type ActionLogProp = string

export type WithActionLog = {
  actionLog?: ActionLogProp
}

/** click 型の ActionLog* ラッパー用。apiCall は fetch.ts、routeChange は route-change-listener、地図は各呼び出し元で記録する。 */
function recordActionLog(actionLog?: ActionLogProp) {
  if (!actionLog) return
  pushActionLog('click', actionLog)
}

/** onClick: ログ記録 → 元ハンドラ の順で実行する関数を返す */
function chainOnClick<E extends React.SyntheticEvent>(
  actionLog?: ActionLogProp,
  handler?: (event: E) => void
) {
  return (event: E) => {
    recordActionLog(actionLog)
    handler?.(event)
  }
}

/** onChange: ログ記録 → 元ハンドラ の順で実行する関数を返す */
export function chainOnChange<E extends React.SyntheticEvent>(
  actionLog?: ActionLogProp,
  handler?: (event: E) => void
) {
  return (event: E) => {
    recordActionLog(actionLog)
    handler?.(event)
  }
}

/** onClick 付き MUI コンポーネント向けの薄い ActionLog ラッパーを作る */
export function createActionLogOnClickComponent<P>(
  Component: React.ComponentType<P>,
  displayName: string
): React.FC<P & WithActionLog> {
  function ActionLogComponent(props: P & WithActionLog) {
    const { actionLog, onClick, ...rest } = props as P &
      WithActionLog & {
        onClick?: (event: React.MouseEvent) => void
      }
    return (
      <Component {...(rest as P)} onClick={chainOnClick(actionLog, onClick)} />
    )
  }
  ActionLogComponent.displayName = displayName
  return ActionLogComponent
}

/** onChange 付き MUI コンポーネント向けの薄い ActionLog ラッパーを作る */
export function createActionLogOnChangeComponent<P>(
  Component: React.ComponentType<P>,
  displayName: string
): React.FC<P & WithActionLog> {
  function ActionLogComponent(props: P & WithActionLog) {
    const { actionLog, onChange, ...rest } = props as P &
      WithActionLog & {
        onChange?: (event: React.SyntheticEvent) => void
      }
    return (
      <Component
        {...(rest as P)}
        onChange={chainOnChange(actionLog, onChange)}
      />
    )
  }
  ActionLogComponent.displayName = displayName
  return ActionLogComponent
}
