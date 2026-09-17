import { useContext } from 'react'
import { useRouter } from 'next/navigation'
import { ActionLogListItemButton } from '@/components/mui'
import { pushActionLog, reportError } from '@/libs/client-error-reporting'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import { messageContext } from '@/contexts/message-context'
import { MessageType } from '@/types/message-type'
import { useFetchData } from '@/libs/fetch'
import { signOut, useSession } from 'next-auth/react'
import { ERROR_TYPE } from '@/libs/constants'
import { useRuntimeConfig } from '@/contexts/runtime-config-context'

interface AdminSidebarProps {
  isOpen?: boolean
  handleDrawerClose: () => void
}

const AdminSidebar: React.FC<AdminSidebarProps> = (props) => {
  const config = useRuntimeConfig()
  const backendUrl = config.NEXT_PUBLIC_BACKEND_URL ?? ''
  const noticeMessageContext = useContext(messageContext)
  const router = useRouter()
  const { update } = useSession()
  const { download } = useFetchData()

  const downloadCsv = async () => {
    try {
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
            <ActionLogListItemButton
              actionLog="sidebarNav"
              onClick={() => router.push('/happiness/all')}
            >
              <ListItemText primary="全体の幸福度" />
            </ActionLogListItemButton>
          </ListItem>
          <ListItem key="happiness-export" disablePadding>
            <ActionLogListItemButton
              actionLog="sidebarExport"
              onClick={downloadCsv}
            >
              <ListItemText primary="データのエクスポート" />
            </ActionLogListItemButton>
          </ListItem>
          <ListItem key="happiness-import" disablePadding>
            <ActionLogListItemButton
              actionLog="sidebarNav"
              onClick={() => router.push('/admin/import')}
            >
              <ListItemText primary="データのインポート" />
            </ActionLogListItemButton>
          </ListItem>
          <ListItem key="license" disablePadding>
            <ActionLogListItemButton
              actionLog="sidebarNav"
              onClick={() => router.push('/terms/third-party-license')}
            >
              <ListItemText primary="サードパーティライセンス" />
            </ActionLogListItemButton>
          </ListItem>
          <ListItem key="logout" disablePadding>
            <ActionLogListItemButton
              actionLog="sidebarSignOut"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <ListItemText primary="ログアウト" />
            </ActionLogListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  )
}

export default AdminSidebar
