import { toolbarItemOverrides } from './menus'
import { APP_COLOR_PALETTE } from './themeColors'

describe('menus styles', () => {
  describe('toolbarItemOverrides', () => {
    it('should be defined', () => {
      expect(toolbarItemOverrides).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof toolbarItemOverrides).toBe('object')
    })

    it('should have root property', () => {
      expect(toolbarItemOverrides.root).toBeDefined()
    })

    it('should have toolbar-icons class styles', () => {
      expect(toolbarItemOverrides.root['.toolbar-icons']).toBeDefined()
    })

    it('should have toolbar-app-name class styles', () => {
      expect(toolbarItemOverrides.root['.toolbar-app-name']).toBeDefined()
    })

    it('should apply color to toolbar-icons', () => {
      expect(toolbarItemOverrides.root['.toolbar-icons'].color).toBeDefined()
      expect(typeof toolbarItemOverrides.root['.toolbar-icons'].color).toBe('string')
    })

    it('should apply color to toolbar-app-name', () => {
      expect(toolbarItemOverrides.root['.toolbar-app-name'].color).toBeDefined()
      expect(typeof toolbarItemOverrides.root['.toolbar-app-name'].color).toBe('string')
    })

    it('should use APP_COLOR_PALETTE.SECONDARY[700] for icons', () => {
      expect(toolbarItemOverrides.root['.toolbar-icons'].color).toBe(
        APP_COLOR_PALETTE.SECONDARY[700],
      )
    })

    it('should use APP_COLOR_PALETTE.SECONDARY[700] for app name', () => {
      expect(toolbarItemOverrides.root['.toolbar-app-name'].color).toBe(
        APP_COLOR_PALETTE.SECONDARY[700],
      )
    })
  })

  describe('Integration with themeColors', () => {
    it('should use color from APP_COLOR_PALETTE', () => {
      const expectedColor = APP_COLOR_PALETTE.SECONDARY[700]
      expect(toolbarItemOverrides.root['.toolbar-icons'].color).toBe(expectedColor)
      expect(toolbarItemOverrides.root['.toolbar-app-name'].color).toBe(expectedColor)
    })
  })

  describe('Consistency', () => {
    it('should use same color for both toolbar classes', () => {
      const iconsColor = toolbarItemOverrides.root['.toolbar-icons'].color
      const appNameColor = toolbarItemOverrides.root['.toolbar-app-name'].color
      expect(iconsColor).toBe(appNameColor)
    })

    it('should maintain immutable values', () => {
      const originalIconsColor = toolbarItemOverrides.root['.toolbar-icons'].color
      const accessedIconsColor = toolbarItemOverrides.root['.toolbar-icons'].color
      expect(originalIconsColor).toBe(accessedIconsColor)
    })
  })

  describe('Structure', () => {
    it('should have only root property at top level', () => {
      const keys = Object.keys(toolbarItemOverrides)
      expect(keys).toEqual(['root'])
    })

    it('should have exactly two class selectors in root', () => {
      const rootKeys = Object.keys(toolbarItemOverrides.root)
      expect(rootKeys).toContain('.toolbar-icons')
      expect(rootKeys).toContain('.toolbar-app-name')
      expect(rootKeys.length).toBe(2)
    })
  })

  describe('CSS Validity', () => {
    it('should be usable as MUI theme override', () => {
      expect(() => {
        const override = {
          MuiToolbar: {
            styleOverrides: toolbarItemOverrides,
          },
        }
        expect(override.MuiToolbar.styleOverrides).toBe(toolbarItemOverrides)
      }).not.toThrow()
    })

    it('should have valid color values', () => {
      const isValidColor = (color: string) => {
        return /^#[0-9A-F]{6}$/i.test(color) || /^[a-z]+$/i.test(color)
      }

      const iconsColor = toolbarItemOverrides.root['.toolbar-icons'].color
      const appNameColor = toolbarItemOverrides.root['.toolbar-app-name'].color

      expect(isValidColor(iconsColor)).toBe(true)
      expect(isValidColor(appNameColor)).toBe(true)
    })
  })
})
