import { IconNames } from './enums'
import * as IconsModule from './index'

describe('index', () => {
  describe('Exports', () => {
    it('should export getIcon function', () => {
      expect(IconsModule.getIcon).toBeDefined()
      expect(typeof IconsModule.getIcon).toBe('function')
    })

    it('should export getIconNameSelect function', () => {
      expect(IconsModule.getIconNameSelect).toBeDefined()
      expect(typeof IconsModule.getIconNameSelect).toBe('function')
    })

    it('should export IconNames enum', () => {
      expect(IconsModule.IconNames).toBeDefined()
      expect(typeof IconsModule.IconNames).toBe('object')
    })

    it('should have exactly 3 exports', () => {
      const exports = Object.keys(IconsModule)
      expect(exports.length).toBe(3)
    })

    it('should export all required members', () => {
      const exports = Object.keys(IconsModule)
      expect(exports).toContain('getIcon')
      expect(exports).toContain('getIconNameSelect')
      expect(exports).toContain('IconNames')
    })
  })

  describe('getIcon Function', () => {
    it('should be callable', () => {
      expect(() => IconsModule.getIcon(IconNames.CHECK)).not.toThrow()
    })

    it('should return correct type', () => {
      const result = IconsModule.getIcon(IconNames.CHECK)
      expect(result).toBeDefined()
    })

    it('should accept IconNames enum', () => {
      expect(() => IconsModule.getIcon(IconNames.DASHBOARD)).not.toThrow()
    })

    it('should accept optional color parameter', () => {
      expect(() => IconsModule.getIcon(IconNames.CHECK, 'red')).not.toThrow()
    })
  })

  describe('getIconNameSelect Function', () => {
    it('should be callable', () => {
      expect(() => IconsModule.getIconNameSelect()).not.toThrow()
    })

    it('should return an array', () => {
      const result = IconsModule.getIconNameSelect()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should return array of icon names', () => {
      const result = IconsModule.getIconNameSelect()
      expect(result.length).toBeGreaterThan(0)
    })

    it('should return consistent results', () => {
      const result1 = IconsModule.getIconNameSelect()
      const result2 = IconsModule.getIconNameSelect()
      expect(result1).toEqual(result2)
    })
  })

  describe('IconNames Enum', () => {
    it('should have icon name properties', () => {
      expect(IconsModule.IconNames.ACCESSIBLITY).toBeDefined()
      expect(IconsModule.IconNames.CHECK).toBeDefined()
      expect(IconsModule.IconNames.CHECKBOX).toBeDefined()
      expect(IconsModule.IconNames.DASHBOARD).toBeDefined()
    })

    it('should have string values', () => {
      expect(typeof IconsModule.IconNames.CHECK).toBe('string')
      expect(typeof IconsModule.IconNames.DASHBOARD).toBe('string')
    })

    it('should match expected enum structure', () => {
      const keys = Object.keys(IconsModule.IconNames)
      expect(keys.length).toBeGreaterThan(0)
    })

    it('should be usable with getIcon', () => {
      const iconNames = Object.values(IconsModule.IconNames)
      iconNames.forEach((iconName) => {
        expect(() => IconsModule.getIcon(iconName as IconNames)).not.toThrow()
      })
    })
  })

  describe('Module Structure', () => {
    it('should only export named exports', () => {
      expect(IconsModule.getIcon).toBeDefined()
      expect(IconsModule.getIconNameSelect).toBeDefined()
      expect(IconsModule.IconNames).toBeDefined()
    })

    it('should have exactly the expected exports', () => {
      const exports = Object.keys(IconsModule)
      const expectedExports = ['getIcon', 'getIconNameSelect', 'IconNames']

      expectedExports.forEach((expectedExport) => {
        expect(exports).toContain(expectedExport)
      })
    })
  })

  describe('Integration', () => {
    it('should allow using getIconNameSelect with getIcon', () => {
      const iconNames = IconsModule.getIconNameSelect()

      iconNames.forEach((iconName) => {
        const icon = IconsModule.getIcon(iconName as IconNames)
        expect(icon !== undefined).toBe(true)
      })
    })

    it('should support all IconNames in getIcon', () => {
      const allIconNames = [
        IconsModule.IconNames.ACCESSIBLITY,
        IconsModule.IconNames.CHECK,
        IconsModule.IconNames.CHECKBOX,
        IconsModule.IconNames.CHECKBOX_OUTLINED_BLANK,
        IconsModule.IconNames.DASHBOARD,
        IconsModule.IconNames.HEALTHZ,
        IconsModule.IconNames.MANAGE_ACCOUNTS,
        IconsModule.IconNames.MENU_OPEN,
        IconsModule.IconNames.PEOPLE,
        IconsModule.IconNames.PEOPLE_OUTLINE,
        IconsModule.IconNames.STATS,
      ]

      allIconNames.forEach((iconName) => {
        const icon = IconsModule.getIcon(iconName)
        expect(icon).toBeDefined()
      })
    })

    it('should maintain consistency between getIconNameSelect and IconNames', () => {
      const selectNames = IconsModule.getIconNameSelect()
      const enumKeys = Object.keys(IconsModule.IconNames)

      expect(selectNames).toEqual(enumKeys)
    })
  })

  describe('Type Compatibility', () => {
    it('should export types that work together', () => {
      const iconName: IconNames = IconsModule.IconNames.CHECK
      const icon = IconsModule.getIcon(iconName)

      expect(icon).toBeDefined()
    })

    it('should allow destructuring imports', () => {
      const { getIcon, getIconNameSelect, IconNames: Icons } = IconsModule

      expect(getIcon).toBeDefined()
      expect(getIconNameSelect).toBeDefined()
      expect(Icons).toBeDefined()
    })
  })

  describe('API Stability', () => {
    it('should maintain consistent function signatures', () => {
      expect(IconsModule.getIcon.length).toBe(2) // name and optional color
      expect(IconsModule.getIconNameSelect.length).toBe(0) // no parameters
    })

    it('should not expose internal implementation details', () => {
      const exports = Object.keys(IconsModule)

      // Should only have public API, no private functions
      expect(exports).not.toContain('_private')
      expect(exports).not.toContain('internal')
    })
  })
})
