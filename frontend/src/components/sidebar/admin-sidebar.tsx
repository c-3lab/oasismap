import { useContext } from 'react'
import { useRouter } from 'next/navigation'
import { pushActionLog, reportError } from '@/libs/client-error-reporting'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import { messageContext } from '@/contexts/message-context'
import { MessageType } from '@/types/message-type'
import { useFetchData } from '@/libs/fetch'
import { signOut, useSession } from 'next-auth/react'
import { ERROR_TYPE } from '@/libs/constants'

interface AdminSidebarProps {
  isOpen?: boolean
  handleDrawerClose: () => void
}

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

const AdminSidebar: React.FC<AdminSidebarProps> = (props) => {
  const noticeMessageContext = useContext(messageContext)
  const router = useRouter()
  const { update } = useSession()
  const { download } = useFetchData()

  const downloadCsv = async () => {
    try {
      pushActionLog('click', 'sidebarExport')
      pushActionLog('apiCall', 'happiness/export')
      const url = backendUrl + '/api/happiness/export'
      // アクセストークンを再取得
      const updatedSession = await update()
      await download(url, updatedSession?.user?.accessToken!)
    } catch (error) {
      reportError(error instanceof Error ? error : new Error(String(error)))
      console.error('Error:', error)
      if (error instanceof Error && error.message === ERROR_TYPE.UNAUTHORIZED) {
        noticeMessageContext.showMessage(
          '再ログインしてください',
          MessageType.Error
        )
        signOut({ redirect: false })
        router.push('/login')
      } else {
        noticeMessageContext.showMessage(
          'データエクスポートに失敗しました',
          MessageType.Error
        )
      }
    }
  }

  return (
    <Drawer anchor="left" open={props.isOpen} onClose={props.handleDrawerClose}>
      <Box sx={{ width: '240px' }}>
        <IconButton
          onClick={props.handleDrawerClose}
          sx={{ p: { xs: '16px', sm: '20px' } }}
        >
          <ChevronLeftIcon />
        </IconButton>
        <Divider />
        <List>
          <ListItem key="happiness-all" disablePadding>
            <ListItemButton
              onClick={() => {
                pushActionLog('click', 'sidebarNav')
                router.push('/happiness/all')
              }}
            >
              <ListItemText primary="全体の幸福度" />
            </ListItemButton>
          </ListItem>
          <ListItem key="happiness-export" disablePadding>
            <ListItemButton onClick={downloadCsv}>
              <ListItemText primary="データのエクスポート" />
            </ListItemButton>
          </ListItem>
          <ListItem key="happiness-import" disablePadding>
            <ListItemButton
              onClick={() => {
                pushActionLog('click', 'sidebarNav')
                router.push('/admin/import')
              }}
            >
              <ListItemText primary="データのインポート" />
            </ListItemButton>
          </ListItem>
          <ListItem key="license" disablePadding>
            <ListItemButton
              onClick={() => {
                pushActionLog('click', 'sidebarNav')
                router.push('/terms/third-party-license')
              }}
            >
              <ListItemText primary="サードパーティライセンス" />
            </ListItemButton>
          </ListItem>
          <ListItem key="logout" disablePadding>
            <ListItemButton
              onClick={() => {
                pushActionLog('click', 'sidebarSignOut')
                signOut({ callbackUrl: '/login' })
              }}
            >
              <ListItemText primary="ログアウト" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  )
}

export default AdminSidebar
