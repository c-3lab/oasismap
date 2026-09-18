import { useRouter } from 'next/navigation'
import { ActionLogListItemButton } from '@/components/mui'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import { signOut } from 'next-auth/react'

interface GeneralSidebarProps {
  isOpen?: boolean
  handleDrawerClose: () => void
}

const GeneralSidebar: React.FC<GeneralSidebarProps> = (props) => {
  const router = useRouter()

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
          <ListItem key="happiness" disablePadding>
            <ActionLogListItemButton
              actionLog="sidebarNav"
              onClick={() => router.push('/happiness/me')}
            >
              <ListItemText primary="利用者の幸福度" />
            </ActionLogListItemButton>
          </ListItem>
          <ListItem key="happiness-all" disablePadding>
            <ActionLogListItemButton
              actionLog="sidebarNav"
              onClick={() => router.push('/happiness/all')}
            >
              <ListItemText primary="全体の幸福度" />
            </ActionLogListItemButton>
          </ListItem>
          <ListItem key="happiness-list" disablePadding>
            <ActionLogListItemButton
              actionLog="sidebarNav"
              onClick={() => router.push('/happiness/list')}
            >
              <ListItemText primary="一覧表示" />
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

export default GeneralSidebar
