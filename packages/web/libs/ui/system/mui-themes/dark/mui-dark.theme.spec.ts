import { muiThemeDark, muiThemeDarkColors } from './mui-dark.theme'

describe('muiThemeDark', () => {
  describe('muiThemeDark', () => {
    it('should be defined', () => {
      expect(muiThemeDark).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof muiThemeDark).toBe('object')
    })

    it('should have palette property', () => {
      expect(muiThemeDark.palette).toBeDefined()
    })

    it('should have typography property', () => {
      expect(muiThemeDark.typography).toBeDefined()
    })

    it('should have components property', () => {
      expect(muiThemeDark.components).toBeDefined()
    })
  })

  describe('muiThemeDark.palette', () => {
    it('should have light mode', () => {
      expect(muiThemeDark.palette?.mode).toBe('light')
    })

    it('should have primary color configuration', () => {
      expect(muiThemeDark.palette?.primary).toBeDefined()
      const primary = muiThemeDark.palette?.primary as { main: string }
      expect(primary?.main).toBeDefined()
    })

    it('should use muiThemeDarkColors.primary', () => {
      const primary = muiThemeDark.palette?.primary as { main: string }
      expect(primary?.main).toBe(muiThemeDarkColors.primary)
    })

    it('should have secondary color configuration', () => {
      expect(muiThemeDark.palette?.secondary).toBeDefined()
      const secondary = muiThemeDark.palette?.secondary as { main: string }
      expect(secondary?.main).toBeDefined()
    })

    it('should use muiThemeDarkColors.secondary', () => {
      const secondary = muiThemeDark.palette?.secondary as { main: string }
      expect(secondary?.main).toBe(muiThemeDarkColors.secondary)
    })

    it('should have error color configuration', () => {
      expect(muiThemeDark.palette?.error).toBeDefined()
      const error = muiThemeDark.palette?.error as { main: string }
      expect(error?.main).toBeDefined()
    })

    it('should use muiThemeDarkColors.error', () => {
      const error = muiThemeDark.palette?.error as { main: string }
      expect(error?.main).toBe(muiThemeDarkColors.error)
    })

    it('should have info color configuration', () => {
      expect(muiThemeDark.palette?.info).toBeDefined()
      const info = muiThemeDark.palette?.info as { main: string }
      expect(info?.main).toBeDefined()
    })

    it('should use muiThemeDarkColors.info', () => {
      const info = muiThemeDark.palette?.info as { main: string }
      expect(info?.main).toBe(muiThemeDarkColors.info)
    })

    it('should have success color configuration', () => {
      expect(muiThemeDark.palette?.success).toBeDefined()
      const success = muiThemeDark.palette?.success as { main: string }
      expect(success?.main).toBeDefined()
    })

    it('should use muiThemeDarkColors.success', () => {
      const success = muiThemeDark.palette?.success as { main: string }
      expect(success?.main).toBe(muiThemeDarkColors.success)
    })

    it('should have warning color configuration', () => {
      expect(muiThemeDark.palette?.warning).toBeDefined()
      const warning = muiThemeDark.palette?.warning as { main: string }
      expect(warning?.main).toBeDefined()
    })

    it('should use muiThemeDarkColors.warning', () => {
      const warning = muiThemeDark.palette?.warning as { main: string }
      expect(warning?.main).toBe(muiThemeDarkColors.warning)
    })

    it('should have all semantic colors defined', () => {
      const semanticColors = ['primary', 'secondary', 'error', 'info', 'success', 'warning']
      semanticColors.forEach((colorKey) => {
        expect(muiThemeDark.palette).toHaveProperty(colorKey)
      })
    })
  })

  describe('muiThemeDark.typography', () => {
    it('should have fontFamily defined', () => {
      const typography = muiThemeDark.typography as { fontFamily: string }
      expect(typography?.fontFamily).toBeDefined()
    })

    it('should include Roboto font', () => {
      const typography = muiThemeDark.typography as { fontFamily: string }
      expect(typography?.fontFamily).toContain('Roboto')
    })

    it('should include fallback fonts', () => {
      const typography = muiThemeDark.typography as { fontFamily: string }
      expect(typography?.fontFamily).toContain('Helvetica')
      expect(typography?.fontFamily).toContain('Arial')
      expect(typography?.fontFamily).toContain('sans-serif')
    })

    it('should be a string', () => {
      const typography = muiThemeDark.typography as { fontFamily: string }
      expect(typeof typography?.fontFamily).toBe('string')
    })
  })

  describe('muiThemeDark.components', () => {
    it('should have MuiCheckbox configuration', () => {
      expect(muiThemeDark.components?.MuiCheckbox).toBeDefined()
    })

    it('should have MuiDialog configuration', () => {
      expect(muiThemeDark.components?.MuiDialog).toBeDefined()
    })

    it('should have MuiFilledInput configuration', () => {
      expect(muiThemeDark.components?.MuiFilledInput).toBeDefined()
    })

    it('should have MuiListItem configuration', () => {
      expect(muiThemeDark.components?.MuiListItem).toBeDefined()
    })

    it('should have MuiListItemButton configuration', () => {
      expect(muiThemeDark.components?.MuiListItemButton).toBeDefined()
    })

    it('should have MuiOutlinedInput configuration', () => {
      expect(muiThemeDark.components?.MuiOutlinedInput).toBeDefined()
    })

    it('should have MuiToolbar configuration', () => {
      expect(muiThemeDark.components?.MuiToolbar).toBeDefined()
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
        expect(muiThemeDark.components).toHaveProperty(component)
      })
    })
  })
})

describe('muiThemeDarkColors', () => {
  describe('muiThemeDarkColors', () => {
    it('should be defined', () => {
      expect(muiThemeDarkColors).toBeDefined()
    })

    it('should have primary color', () => {
      expect(muiThemeDarkColors.primary).toBeDefined()
      expect(typeof muiThemeDarkColors.primary).toBe('string')
    })

    it('should have secondary color', () => {
      expect(muiThemeDarkColors.secondary).toBeDefined()
      expect(typeof muiThemeDarkColors.secondary).toBe('string')
    })

    it('should have blueGrey color', () => {
      expect(muiThemeDarkColors.blueGrey).toBeDefined()
      expect(typeof muiThemeDarkColors.blueGrey).toBe('string')
    })

    it('should have semantic colors', () => {
      expect(muiThemeDarkColors.info).toBeDefined()
      expect(muiThemeDarkColors.success).toBeDefined()
      expect(muiThemeDarkColors.error).toBeDefined()
      expect(muiThemeDarkColors.warning).toBeDefined()
    })

    it('should have notificationHighlight color', () => {
      expect(muiThemeDarkColors.notificationHighlight).toBeDefined()
      expect(muiThemeDarkColors.notificationHighlight).toBe('aliceblue')
    })

    it('should have valid hex or named color values', () => {
      const isValidColor = (color: string) => {
        return /^#[0-9A-F]{6}$/i.test(color) || /^[a-z]+$/i.test(color)
      }

      expect(isValidColor(muiThemeDarkColors.primary)).toBe(true)
      expect(isValidColor(muiThemeDarkColors.secondary)).toBe(true)
      expect(isValidColor(muiThemeDarkColors.notificationHighlight)).toBe(true)
    })
  })
})
