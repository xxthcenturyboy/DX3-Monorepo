import '@mui/material/styles'
import '@mui/material/Button'

declare module '@mui/material/styles' {
  interface Palette {
    brandColor: Palette['primary']
    highlight: Palette['primary']
    tertiary: Palette['primary']
  }
  interface PaletteOptions {
    brandColor?: PaletteOptions['primary']
    highlight?: PaletteOptions['primary']
    tertiary?: PaletteOptions['primary']
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    brandColor: true
    highlight: true
    tertiary: true
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsColorOverrides {
    brandColor: true
    highlight: true
    tertiary: true
  }
}

declare module '@mui/material/AppBar' {
  interface AppBarPropsColorOverrides {
    brandColor: true
    highlight: true
    tertiary: true
  }
}
