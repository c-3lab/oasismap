'use client'

import MuiButton from '@mui/material/Button'
import MuiIconButton from '@mui/material/IconButton'
import MuiListItemButton from '@mui/material/ListItemButton'
import MuiMenuItem from '@mui/material/MenuItem'
import MuiOutlinedInput from '@mui/material/OutlinedInput'
import MuiTableSortLabel from '@mui/material/TableSortLabel'
import {
  chainOnChange,
  createActionLogOnChangeComponent,
  createActionLogOnClickComponent,
  type WithActionLog,
} from './event-overrides'

export type { ActionLogProp } from './event-overrides'

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
