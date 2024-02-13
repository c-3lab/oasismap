import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import AppBar from '@mui/material/AppBar'

interface HeaderProps {
  handleDrawerOpen: () => void
}

const Header: React.FC<HeaderProps> = (props) => {
  return (
    <AppBar color="header">
      <Toolbar>
        <Typography variant="h6" noWrap sx={{ flexGrow: 1 }} component="div">
          OASISmap
        </Typography>
        <Typography noWrap component="div">
          山田太郎 さん
        </Typography>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="end"
          onClick={props.handleDrawerOpen}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}

export default Header
