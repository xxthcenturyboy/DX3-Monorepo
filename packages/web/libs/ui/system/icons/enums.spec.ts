import { getIconNameSelect, IconNames } from './enums'

describe('enums', () => {
  describe('IconNames Enum', () => {
    it('should have all icon name values defined', () => {
      expect(IconNames.ACCESSIBLITY).toBe('ACCESSIBLITY')
      expect(IconNames.CHECK).toBe('CHECK')
      expect(IconNames.CHECKBOX).toBe('CHECKBOX')
      expect(IconNames.CHECKBOX_OUTLINED_BLANK).toBe('CHECKBOX_OUTLINED_BLANK')
      expect(IconNames.HEALTHZ).toBe('HEALTHZ')
      expect(IconNames.DASHBOARD).toBe('DASHBOARD')
      expect(IconNames.MANAGE_ACCOUNTS).toBe('MANAGE_ACCOUNTS')
      expect(IconNames.MENU_OPEN).toBe('MENU_OPEN')
      expect(IconNames.PEOPLE).toBe('PEOPLE')
      expect(IconNames.PEOPLE_OUTLINE).toBe('PEOPLE_OUTLINE')
      expect(IconNames.STATS).toBe('STATS')
    })

    it('should have exactly 11 icon names', () => {
      const keys = Object.keys(IconNames)
      expect(keys.length).toBe(11)
    })

    it('should have unique values', () => {
      const values = Object.values(IconNames)
      const uniqueValues = new Set(values)
      expect(uniqueValues.size).toBe(values.length)
    })

    it('should have string values', () => {
      Object.values(IconNames).forEach((value) => {
        expect(typeof value).toBe('string')
      })
    })
  })

  describe('getIconNameSelect', () => {
    it('should return an array of all icon names', () => {
      const result = getIconNameSelect()

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(11)
    })

    it('should return all IconNames enum values', () => {
      const result = getIconNameSelect()

      expect(result).toContain(IconNames.ACCESSIBLITY)
      expect(result).toContain(IconNames.CHECK)
      expect(result).toContain(IconNames.CHECKBOX)
      expect(result).toContain(IconNames.CHECKBOX_OUTLINED_BLANK)
      expect(result).toContain(IconNames.HEALTHZ)
      expect(result).toContain(IconNames.DASHBOARD)
      expect(result).toContain(IconNames.MANAGE_ACCOUNTS)
      expect(result).toContain(IconNames.MENU_OPEN)
      expect(result).toContain(IconNames.PEOPLE)
      expect(result).toContain(IconNames.PEOPLE_OUTLINE)
      expect(result).toContain(IconNames.STATS)
    })

    it('should return the same result on multiple calls', () => {
      const result1 = getIconNameSelect()
      const result2 = getIconNameSelect()

      expect(result1).toEqual(result2)
    })

    it('should return array with no duplicates', () => {
      const result = getIconNameSelect()
      const uniqueValues = new Set(result)

      expect(uniqueValues.size).toBe(result.length)
    })

    it('should return array of strings', () => {
      const result = getIconNameSelect()

      result.forEach((iconName) => {
        expect(typeof iconName).toBe('string')
      })
    })

    it('should match Object.keys of IconNames', () => {
      const result = getIconNameSelect()
      const keys = Object.keys(IconNames)

      expect(result).toEqual(keys)
    })
  })

  describe('Enum Structure', () => {
    it('should be accessible as both key and value', () => {
      expect(IconNames.ACCESSIBLITY).toBe('ACCESSIBLITY')
      expect(IconNames.ACCESSIBLITY).toBe('ACCESSIBLITY')
    })

    it('should have keys matching values', () => {
      Object.entries(IconNames).forEach(([key, value]) => {
        expect(key).toBe(value)
      })
    })
  })

  describe('Type Safety', () => {
    it('should allow assignment to IconNames type', () => {
      const iconName: IconNames = IconNames.CHECK
      expect(iconName).toBe('CHECK')
    })

    it('should work with string literals from enum', () => {
      const testIcon = (icon: IconNames) => icon

      expect(testIcon(IconNames.DASHBOARD)).toBe('DASHBOARD')
    })
  })
})
