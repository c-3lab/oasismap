import { useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'

interface GeneralSidebarProps {
  isOpen?: boolean
  handleDrawerClose: () => void
}

const GeneralSidebar: React.FC<GeneralSidebarProps> = (props) => {
  const router = useRouter()

  // ページ遷移と同時にサイドバーを閉じる
  const onPageTransitionSidebarClose = (path: string) => {
    router.push(path) // ページ遷移
    props.handleDrawerClose() // サイドバーを閉じる
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
            <ListItemButton
              onClick={() => onPageTransitionSidebarClose('/happiness/me')}
            >
              <ListItemText primary="利用者の幸福度" />
            </ListItemButton>
          </ListItem>
          <ListItem key="happiness-all" disablePadding>
            <ListItemButton
              onClick={() => onPageTransitionSidebarClose('/happiness/all')}
            >
              <ListItemText primary="全体の幸福度" />
            </ListItemButton>
          </ListItem>
          <ListItem key="logout" disablePadding>
            <ListItemButton>
              <ListItemText primary="ログアウト" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  )
}

export default GeneralSidebar
