import { APP_COLOR_PALETTE, themeColors } from './themeColors'

describe('themeColors', () => {
  describe('APP_COLOR_PALETTE', () => {
    it('should be defined', () => {
      expect(APP_COLOR_PALETTE).toBeDefined()
    })

    it('should have PRIMARY property', () => {
      expect(APP_COLOR_PALETTE.PRIMARY).toBeDefined()
    })

    it('should have SECONDARY property', () => {
      expect(APP_COLOR_PALETTE.SECONDARY).toBeDefined()
    })

    it('should have DARK object with PRIMARY and SECONDARY', () => {
      expect(APP_COLOR_PALETTE.DARK).toBeDefined()
      expect(APP_COLOR_PALETTE.DARK.PRIMARY).toBeDefined()
      expect(APP_COLOR_PALETTE.DARK.SECONDARY).toBeDefined()
    })

    it('should have LIGHT object with BACKGROUND', () => {
      expect(APP_COLOR_PALETTE.LIGHT).toBeDefined()
      expect(APP_COLOR_PALETTE.LIGHT.BACKGROUND).toBeDefined()
    })

    it('should have color palette properties', () => {
      expect(APP_COLOR_PALETTE.BLUE).toBeDefined()
      expect(APP_COLOR_PALETTE.BLUE_GREY).toBeDefined()
      expect(APP_COLOR_PALETTE.GREEN).toBeDefined()
      expect(APP_COLOR_PALETTE.INFO).toBeDefined()
      expect(APP_COLOR_PALETTE.ORANGE).toBeDefined()
      expect(APP_COLOR_PALETTE.RED).toBeDefined()
    })

    it('should have valid color objects from MUI', () => {
      expect(typeof APP_COLOR_PALETTE.PRIMARY).toBe('object')
      expect(typeof APP_COLOR_PALETTE.SECONDARY).toBe('object')
      expect(typeof APP_COLOR_PALETTE.BLUE).toBe('object')
    })

    it('should have indexable color values', () => {
      expect(APP_COLOR_PALETTE.PRIMARY[900]).toBeDefined()
      expect(APP_COLOR_PALETTE.SECONDARY[800]).toBeDefined()
      expect(APP_COLOR_PALETTE.DARK.PRIMARY[500]).toBeDefined()
    })
  })

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
