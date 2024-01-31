import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import Header from '@/components/header'

interface LoggedinHeaderProps {
  drawerWidth: number
  open?: boolean
  handleDrawerOpen: () => void
}

const LoggedinHeader: React.FC<LoggedinHeaderProps> = (props) => {
  return (
    <Header position="fixed" width={props.drawerWidth} open={props.open}>
      <Toolbar>
        <Typography variant="h6" noWrap sx={{ flexGrow: 1 }} component="div">
          OASISmap
        </Typography>
        {!props.open && (
          <Typography noWrap component="div">
            山田太郎 さん
          </Typography>
        )}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="end"
          onClick={props.handleDrawerOpen}
          sx={{ ...(props.open && { display: 'none' }) }}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>
    </Header>
  )
}

export default LoggedinHeader
