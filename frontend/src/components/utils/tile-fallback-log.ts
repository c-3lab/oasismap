import { reportError } from '@/libs/client-error-reporting'

/**
 * エラー情報をログ出力し、フォールバックを有効化する。
 */
export async function handleTileError(
  setUseFallback: (v: boolean) => void
): Promise<void> {
  reportError(new Error('Map tile load failed: OpenStreetMap tile failed'))
  console.warn('Map tile fallback: OpenStreetMap tile failed')
  setUseFallback(true)
}
