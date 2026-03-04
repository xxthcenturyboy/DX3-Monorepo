import { getTheme, getThemeForMode } from './mui-theme.service'

describe('mui-theme.service', () => {
  describe('getThemeForMode', () => {
    it('should return a theme options object for "light" mode', () => {
      const theme = getThemeForMode('light')
      expect(theme).toBeDefined()
      expect(typeof theme).toBe('object')
    })

    it('should return a theme options object for "dark" mode', () => {
      const theme = getThemeForMode('dark')
      expect(theme).toBeDefined()
      expect(typeof theme).toBe('object')
    })

    it('should return different palette for light and dark modes', () => {
      const lightTheme = getThemeForMode('light')
      const darkTheme = getThemeForMode('dark')
      expect(lightTheme.palette?.mode).toBe('light')
      expect(darkTheme.palette?.mode).toBe('dark')
    })

    it('should include typography in theme options', () => {
      const theme = getThemeForMode('light')
      expect(theme.typography).toBeDefined()
    })

    it('should include components overrides', () => {
      const theme = getThemeForMode('light')
      expect(theme.components).toBeDefined()
    })
  })

  describe('getTheme', () => {
    it('should return a theme options object', () => {
      const theme = getTheme()
      expect(theme).toBeDefined()
      expect(typeof theme).toBe('object')
    })

    it('should default to "light" when localStorage is not set', () => {
      localStorage.removeItem('dx:THEME_MODE')
      const theme = getTheme()
      expect(theme.palette?.mode).toBe('light')
    })

    it('should return dark theme when localStorage is set to dark', () => {
      localStorage.setItem('dx:THEME_MODE', 'dark')
      const theme = getTheme()
      expect(theme.palette?.mode).toBe('dark')
      localStorage.removeItem('dx:THEME_MODE')
    })
  })
})
