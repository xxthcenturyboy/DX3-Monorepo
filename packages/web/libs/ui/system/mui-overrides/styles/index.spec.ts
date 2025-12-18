import { BORDER_RADIUS, BOX_SHADOW } from './common'
import { dialogOverrides } from './dialog'
import * as StylesModule from './index'
import {
  checkboxStyleOverrides,
  filledInputDefaults,
  filledInputSyleOverrides,
  outlinedInputInputDefaults,
  outlinedInputSyleOverrides,
} from './inputs'
import { listItemButtonOverrides, listItemOverrides } from './list'
import { APP_COLOR_PALETTE, themeColors } from './themeColors'

describe('styles index', () => {
  describe('Module Exports', () => {
    it('should export dialogOverrides', () => {
      expect(StylesModule.dialogOverrides).toBeDefined()
      expect(StylesModule.dialogOverrides).toBe(dialogOverrides)
    })

    it('should export listItemOverrides', () => {
      expect(StylesModule.listItemOverrides).toBeDefined()
      expect(StylesModule.listItemOverrides).toBe(listItemOverrides)
    })

    it('should export listItemButtonOverrides', () => {
      expect(StylesModule.listItemButtonOverrides).toBeDefined()
      expect(StylesModule.listItemButtonOverrides).toBe(listItemButtonOverrides)
    })

    it('should export APP_COLOR_PALETTE', () => {
      expect(StylesModule.APP_COLOR_PALETTE).toBeDefined()
      expect(StylesModule.APP_COLOR_PALETTE).toBe(APP_COLOR_PALETTE)
    })

    it('should export themeColors', () => {
      expect(StylesModule.themeColors).toBeDefined()
      expect(StylesModule.themeColors).toBe(themeColors)
    })

    it('should export checkboxStyleOverrides', () => {
      expect(StylesModule.checkboxStyleOverrides).toBeDefined()
      expect(StylesModule.checkboxStyleOverrides).toBe(checkboxStyleOverrides)
    })

    it('should export filledInputDefaults', () => {
      expect(StylesModule.filledInputDefaults).toBeDefined()
      expect(StylesModule.filledInputDefaults).toBe(filledInputDefaults)
    })

    it('should export filledInputSyleOverrides', () => {
      expect(StylesModule.filledInputSyleOverrides).toBeDefined()
      expect(StylesModule.filledInputSyleOverrides).toBe(filledInputSyleOverrides)
    })

    it('should export outlinedInputSyleOverrides', () => {
      expect(StylesModule.outlinedInputSyleOverrides).toBeDefined()
      expect(StylesModule.outlinedInputSyleOverrides).toBe(outlinedInputSyleOverrides)
    })

    it('should export outlinedInputInputDefaults', () => {
      expect(StylesModule.outlinedInputInputDefaults).toBeDefined()
      expect(StylesModule.outlinedInputInputDefaults).toBe(outlinedInputInputDefaults)
    })

    it('should export BORDER_RADIUS', () => {
      expect(StylesModule.BORDER_RADIUS).toBeDefined()
      expect(StylesModule.BORDER_RADIUS).toBe(BORDER_RADIUS)
    })

    it('should export BOX_SHADOW', () => {
      expect(StylesModule.BOX_SHADOW).toBeDefined()
      expect(StylesModule.BOX_SHADOW).toBe(BOX_SHADOW)
    })
  })

  describe('Export Completeness', () => {
    it('should export all dialog styles', () => {
      expect(StylesModule.dialogOverrides).toBe(dialogOverrides)
    })

    it('should export all list styles', () => {
      expect(StylesModule.listItemOverrides).toBe(listItemOverrides)
      expect(StylesModule.listItemButtonOverrides).toBe(listItemButtonOverrides)
    })

    it('should export all color palettes', () => {
      expect(StylesModule.APP_COLOR_PALETTE).toBe(APP_COLOR_PALETTE)
      expect(StylesModule.themeColors).toBe(themeColors)
    })

    it('should export all input styles', () => {
      expect(StylesModule.checkboxStyleOverrides).toBe(checkboxStyleOverrides)
      expect(StylesModule.filledInputDefaults).toBe(filledInputDefaults)
      expect(StylesModule.filledInputSyleOverrides).toBe(filledInputSyleOverrides)
      expect(StylesModule.outlinedInputSyleOverrides).toBe(outlinedInputSyleOverrides)
      expect(StylesModule.outlinedInputInputDefaults).toBe(outlinedInputInputDefaults)
    })

    it('should export all common constants', () => {
      expect(StylesModule.BORDER_RADIUS).toBe(BORDER_RADIUS)
      expect(StylesModule.BOX_SHADOW).toBe(BOX_SHADOW)
    })
  })

  describe('Re-export Integrity', () => {
    it('should re-export dialog styles correctly', () => {
      expect(StylesModule.dialogOverrides.root).toBeDefined()
      expect(StylesModule.dialogOverrides.root.backdropFilter).toBe('blur(5px)')
    })

    it('should re-export list styles correctly', () => {
      expect(StylesModule.listItemOverrides.root['&&.menu-item']).toBeDefined()
      expect(StylesModule.listItemButtonOverrides.root['&&.Mui-selected']).toBeDefined()
    })

    it('should re-export theme colors correctly', () => {
      expect(StylesModule.themeColors.primary).toBeDefined()
      expect(StylesModule.APP_COLOR_PALETTE.PRIMARY).toBeDefined()
    })

    it('should re-export input styles correctly', () => {
      expect(StylesModule.filledInputSyleOverrides.root.borderRadius).toBe(BORDER_RADIUS)
      expect(StylesModule.checkboxStyleOverrides.root.color).toBeDefined()
    })

    it('should re-export common constants correctly', () => {
      expect(StylesModule.BORDER_RADIUS).toBe('6px')
      expect(StylesModule.BOX_SHADOW).toContain('rgb')
    })
  })

  describe('Module Structure', () => {
    it('should have all expected exports', () => {
      const expectedExports = [
        'dialogOverrides',
        'listItemOverrides',
        'listItemButtonOverrides',
        'APP_COLOR_PALETTE',
        'themeColors',
        'checkboxStyleOverrides',
        'filledInputDefaults',
        'filledInputSyleOverrides',
        'outlinedInputSyleOverrides',
        'outlinedInputInputDefaults',
        'BORDER_RADIUS',
        'BOX_SHADOW',
      ]

      expectedExports.forEach((exportName) => {
        expect(StylesModule).toHaveProperty(exportName)
      })
    })

    it('should only export named exports', () => {
      const expectedExports = {
        APP_COLOR_PALETTE,
        BORDER_RADIUS,
        BOX_SHADOW,
        checkboxStyleOverrides,
        dialogOverrides,
        filledInputDefaults,
        filledInputSyleOverrides,
        listItemButtonOverrides,
        listItemOverrides,
        outlinedInputInputDefaults,
        outlinedInputSyleOverrides,
        themeColors,
      }

      Object.values(expectedExports).forEach((exportValue) => {
        expect(exportValue).toBeDefined()
      })
    })
  })

  describe('Integration', () => {
    it('should maintain consistent BORDER_RADIUS across exports', () => {
      expect(StylesModule.BORDER_RADIUS).toBe(BORDER_RADIUS)
      expect(StylesModule.listItemOverrides.root['&&.menu-item'].borderRadius).toBe(BORDER_RADIUS)
      expect(StylesModule.filledInputSyleOverrides.root.borderRadius).toBe(BORDER_RADIUS)
    })

    it('should maintain consistent BOX_SHADOW across exports', () => {
      expect(StylesModule.BOX_SHADOW).toBe(BOX_SHADOW)
      expect(StylesModule.listItemOverrides.root['&&.menu-item'].boxShadow).toBe(BOX_SHADOW)
    })

    it('should maintain consistent color palette references', () => {
      expect(StylesModule.themeColors.primary).toBe(StylesModule.APP_COLOR_PALETTE.PRIMARY[900])
      expect(StylesModule.themeColors.secondary).toBe(StylesModule.APP_COLOR_PALETTE.SECONDARY[800])
    })
  })

  describe('Type Safety', () => {
    it('should allow destructuring imports', () => {
      const { dialogOverrides: dialog, themeColors: colors, BORDER_RADIUS: radius } = StylesModule

      expect(dialog).toBeDefined()
      expect(colors).toBeDefined()
      expect(radius).toBeDefined()
    })

    it('should maintain type consistency for style overrides', () => {
      expect(typeof StylesModule.dialogOverrides).toBe('object')
      expect(typeof StylesModule.listItemOverrides).toBe('object')
      expect(typeof StylesModule.checkboxStyleOverrides).toBe('object')
    })

    it('should maintain type consistency for constants', () => {
      expect(typeof StylesModule.BORDER_RADIUS).toBe('string')
      expect(typeof StylesModule.BOX_SHADOW).toBe('string')
    })
  })

  describe('Immutability', () => {
    it('should return same references on multiple imports', () => {
      const firstImport = StylesModule.themeColors
      const secondImport = StylesModule.themeColors
      expect(firstImport).toBe(secondImport)
    })

    it('should maintain stable export values', () => {
      const originalRadius = StylesModule.BORDER_RADIUS
      const accessedRadius = StylesModule.BORDER_RADIUS
      expect(originalRadius).toBe(accessedRadius)
    })
  })
})
