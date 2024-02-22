import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import AppBar from '@mui/material/AppBar'
import { SessionProvider, useSession } from 'next-auth/react' // 追加

interface HeaderProps {
  simple?: boolean
  handleDrawerOpen?: () => void
}

function Session() {
  const { data: session } = useSession()
  if (session) {
    return <>{session.user!.nickname} さん</>
  }
  return (
    // TODO 認証保護
    <>ログインしていません</>
  )
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
              <SessionProvider>
                <Session />
              </SessionProvider>
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
