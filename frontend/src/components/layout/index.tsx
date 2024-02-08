'use client'
import { useState } from 'react'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import Toolbar from '@mui/material/Toolbar'

import Header from '@/components/header'
import GeneralSidebar from '@/components/sidebar/general-sidebar'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
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
  )
}

export default Layout