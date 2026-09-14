import type { ActionDefinition } from '@/libs/action-log-definitions'
import { pushActionLogEntry } from '@/libs/client-error-reporting'

/**
 * ActionDefinition を操作ログバッファに記録する。
 */
export function logAction(actionDef: ActionDefinition): void {
  pushActionLogEntry(actionDef)
}

/**
 * 操作を記録してからハンドラを実行するラッパーを生成する。
 * handler を省略した場合は記録のみ行う。
 */
export function action<A extends unknown[], R>(
  actionDef: ActionDefinition,
  handler?: (...args: A) => R
): (...args: A) => R | undefined {
  return (...args: A) => {
    logAction(actionDef)
    return handler?.(...args)
  }
}
