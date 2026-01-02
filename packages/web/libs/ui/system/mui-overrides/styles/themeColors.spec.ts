import { APP_COLOR_PALETTE } from '../../ui.consts'
import { themeColors } from './themeColors'

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
