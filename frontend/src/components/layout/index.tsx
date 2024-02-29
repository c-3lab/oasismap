'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import theme from '@/theme'
import {
  Box,
  CssBaseline,
  Toolbar,
  Snackbar,
  Alert,
  ThemeProvider,
} from '@mui/material'

import Header from '@/components/header'
import GeneralSidebar from '@/components/sidebar/general-sidebar'
import { messageContext } from '@/contexts/message-context'
import { useNoticeMessage } from '@/hooks/notice-message'
import { SessionProvider } from 'next-auth/react'

interface LayoutProps {
  simple?: boolean
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ simple = false, children }) => {
  const noticeMessageContext = useNoticeMessage()
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
        <messageContext.Provider value={noticeMessageContext}>
          <SessionProvider>
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
          </SessionProvider>
          {noticeMessageContext.message && (
            <Snackbar
              open={true}
              autoHideDuration={6000}
              onClose={noticeMessageContext.clearMessage}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Alert
                onClose={noticeMessageContext.clearMessage}
                severity="success"
                variant="filled"
                sx={{ width: '100%' }}
              >
                {noticeMessageContext.message}
              </Alert>
            </Snackbar>
          )}
        </messageContext.Provider>
      )}
    </ThemeProvider>
  )
}

export default Layout
