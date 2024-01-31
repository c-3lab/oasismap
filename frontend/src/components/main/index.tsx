import { styled } from '@mui/material/styles'

interface MainProps {
  drawerWidth: number
}

const Main = styled('main')<MainProps>((props) => ({
  marginRight: -props.drawerWidth,
  width: '100%',
}))

export default Main
