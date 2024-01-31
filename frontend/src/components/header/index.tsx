import { styled } from '@mui/material/styles'
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar'

interface HeaderProps extends MuiAppBarProps {
  width: number
  open?: boolean
}

const Header = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<HeaderProps>(({ theme, width, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${width}px)`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: width,
  }),
}))

export default Header
