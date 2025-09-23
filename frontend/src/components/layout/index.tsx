'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import theme from '@/theme'
import { Box, CssBaseline, Toolbar, ThemeProvider } from '@mui/material'

import Header from '@/components/header'
import Sidebar from '@/components/sidebar/sidebar'
import SearchDrawer from '@/components/search-drawer'
import { SessionProvider } from 'next-auth/react'
import { SearchProvider, useSearchContext } from '@/contexts/search-context'

interface LayoutProps {
  simple?: boolean
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ simple = false, children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const pathname = usePathname()

  // パス名が変更されたらサイドバーを閉じる
  useEffect(() => {
    setIsOpen(false)
    setIsFilterOpen(false)
  }, [pathname])

  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <ThemeProvider theme={theme}>
        <SearchProvider>
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
            <Box sx={{ display: 'flex' }}>
              <CssBaseline />
              <Header
                handleDrawerOpen={() => {
                  setIsOpen(true)
                }}
                handleFilterOpen={() => {
                  setIsFilterOpen(true)
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
              <SearchDrawerWrapper
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
              />
            </Box>
          )}
        </SearchProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}

const SearchDrawerWrapper: React.FC<{
  isOpen: boolean
  onClose: () => void
}> = ({ isOpen, onClose }) => {
  const { onSearch, isLoading } = useSearchContext()

  if (!onSearch) return null

  return (
    <SearchDrawer
      isOpen={isOpen}
      onClose={onClose}
      onSearch={onSearch}
      isLoading={isLoading}
    />
  )
}

export default Layout
