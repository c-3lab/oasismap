import { createTheme } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface PaletteOptions {
    header: PaletteOptions['primary']
  }
}

declare module '@mui/material/AppBar' {
  interface AppBarPropsColorOverrides {
    header: true
  }
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#26685C',
    },
    secondary: {
      main: '#51A696',
    },
    header: {
      main: '#459586',
      contrastText: '#FFF',
    },
  },
})

export default theme
