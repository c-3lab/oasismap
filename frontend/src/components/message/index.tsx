'use client'
import { Snackbar, Alert } from '@mui/material'

import { messageContext } from '@/contexts/message-context'
import { useNoticeMessage } from '@/hooks/notice-message'

interface MessageProps {
  children: React.ReactNode
}

const MessageArea: React.FC<MessageProps> = ({ children }) => {
  const noticeMessageContext = useNoticeMessage()

  return (
    <messageContext.Provider value={noticeMessageContext}>
      {children}
      {noticeMessageContext.message && (
        <Snackbar
          open={true}
          autoHideDuration={6000}
          onClose={(_, reason) => {
            if (reason === 'clickaway') return
            noticeMessageContext.clearMessage()
          }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={noticeMessageContext.clearMessage}
            severity={noticeMessageContext.type}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {noticeMessageContext.message}
          </Alert>
        </Snackbar>
      )}
    </messageContext.Provider>
  )
}

export default MessageArea
