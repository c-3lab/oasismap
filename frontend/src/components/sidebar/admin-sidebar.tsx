import { useContext } from 'react'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import { messageContext } from '@/contexts/message-context'
import { MessageType } from '@/types/message-type'
import { download } from '@/libs/fetch'
import { signOut, useSession } from 'next-auth/react'

interface AdminSidebarProps {
  isOpen?: boolean
  handleDrawerClose: () => void
}

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

const AdminSidebar: React.FC<AdminSidebarProps> = (props) => {
  const noticeMessageContext = useContext(messageContext)
  const { update } = useSession()

  const downloadCsv = async () => {
    try {
      const url = backendUrl + '/api/happiness/export'
      // アクセストークンを再取得
      const updatedSession = await update()
      await download(url, updatedSession?.user?.accessToken!)
    } catch (error) {
      console.error('Error:', error)
      noticeMessageContext.showMessage(
        'データエクスポートに失敗しました',
        MessageType.Error
      )
    }
  }

  return (
    <Drawer
      anchor="right"
      open={props.isOpen}
      onClose={props.handleDrawerClose}
    >
      <Box sx={{ width: '240px' }}>
        <IconButton
          onClick={props.handleDrawerClose}
          sx={{ p: { xs: '16px', sm: '20px' } }}
        >
          <ChevronRightIcon />
        </IconButton>
        <Divider />
        <List>
          <ListItem key="happiness" disablePadding>
            <ListItemButton onClick={downloadCsv}>
              <ListItemText primary="データのエクスポート" />
            </ListItemButton>
          </ListItem>
          <ListItem key="logout" disablePadding>
            <ListItemButton onClick={() => signOut({ callbackUrl: '/login' })}>
              <ListItemText primary="ログアウト" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  )
}

export default AdminSidebar
