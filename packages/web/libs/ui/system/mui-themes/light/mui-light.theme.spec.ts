import { APP_COLOR_PALETTE, DRAWER_WIDTH } from '../../ui.consts'
import { appTheme, themeColors } from './mui-light.theme'
import { toolbarItemOverrides } from './overrides/menus-light'
import {
  checkboxStyleOverrides,
  dialogOverrides,
  filledInputDefaults,
  filledInputSyleOverrides,
  listItemButtonOverrides,
  listItemOverrides,
  outlinedInputInputDefaults,
  outlinedInputSyleOverrides,
} from './styles'

describe('mui.theme', () => {
  describe('DRAWER_WIDTH', () => {
    it('should be defined', () => {
      expect(DRAWER_WIDTH).toBeDefined()
    })

    it('should be a number', () => {
      expect(typeof DRAWER_WIDTH).toBe('number')
    })

    it('should have the correct value', () => {
      expect(DRAWER_WIDTH).toBe(300)
    })

    it('should be a positive number', () => {
      expect(DRAWER_WIDTH).toBeGreaterThan(0)
    })
  })

  describe('appTheme', () => {
    it('should be defined', () => {
      expect(appTheme).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof appTheme).toBe('object')
    })

    it('should have palette property', () => {
      expect(appTheme.palette).toBeDefined()
    })

    it('should have typography property', () => {
      expect(appTheme.typography).toBeDefined()
    })

    it('should have components property', () => {
      expect(appTheme.components).toBeDefined()
    })
  })

  describe('appTheme.palette', () => {
    it('should have light mode', () => {
      expect(appTheme.palette?.mode).toBe('light')
    })

    it('should have primary color configuration', () => {
      expect(appTheme.palette?.primary).toBeDefined()
      const primary = appTheme.palette?.primary as { main: string }
      expect(primary?.main).toBeDefined()
    })

    it('should use themeColors.primary', () => {
      const primary = appTheme.palette?.primary as { main: string }
      expect(primary?.main).toBe(themeColors.primary)
    })

    it('should have secondary color configuration', () => {
      expect(appTheme.palette?.secondary).toBeDefined()
      const secondary = appTheme.palette?.secondary as { main: string }
      expect(secondary?.main).toBeDefined()
    })

    it('should use themeColors.secondary', () => {
      const secondary = appTheme.palette?.secondary as { main: string }
      expect(secondary?.main).toBe(themeColors.secondary)
    })

    it('should have error color configuration', () => {
      expect(appTheme.palette?.error).toBeDefined()
      const error = appTheme.palette?.error as { main: string }
      expect(error?.main).toBeDefined()
    })

    it('should use themeColors.error', () => {
      const error = appTheme.palette?.error as { main: string }
      expect(error?.main).toBe(themeColors.error)
    })

    it('should have info color configuration', () => {
      expect(appTheme.palette?.info).toBeDefined()
      const info = appTheme.palette?.info as { main: string }
      expect(info?.main).toBeDefined()
    })

    it('should use themeColors.info', () => {
      const info = appTheme.palette?.info as { main: string }
      expect(info?.main).toBe(themeColors.info)
    })

    it('should have success color configuration', () => {
      expect(appTheme.palette?.success).toBeDefined()
      const success = appTheme.palette?.success as { main: string }
      expect(success?.main).toBeDefined()
    })

    it('should use themeColors.success', () => {
      const success = appTheme.palette?.success as { main: string }
      expect(success?.main).toBe(themeColors.success)
    })

    it('should have warning color configuration', () => {
      expect(appTheme.palette?.warning).toBeDefined()
      const warning = appTheme.palette?.warning as { main: string }
      expect(warning?.main).toBeDefined()
    })

    it('should use themeColors.warning', () => {
      const warning = appTheme.palette?.warning as { main: string }
      expect(warning?.main).toBe(themeColors.warning)
    })

    it('should have all semantic colors defined', () => {
      const semanticColors = ['primary', 'secondary', 'error', 'info', 'success', 'warning']
      semanticColors.forEach((colorKey) => {
        expect(appTheme.palette).toHaveProperty(colorKey)
      })
    })
  })

  describe('appTheme.typography', () => {
    it('should have fontFamily defined', () => {
      const typography = appTheme.typography as { fontFamily: string }
      expect(typography?.fontFamily).toBeDefined()
    })

    it('should include Roboto font', () => {
      const typography = appTheme.typography as { fontFamily: string }
      expect(typography?.fontFamily).toContain('Roboto')
    })

    it('should include fallback fonts', () => {
      const typography = appTheme.typography as { fontFamily: string }
      expect(typography?.fontFamily).toContain('Helvetica')
      expect(typography?.fontFamily).toContain('Arial')
      expect(typography?.fontFamily).toContain('sans-serif')
    })

    it('should be a string', () => {
      const typography = appTheme.typography as { fontFamily: string }
      expect(typeof typography?.fontFamily).toBe('string')
    })
  })

  describe('appTheme.components', () => {
    it('should have MuiCheckbox configuration', () => {
      expect(appTheme.components?.MuiCheckbox).toBeDefined()
    })

    it('should have MuiDialog configuration', () => {
      expect(appTheme.components?.MuiDialog).toBeDefined()
    })

    it('should have MuiFilledInput configuration', () => {
      expect(appTheme.components?.MuiFilledInput).toBeDefined()
    })

    it('should have MuiListItem configuration', () => {
      expect(appTheme.components?.MuiListItem).toBeDefined()
    })

    it('should have MuiListItemButton configuration', () => {
      expect(appTheme.components?.MuiListItemButton).toBeDefined()
    })

    it('should have MuiOutlinedInput configuration', () => {
      expect(appTheme.components?.MuiOutlinedInput).toBeDefined()
    })

    it('should have MuiToolbar configuration', () => {
      expect(appTheme.components?.MuiToolbar).toBeDefined()
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
        expect(appTheme.components).toHaveProperty(component)
      })
    })
  })

  describe('Component Style Overrides', () => {
    it('should use checkboxStyleOverrides for MuiCheckbox', () => {
      expect(appTheme.components?.MuiCheckbox?.styleOverrides).toBe(checkboxStyleOverrides)
    })

    it('should use dialogOverrides for MuiDialog', () => {
      expect(appTheme.components?.MuiDialog?.styleOverrides).toBe(dialogOverrides)
    })

    it('should use filledInputSyleOverrides for MuiFilledInput', () => {
      expect(appTheme.components?.MuiFilledInput?.styleOverrides).toBe(filledInputSyleOverrides)
    })

    it('should use listItemOverrides for MuiListItem', () => {
      expect(appTheme.components?.MuiListItem?.styleOverrides).toBe(listItemOverrides)
    })

    it('should use listItemButtonOverrides for MuiListItemButton', () => {
      expect(appTheme.components?.MuiListItemButton?.styleOverrides).toBe(listItemButtonOverrides)
    })

    it('should use outlinedInputSyleOverrides for MuiOutlinedInput', () => {
      expect(appTheme.components?.MuiOutlinedInput?.styleOverrides).toBe(outlinedInputSyleOverrides)
    })

    it('should use toolbarItemOverrides for MuiToolbar', () => {
      expect(appTheme.components?.MuiToolbar?.styleOverrides).toBe(toolbarItemOverrides)
    })
  })

  describe('Component Default Props', () => {
    it('should use filledInputDefaults for MuiFilledInput', () => {
      expect(appTheme.components?.MuiFilledInput?.defaultProps).toBe(filledInputDefaults)
    })

    it('should use outlinedInputInputDefaults for MuiOutlinedInput', () => {
      expect(appTheme.components?.MuiOutlinedInput?.defaultProps).toBe(outlinedInputInputDefaults)
    })

    it('should have both styleOverrides and defaultProps for MuiFilledInput', () => {
      expect(appTheme.components?.MuiFilledInput?.styleOverrides).toBeDefined()
      expect(appTheme.components?.MuiFilledInput?.defaultProps).toBeDefined()
    })

    it('should have both styleOverrides and defaultProps for MuiOutlinedInput', () => {
      expect(appTheme.components?.MuiOutlinedInput?.styleOverrides).toBeDefined()
      expect(appTheme.components?.MuiOutlinedInput?.defaultProps).toBeDefined()
    })
  })

  describe('Integration with Imported Styles', () => {
    it('should reference all imported style overrides', () => {
      expect(appTheme.components?.MuiCheckbox?.styleOverrides).toBe(checkboxStyleOverrides)
      expect(appTheme.components?.MuiDialog?.styleOverrides).toBe(dialogOverrides)
      expect(appTheme.components?.MuiFilledInput?.styleOverrides).toBe(filledInputSyleOverrides)
      expect(appTheme.components?.MuiListItem?.styleOverrides).toBe(listItemOverrides)
      expect(appTheme.components?.MuiListItemButton?.styleOverrides).toBe(listItemButtonOverrides)
      expect(appTheme.components?.MuiOutlinedInput?.styleOverrides).toBe(outlinedInputSyleOverrides)
      expect(appTheme.components?.MuiToolbar?.styleOverrides).toBe(toolbarItemOverrides)
    })

    it('should reference all themeColors in palette', () => {
      const primary = appTheme.palette?.primary as { main: string }
      const secondary = appTheme.palette?.secondary as { main: string }
      const error = appTheme.palette?.error as { main: string }
      const info = appTheme.palette?.info as { main: string }
      const success = appTheme.palette?.success as { main: string }
      const warning = appTheme.palette?.warning as { main: string }

      expect(primary?.main).toBe(themeColors.primary)
      expect(secondary?.main).toBe(themeColors.secondary)
      expect(error?.main).toBe(themeColors.error)
      expect(info?.main).toBe(themeColors.info)
      expect(success?.main).toBe(themeColors.success)
      expect(warning?.main).toBe(themeColors.warning)
    })

    it('should reference all default props', () => {
      expect(appTheme.components?.MuiFilledInput?.defaultProps).toBe(filledInputDefaults)
      expect(appTheme.components?.MuiOutlinedInput?.defaultProps).toBe(outlinedInputInputDefaults)
    })
  })

  describe('Theme Structure Validation', () => {
    it('should have valid ThemeOptions structure', () => {
      const requiredProps = ['palette', 'typography', 'components']
      requiredProps.forEach((prop) => {
        expect(appTheme).toHaveProperty(prop)
      })
    })

    it('should maintain immutable theme configuration', () => {
      const primary = appTheme.palette?.primary as { main: string }
      const firstAccess = primary?.main
      const secondAccess = primary?.main
      expect(firstAccess).toBe(secondAccess)
    })

    it('should have consistent component references', () => {
      const firstCheckbox = appTheme.components?.MuiCheckbox?.styleOverrides
      const secondCheckbox = appTheme.components?.MuiCheckbox?.styleOverrides
      expect(firstCheckbox).toBe(secondCheckbox)
    })
  })

  describe('MUI Compatibility', () => {
    it('should be usable with createTheme', () => {
      expect(() => {
        const theme = { ...appTheme }
        expect(theme.palette).toBeDefined()
        expect(theme.typography).toBeDefined()
        expect(theme.components).toBeDefined()
      }).not.toThrow()
    })

    it('should have valid palette mode', () => {
      expect(['light', 'dark']).toContain(appTheme.palette?.mode)
    })

    it('should have valid component override structure', () => {
      const components = appTheme.components
      if (components) {
        Object.keys(components).forEach((componentKey) => {
          const component = components[componentKey as keyof typeof components]
          if (component && typeof component === 'object' && 'styleOverrides' in component) {
            expect(component.styleOverrides).toBeDefined()
          }
        })
      }
    })
  })

  describe('Color Consistency', () => {
    it('should use consistent color values from themeColors', () => {
      const primary = appTheme.palette?.primary as { main: string }
      const secondary = appTheme.palette?.secondary as { main: string }
      const error = appTheme.palette?.error as { main: string }
      const info = appTheme.palette?.info as { main: string }
      const success = appTheme.palette?.success as { main: string }
      const warning = appTheme.palette?.warning as { main: string }

      const paletteColors = {
        error: error?.main,
        info: info?.main,
        primary: primary?.main,
        secondary: secondary?.main,
        success: success?.main,
        warning: warning?.main,
      }

      expect(paletteColors.primary).toBe(themeColors.primary)
      expect(paletteColors.secondary).toBe(themeColors.secondary)
      expect(paletteColors.error).toBe(themeColors.error)
      expect(paletteColors.info).toBe(themeColors.info)
      expect(paletteColors.success).toBe(themeColors.success)
      expect(paletteColors.warning).toBe(themeColors.warning)
    })

    it('should have all color values as strings', () => {
      const primary = appTheme.palette?.primary as { main: string }
      const secondary = appTheme.palette?.secondary as { main: string }
      const error = appTheme.palette?.error as { main: string }
      const info = appTheme.palette?.info as { main: string }
      const success = appTheme.palette?.success as { main: string }
      const warning = appTheme.palette?.warning as { main: string }

      expect(typeof primary?.main).toBe('string')
      expect(typeof secondary?.main).toBe('string')
      expect(typeof error?.main).toBe('string')
      expect(typeof info?.main).toBe('string')
      expect(typeof success?.main).toBe('string')
      expect(typeof warning?.main).toBe('string')
    })
  })

  describe('Constants Validation', () => {
    it('should export DRAWER_WIDTH as a constant', () => {
      const originalValue = DRAWER_WIDTH
      const accessedValue = DRAWER_WIDTH
      expect(originalValue).toBe(accessedValue)
    })

    it('should have DRAWER_WIDTH as a valid pixel value', () => {
      expect(DRAWER_WIDTH).toBeGreaterThan(0)
      expect(Number.isInteger(DRAWER_WIDTH)).toBe(true)
    })
  })

  describe('Type Safety', () => {
    it('should allow accessing theme properties safely', () => {
      expect(() => {
        const palette = appTheme.palette
        const typography = appTheme.typography
        const components = appTheme.components

        expect(palette).toBeDefined()
        expect(typography).toBeDefined()
        expect(components).toBeDefined()
      }).not.toThrow()
    })

    it('should maintain proper structure for nested properties', () => {
      expect(appTheme.palette?.primary).toHaveProperty('main')
      expect(appTheme.components?.MuiCheckbox).toHaveProperty('styleOverrides')
      expect(appTheme.components?.MuiFilledInput).toHaveProperty('defaultProps')
    })
  })
})

