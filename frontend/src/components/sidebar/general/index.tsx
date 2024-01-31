import { useTheme } from '@mui/material/styles'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'

import SidebarHeader from '@/components/sidebar/header'

interface GeneralSidebarProps {
  drawerWidth: number
  open?: boolean
  handleDrawerClose: () => void
}

const GeneralSidebar: React.FC<GeneralSidebarProps> = (props) => {
  const theme = useTheme()

  return (
    <Drawer
      sx={{
        width: props.drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: props.drawerWidth,
        },
      }}
      variant="persistent"
      anchor="right"
      open={props.open}
    >
      <SidebarHeader>
        <IconButton onClick={props.handleDrawerClose}>
          {theme.direction === 'rtl' ? (
            <ChevronLeftIcon />
          ) : (
            <ChevronRightIcon />
          )}
        </IconButton>
      </SidebarHeader>
      <Divider />
      <List>
        <ListItem key="happiness" disablePadding>
          <ListItemButton>
            <ListItemText primary="利用者の幸福度" />
          </ListItemButton>
        </ListItem>
        <ListItem key="happiness-all" disablePadding>
          <ListItemButton>
            <ListItemText primary="全体の幸福度" />
          </ListItemButton>
        </ListItem>
        <ListItem key="logout" disablePadding>
          <ListItemButton>
            <ListItemText primary="ログアウト" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  )
}

export default GeneralSidebar
