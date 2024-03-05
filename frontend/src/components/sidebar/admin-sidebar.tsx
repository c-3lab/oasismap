import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import { signOut } from 'next-auth/react'

interface AdminSidebarProps {
  isOpen?: boolean
  handleDrawerClose: () => void
}

const AdminSidebar: React.FC<AdminSidebarProps> = (props) => {
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
            <ListItemButton
              onClick={() => {
                // TOOD: リクエスト送信処理
              }}
            >
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
