'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import theme from '@/theme'
import { Box, CssBaseline, Toolbar, ThemeProvider } from '@mui/material'

import Header from '@/components/header'
import Sidebar from '@/components/sidebar/sidebar'
import { SessionProvider } from 'next-auth/react'

interface LayoutProps {
  simple?: boolean
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ simple = false, children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // パス名が変更されたらサイドバーを閉じる
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <ThemeProvider theme={theme}>
      {simple ? (
        <Box sx={{ display: 'flex' }}>
          <CssBaseline />
          <Header simple={true} />
          <Box sx={{ width: 1 }}>
            <Toolbar />
            {children}
          </Box>
        </Box>
      ) : (
        <SessionProvider refetchOnWindowFocus={false}>
          <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <Header
              handleDrawerOpen={() => {
                setIsOpen(true)
              }}
            />
            <Box sx={{ width: 1 }}>
              <Toolbar />
              {children}
            </Box>
            <Sidebar
              isOpen={isOpen}
              handleDrawerClose={() => {
                setIsOpen(false)
              }}
            />
          </Box>
        </SessionProvider>
      )}
    </ThemeProvider>
  )
}

export default Layout