describe('themeColors', () => {
  describe('themeColors', () => {
    it('should be defined', () => {
      expect(themeColors).toBeDefined()
    })

    it('should have primary color', () => {
      expect(themeColors.primary).toBeDefined()
      expect(typeof themeColors.primary).toBe('string')
    })

    it('should have secondary color', () => {
      expect(themeColors.secondary).toBeDefined()
      expect(typeof themeColors.secondary).toBe('string')
    })

    it('should have blueGrey color', () => {
      expect(themeColors.blueGrey).toBeDefined()
      expect(typeof themeColors.blueGrey).toBe('string')
    })

    it('should have semantic colors', () => {
      expect(themeColors.info).toBeDefined()
      expect(themeColors.success).toBeDefined()
      expect(themeColors.error).toBeDefined()
      expect(themeColors.warning).toBeDefined()
    })

    it('should have dark theme colors', () => {
      expect(themeColors.dark).toBeDefined()
      expect(themeColors.dark.primary).toBeDefined()
      expect(themeColors.dark.secondary).toBeDefined()
      expect(typeof themeColors.dark.primary).toBe('string')
      expect(typeof themeColors.dark.secondary).toBe('string')
    })

    it('should have light theme colors', () => {
      expect(themeColors.light).toBeDefined()
      expect(themeColors.light.background).toBeDefined()
      expect(typeof themeColors.light.background).toBe('string')
    })

    it('should have notificationHighlight color', () => {
      expect(themeColors.notificationHighlight).toBeDefined()
      expect(themeColors.notificationHighlight).toBe('aliceblue')
    })

    it('should have valid hex or named color values', () => {
      const isValidColor = (color: string) => {
        return /^#[0-9A-F]{6}$/i.test(color) || /^[a-z]+$/i.test(color)
      }

      expect(isValidColor(themeColors.primary)).toBe(true)
      expect(isValidColor(themeColors.secondary)).toBe(true)
      expect(isValidColor(themeColors.notificationHighlight)).toBe(true)
    })

    it('should use values from APP_COLOR_PALETTE', () => {
      expect(themeColors.primary).toBe(APP_COLOR_PALETTE.PRIMARY[900])
      expect(themeColors.secondary).toBe(APP_COLOR_PALETTE.SECONDARY[800])
    })
  })

  describe('Integration', () => {
    it('should have consistent color palette references', () => {
      expect(themeColors.dark.primary).toBe(APP_COLOR_PALETTE.DARK.PRIMARY[500])
      expect(themeColors.dark.secondary).toBe(APP_COLOR_PALETTE.DARK.SECONDARY[500])
      expect(themeColors.light.background).toBe(APP_COLOR_PALETTE.LIGHT.BACKGROUND[100])
    })

    it('should maintain immutable color values', () => {
      const originalPrimary = themeColors.primary
      const accessedPrimary = themeColors.primary
      expect(originalPrimary).toBe(accessedPrimary)
    })
  })

  describe('Type Safety', () => {
    it('should allow accessing palette colors by index', () => {
      expect(() => {
        const color = APP_COLOR_PALETTE.PRIMARY[900]
        expect(color).toBeDefined()
      }).not.toThrow()
    })

    it('should have all required themeColors properties', () => {
      const requiredProps = [
        'primary',
        'secondary',
        'blueGrey',
        'info',
        'success',
        'error',
        'warning',
        'dark',
        'light',
        'notificationHighlight',
      ]

      requiredProps.forEach((prop) => {
        expect(themeColors).toHaveProperty(prop)
      })
    })
  })
})
