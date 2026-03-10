import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'
import MessageArea from '@/components/message'
import { LoadingProvider } from '@/components/spinner'
import { RuntimeConfigProvider } from '@/contexts/runtime-config-context'
import { getRuntimeConfig } from '@/libs/runtime-config'

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '地域幸福度可視化アプリ',
  description:
    'ウェルビーイングを実現する地域共同ウェルビーイングのための可視化プラットフォーム',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const runtimeConfig = getRuntimeConfig()
  return (
    <html lang="ja">
      <body className={inter.className}>
        <AppRouterCacheProvider>
          <RuntimeConfigProvider initialConfig={runtimeConfig}>
            <MessageArea>
              <LoadingProvider>{children}</LoadingProvider>
            </MessageArea>
          </RuntimeConfigProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}
