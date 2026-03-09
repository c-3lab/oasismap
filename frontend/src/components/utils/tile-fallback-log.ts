/**
 * エラー情報をログ出力し、フォールバックを有効化する。
 */
export async function handleTileError(
  setUseFallback: (v: boolean) => void
): Promise<void> {
  console.warn('Map tile fallback: OpenStreetMap tile failed')
  setUseFallback(true)
}
