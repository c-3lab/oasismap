import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import AppBar from '@mui/material/AppBar'

interface HeaderProps {
  simple?: boolean
  handleDrawerOpen?: () => void
}

const Header: React.FC<HeaderProps> = ({
  simple = false,
  handleDrawerOpen,
}) => {
  return (
    <AppBar sx={{ color: '#FFF', backgroundColor: '#459586' }}>
      <Toolbar>
        <Typography variant="h6" noWrap sx={{ flexGrow: 1 }} component="div">
          OASISmap
        </Typography>
        {!simple && (
          <>
            <Typography noWrap component="div">
              山田太郎 さん
            </Typography>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
              onClick={handleDrawerOpen}
            >
              <MenuIcon />
            </IconButton>
          </>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default Header
