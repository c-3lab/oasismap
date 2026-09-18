'use client'

import MuiButton from '@mui/material/Button'
import MuiIconButton from '@mui/material/IconButton'
import MuiListItemButton from '@mui/material/ListItemButton'
import MuiMenuItem from '@mui/material/MenuItem'
import MuiOutlinedInput from '@mui/material/OutlinedInput'
import MuiTableSortLabel from '@mui/material/TableSortLabel'
import { pushActionLog } from '@/libs/client-error-reporting'

export type ActionLogProp = string

type WithActionLog = {
  actionLog?: ActionLogProp
}

/** click 型の ActionLog* ラッパー用。地図・routeChange・apiCall は各呼び出し元で直接 pushActionLog する */
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
function chainOnChange<E extends React.SyntheticEvent>(
  actionLog?: ActionLogProp,
  handler?: (event: E) => void
) {
  return (event: E) => {
    recordActionLog(actionLog)
    handler?.(event)
  }
}

/** onClick 付き MUI コンポーネント向けの薄い ActionLog ラッパーを作る */
function createActionLogOnClickComponent<P>(
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
function createActionLogOnChangeComponent<P>(
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

export const ActionLogButton = createActionLogOnClickComponent(
  MuiButton,
  'ActionLogButton'
)
export const ActionLogIconButton = createActionLogOnClickComponent(
  MuiIconButton,
  'ActionLogIconButton'
)
export const ActionLogListItemButton = createActionLogOnClickComponent(
  MuiListItemButton,
  'ActionLogListItemButton'
)
export const ActionLogMenuItem = createActionLogOnClickComponent(
  MuiMenuItem,
  'ActionLogMenuItem'
)
export const ActionLogTableSortLabel = createActionLogOnClickComponent(
  MuiTableSortLabel,
  'ActionLogTableSortLabel'
)
export const ActionLogOutlinedInput = createActionLogOnChangeComponent(
  MuiOutlinedInput,
  'ActionLogOutlinedInput'
)

// native input は型の都合でファクトリではなく chainOnChange を直接使う
function ActionLogInputComponent({
  actionLog,
  onChange,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & WithActionLog) {
  return <input {...rest} onChange={chainOnChange(actionLog, onChange)} />
}
ActionLogInputComponent.displayName = 'ActionLogInput'
export const ActionLogInput = ActionLogInputComponent
