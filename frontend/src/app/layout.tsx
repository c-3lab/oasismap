import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'

import Layout from '@/components/layout'

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'OASISmap',
  description:
    'ウェルビーイングを実現する地域共同ウェルビーイングのための可視化プラットフォーム',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <AppRouterCacheProvider>
          <Layout>{children}</Layout>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}
