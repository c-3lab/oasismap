'use client'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import Toolbar from '@mui/material/Toolbar'
import { ThemeProvider } from '@mui/material'
import theme from '@/theme'

import Header from '@/components/header'


interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <Header simpleHeader={true} />
        <Box sx={{ width: 1 }}>
          <Toolbar />
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default Layout
