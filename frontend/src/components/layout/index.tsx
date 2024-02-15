'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import Toolbar from '@mui/material/Toolbar'
import { ThemeProvider } from '@mui/material'
import theme from '@/theme'

import Header from '@/components/header'
import GeneralSidebar from '@/components/sidebar/general-sidebar'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // パス名が変更されたらサイドバーを閉じる
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <ThemeProvider theme={theme}>
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
        <GeneralSidebar
          isOpen={isOpen}
          handleDrawerClose={() => {
            setIsOpen(false)
          }}
        />
      </Box>
    </ThemeProvider>
  )
}

export default Layout
