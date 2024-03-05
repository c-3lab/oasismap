import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import AppBar from '@mui/material/AppBar'
import { PROFILE_TYPE } from '@/libs/constants'
import { useSession } from 'next-auth/react'

interface HeaderProps {
  simple?: boolean
  handleDrawerOpen?: () => void
}

const Nickname = () => {
  const { data: session } = useSession()
  const titles = {
    [PROFILE_TYPE.GENERAL]: ' さん',
    [PROFILE_TYPE.ADMIN]: '',
  }
  const title = titles[session?.user?.type!]
  return session ? `${session.user!.nickname}${title}` : ''
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
              <Nickname />
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
