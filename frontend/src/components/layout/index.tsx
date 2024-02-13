'use client'
import { useState } from 'react'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import Toolbar from '@mui/material/Toolbar'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

import Header from '@/components/header'
import GeneralSidebar from '@/components/sidebar/general-sidebar'
import { MessagesContext } from '@/Contexts'
import { useNoticeMessages } from '@/hooks/useNoticeMessages'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const messagesContext = useNoticeMessages([])
  const [isOpen, setIsOpen] = useState(false)

  const snackbars = messagesContext.messages.map((message) => (
    <Snackbar
      key={message.uuid}
      open={true}
      autoHideDuration={6000} // 6秒で閉じる
      onClose={() => {
        messagesContext.removeMessage(message.uuid)
      }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} // 右下に表示
    >
      <Alert
        onClose={() => {
          messagesContext.removeMessage(message.uuid)
        }}
        severity="success"
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message.text}
      </Alert>
    </Snackbar>
  ))

  return (
    <MessagesContext.Provider value={messagesContext}>
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
      {snackbars}
    </MessagesContext.Provider>
  )
}

export default Layout
