import { useContext } from 'react'
import { useRouter } from 'next/navigation'
import { clickActions, apiActions } from '@/libs/action-log-definitions'
import type { ActionDefinition } from '@/libs/action-log-definitions'
import { action } from '@/libs/action-log'
import { reportError } from '@/libs/client-error-reporting'
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
import { useRuntimeConfig } from '@/contexts/runtime-config-context'

interface AdminSidebarProps {
  isOpen?: boolean
  handleDrawerClose: () => void
}

type NavItem = {
  key: string
  text: string
  path: string
  action: ActionDefinition
}

const NAV_ITEMS: NavItem[] = [
  {
    key: 'happiness-import',
    text: 'データのインポート',
    path: '/admin/import',
    action: clickActions.sidebarNav('/admin/import'),
  },
  {
    key: 'license',
    text: 'サードパーティライセンス',
    path: '/terms/third-party-license',
    action: clickActions.sidebarNav('/terms/third-party-license'),
  },
]

const AdminSidebar: React.FC<AdminSidebarProps> = (props) => {
  const config = useRuntimeConfig()
  const backendUrl = config.NEXT_PUBLIC_BACKEND_URL ?? ''
  const noticeMessageContext = useContext(messageContext)
  const router = useRouter()
  const { update } = useSession()
  const { download } = useFetchData()

  const downloadCsv = async () => {
    try {
      const url = backendUrl + '/api/happiness/export'
      const updatedSession = await update()
      await download(
        url,
        updatedSession?.user?.accessToken!,
        apiActions.happinessExport
      )
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
              onClick={action(clickActions.sidebarNav('/happiness/all'), () =>
                router.push('/happiness/all')
              )}
            >
              <ListItemText primary="全体の幸福度" />
            </ListItemButton>
          </ListItem>
          <ListItem key="happiness-export" disablePadding>
            <ListItemButton
              onClick={action(clickActions.sidebarExport, downloadCsv)}
            >
              <ListItemText primary="データのエクスポート" />
            </ListItemButton>
          </ListItem>
          {NAV_ITEMS.map((item) => (
            <ListItem key={item.key} disablePadding>
              <ListItemButton
                onClick={action(item.action, () => router.push(item.path))}
              >
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
          <ListItem key="logout" disablePadding>
            <ListItemButton
              onClick={action(clickActions.sidebarSignOut, () =>
                signOut({ callbackUrl: '/login' })
              )}
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
