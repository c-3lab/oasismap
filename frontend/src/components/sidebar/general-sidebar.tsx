import { useRouter } from 'next/navigation'
import { clickActions } from '@/libs/action-log-definitions'
import type { ActionDefinition } from '@/libs/action-log-definitions'
import { action } from '@/libs/action-log'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import { signOut } from 'next-auth/react'

interface GeneralSidebarProps {
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
    key: 'happiness',
    text: '利用者の幸福度',
    path: '/happiness/me',
    action: clickActions.sidebarNav('/happiness/me'),
  },
  {
    key: 'happiness-all',
    text: '全体の幸福度',
    path: '/happiness/all',
    action: clickActions.sidebarNav('/happiness/all'),
  },
  {
    key: 'happiness-list',
    text: '一覧表示',
    path: '/happiness/list',
    action: clickActions.sidebarNav('/happiness/list'),
  },
  {
    key: 'license',
    text: 'サードパーティライセンス',
    path: '/terms/third-party-license',
    action: clickActions.sidebarNav('/terms/third-party-license'),
  },
]

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

export default GeneralSidebar
