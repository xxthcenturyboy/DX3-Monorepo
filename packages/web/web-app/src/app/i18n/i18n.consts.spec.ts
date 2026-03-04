import {
  DEFAULT_LOCALE,
  DEFAULT_STRINGS,
  I18N_ENTITY_NAME,
  INTERPOLATION_REGEX,
  LOCALES_BASE_PATH,
} from './i18n.consts'

describe('i18n.consts', () => {
  describe('DEFAULT_LOCALE', () => {
    it('should be "en"', () => {
      expect(DEFAULT_LOCALE).toBe('en')
    })
  })

  describe('I18N_ENTITY_NAME', () => {
    it('should be defined', () => {
      expect(I18N_ENTITY_NAME).toBeDefined()
    })

    it('should be a string', () => {
      expect(typeof I18N_ENTITY_NAME).toBe('string')
    })
  })

  describe('LOCALES_BASE_PATH', () => {
    it('should be a string path', () => {
      expect(typeof LOCALES_BASE_PATH).toBe('string')
    })

    it('should contain "locales"', () => {
      expect(LOCALES_BASE_PATH).toContain('locales')
    })
  })

  describe('INTERPOLATION_REGEX', () => {
    it('should be a RegExp', () => {
      expect(INTERPOLATION_REGEX).toBeInstanceOf(RegExp)
    })

    it('should match {variableName} syntax', () => {
      const match = 'Hello {name}'.match(INTERPOLATION_REGEX)
      expect(match).not.toBeNull()
    })

    it('should not match plain text without braces', () => {
      const match = 'Hello world'.match(INTERPOLATION_REGEX)
      expect(match).toBeNull()
    })
  })

  describe('DEFAULT_STRINGS', () => {
    it('should be a non-null object', () => {
      expect(DEFAULT_STRINGS).toBeDefined()
      expect(typeof DEFAULT_STRINGS).toBe('object')
    })

    it('should have a large number of string keys', () => {
      const values = Object.values(DEFAULT_STRINGS)
      expect(values.length).toBeGreaterThan(50)
    })

    it('should have all values as strings', () => {
      const values = Object.values(DEFAULT_STRINGS)
      for (const value of values) {
        expect(typeof value).toBe('string')
      }
    })

    it('should include common UI keys', () => {
      expect(DEFAULT_STRINGS.ABOUT).toBeDefined()
      expect(DEFAULT_STRINGS.DASHBOARD).toBeDefined()
      expect(DEFAULT_STRINGS.ADMIN).toBeDefined()
    })

    it('should include COULD_NOT_LOG_YOU_IN key', () => {
      expect(DEFAULT_STRINGS.COULD_NOT_LOG_YOU_IN).toBeDefined()
    })
  })
})
