import { muiThemeLight, muiThemeLightColors } from './mui-light.theme'

describe('muiThemeLight', () => {
  describe('muiThemeLight', () => {
    it('should be defined', () => {
      expect(muiThemeLight).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof muiThemeLight).toBe('object')
    })

    it('should have palette property', () => {
      expect(muiThemeLight.palette).toBeDefined()
    })

    it('should have typography property', () => {
      expect(muiThemeLight.typography).toBeDefined()
    })

    it('should have components property', () => {
      expect(muiThemeLight.components).toBeDefined()
    })
  })

  describe('muiThemeLight.palette', () => {
    it('should have light mode', () => {
      expect(muiThemeLight.palette?.mode).toBe('light')
    })

    it('should have primary color configuration', () => {
      expect(muiThemeLight.palette?.primary).toBeDefined()
      const primary = muiThemeLight.palette?.primary as { main: string }
      expect(primary?.main).toBeDefined()
    })

    it('should use muiThemeLightColors.primary', () => {
      const primary = muiThemeLight.palette?.primary as { main: string }
      expect(primary?.main).toBe(muiThemeLightColors.primary)
    })

    it('should have secondary color configuration', () => {
      expect(muiThemeLight.palette?.secondary).toBeDefined()
      const secondary = muiThemeLight.palette?.secondary as { main: string }
      expect(secondary?.main).toBeDefined()
    })

    it('should use muiThemeLightColors.secondary', () => {
      const secondary = muiThemeLight.palette?.secondary as { main: string }
      expect(secondary?.main).toBe(muiThemeLightColors.secondary)
    })

    it('should have error color configuration', () => {
      expect(muiThemeLight.palette?.error).toBeDefined()
      const error = muiThemeLight.palette?.error as { main: string }
      expect(error?.main).toBeDefined()
    })

    it('should use muiThemeLightColors.error', () => {
      const error = muiThemeLight.palette?.error as { main: string }
      expect(error?.main).toBe(muiThemeLightColors.error)
    })

    it('should have info color configuration', () => {
      expect(muiThemeLight.palette?.info).toBeDefined()
      const info = muiThemeLight.palette?.info as { main: string }
      expect(info?.main).toBeDefined()
    })

    it('should use muiThemeLightColors.info', () => {
      const info = muiThemeLight.palette?.info as { main: string }
      expect(info?.main).toBe(muiThemeLightColors.info)
    })

    it('should have success color configuration', () => {
      expect(muiThemeLight.palette?.success).toBeDefined()
      const success = muiThemeLight.palette?.success as { main: string }
      expect(success?.main).toBeDefined()
    })

    it('should use muiThemeLightColors.success', () => {
      const success = muiThemeLight.palette?.success as { main: string }
      expect(success?.main).toBe(muiThemeLightColors.success)
    })

    it('should have warning color configuration', () => {
      expect(muiThemeLight.palette?.warning).toBeDefined()
      const warning = muiThemeLight.palette?.warning as { main: string }
      expect(warning?.main).toBeDefined()
    })

    it('should use muiThemeLightColors.warning', () => {
      const warning = muiThemeLight.palette?.warning as { main: string }
      expect(warning?.main).toBe(muiThemeLightColors.warning)
    })

    it('should have all semantic colors defined', () => {
      const semanticColors = ['primary', 'secondary', 'error', 'info', 'success', 'warning']
      semanticColors.forEach((colorKey) => {
        expect(muiThemeLight.palette).toHaveProperty(colorKey)
      })
    })
  })

  describe('muiThemeLight.typography', () => {
    it('should have fontFamily defined', () => {
      const typography = muiThemeLight.typography as { fontFamily: string }
      expect(typography?.fontFamily).toBeDefined()
    })

    it('should include Roboto font', () => {
      const typography = muiThemeLight.typography as { fontFamily: string }
      expect(typography?.fontFamily).toContain('Roboto')
    })

    it('should include fallback fonts', () => {
      const typography = muiThemeLight.typography as { fontFamily: string }
      expect(typography?.fontFamily).toContain('Helvetica')
      expect(typography?.fontFamily).toContain('Arial')
      expect(typography?.fontFamily).toContain('sans-serif')
    })

    it('should be a string', () => {
      const typography = muiThemeLight.typography as { fontFamily: string }
      expect(typeof typography?.fontFamily).toBe('string')
    })
  })

  describe('muiThemeLight.components', () => {
    it('should have MuiCheckbox configuration', () => {
      expect(muiThemeLight.components?.MuiCheckbox).toBeDefined()
    })

    it('should have MuiDialog configuration', () => {
      expect(muiThemeLight.components?.MuiDialog).toBeDefined()
    })

    it('should have MuiFilledInput configuration', () => {
      expect(muiThemeLight.components?.MuiFilledInput).toBeDefined()
    })

    it('should have MuiListItem configuration', () => {
      expect(muiThemeLight.components?.MuiListItem).toBeDefined()
    })

    it('should have MuiListItemButton configuration', () => {
      expect(muiThemeLight.components?.MuiListItemButton).toBeDefined()
    })

    it('should have MuiOutlinedInput configuration', () => {
      expect(muiThemeLight.components?.MuiOutlinedInput).toBeDefined()
    })

    it('should have MuiToolbar configuration', () => {
      expect(muiThemeLight.components?.MuiToolbar).toBeDefined()
    })

    it('should configure all expected components', () => {
      const expectedComponents = [
        'MuiCheckbox',
        'MuiDialog',
        'MuiFilledInput',
        'MuiListItem',
        'MuiListItemButton',
        'MuiOutlinedInput',
        'MuiToolbar',
      ]

      expectedComponents.forEach((component) => {
        expect(muiThemeLight.components).toHaveProperty(component)
      })
    })
  })
})

describe('muiThemeLightColors', () => {
  describe('muiThemeLightColors', () => {
    it('should be defined', () => {
      expect(muiThemeLightColors).toBeDefined()
    })

    it('should have primary color', () => {
      expect(muiThemeLightColors.primary).toBeDefined()
      expect(typeof muiThemeLightColors.primary).toBe('string')
    })

    it('should have secondary color', () => {
      expect(muiThemeLightColors.secondary).toBeDefined()
      expect(typeof muiThemeLightColors.secondary).toBe('string')
    })

    it('should have blueGrey color', () => {
      expect(muiThemeLightColors.blueGrey).toBeDefined()
      expect(typeof muiThemeLightColors.blueGrey).toBe('string')
    })

    it('should have semantic colors', () => {
      expect(muiThemeLightColors.info).toBeDefined()
      expect(muiThemeLightColors.success).toBeDefined()
      expect(muiThemeLightColors.error).toBeDefined()
      expect(muiThemeLightColors.warning).toBeDefined()
    })

    it('should have notificationHighlight color', () => {
      expect(muiThemeLightColors.notificationHighlight).toBeDefined()
      expect(muiThemeLightColors.notificationHighlight).toBe('aliceblue')
    })

    it('should have valid hex or named color values', () => {
      const isValidColor = (color: string) => {
        return /^#[0-9A-F]{6}$/i.test(color) || /^[a-z]+$/i.test(color)
      }

      expect(isValidColor(muiThemeLightColors.primary)).toBe(true)
      expect(isValidColor(muiThemeLightColors.secondary)).toBe(true)
      expect(isValidColor(muiThemeLightColors.notificationHighlight)).toBe(true)
    })
  })
})
