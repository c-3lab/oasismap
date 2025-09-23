import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import AppBar from '@mui/material/AppBar'
import { PROFILE_TYPE } from '@/libs/constants'
import { useSession } from 'next-auth/react'

interface HeaderProps {
  simple?: boolean
  handleDrawerOpen?: () => void
  handleFilterOpen?: () => void
}

const Nickname = () => {
  const { data: session } = useSession()
  return session && session?.user?.type! == PROFILE_TYPE.ADMIN
    ? session.user!.nickname
    : ''
}

const Header: React.FC<HeaderProps> = ({
  simple = false,
  handleDrawerOpen,
  handleFilterOpen,
}) => {
  const { data: session } = useSession()

  return (
    <AppBar sx={{ color: '#FFF', backgroundColor: '#459586' }}>
      <Toolbar>
        {!simple && session && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerOpen}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography
          variant="h6"
          noWrap
          sx={{
            flexGrow: 1,
            textAlign: { xs: 'center', sm: 'left' },
          }}
          component="div"
        >
          地域幸福度可視化アプリ
        </Typography>
        {!simple && session && (
          <>
            <Typography noWrap component="div" sx={{ mr: 2 }}>
              <Nickname />
            </Typography>
            <IconButton
              color="inherit"
              aria-label="open filter"
              edge="end"
              onClick={handleFilterOpen}
            >
              <FilterAltIcon />
            </IconButton>
          </>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default Header
