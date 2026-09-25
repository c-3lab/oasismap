import { useRouter } from 'next/navigation'
import { ActionLogListItemButton } from '@/components/mui'
import { useApiErrorHandler } from '@/hooks/use-api-error-handler'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import { useFetchData } from '@/libs/fetch'
import { signOut, useSession } from 'next-auth/react'
import { useRuntimeConfig } from '@/contexts/runtime-config-context'

interface AdminSidebarProps {
  isOpen?: boolean
  handleDrawerClose: () => void
}

const AdminSidebar: React.FC<AdminSidebarProps> = (props) => {
  const config = useRuntimeConfig()
  const backendUrl = config.NEXT_PUBLIC_BACKEND_URL ?? ''
  const router = useRouter()
  const { update } = useSession()
  const { download } = useFetchData()
  const { handleApiError } = useApiErrorHandler()

  const downloadCsv = async () => {
    try {
      const url = backendUrl + '/api/happiness/export'
      // アクセストークンを再取得
      const updatedSession = await update()
      await download(url, updatedSession?.user?.accessToken!)
    } catch (error) {
      handleApiError(error, {
        failureMessage: 'データエクスポートに失敗しました',
      })
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
              actionLog="sidebarNav:/happiness/all"
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
              actionLog="sidebarNav:/admin/import"
              onClick={() => router.push('/admin/import')}
            >
              <ListItemText primary="データのインポート" />
            </ActionLogListItemButton>
          </ListItem>
          <ListItem key="license" disablePadding>
            <ActionLogListItemButton
              actionLog="sidebarNav:/terms/third-party-license"
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
