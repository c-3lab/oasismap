'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { pushActionLog } from '@/libs/error-report'

/** ルート遷移を操作ログに記録（描画なし） */
export default function RouteChangeListener() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname) {
      pushActionLog('routeChange', pathname)
    }
  }, [pathname])

  return null
}
