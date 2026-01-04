import {
  checkboxOverridesCommon,
  filledInputOverridesCommon,
  outlinedInputOverridesCommon,
} from './inputs-common'

describe('inputs styles', () => {
  describe('filledInputOverridesCommon', () => {
    it('should be defined', () => {
      expect(filledInputOverridesCommon).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof filledInputOverridesCommon).toBe('object')
    })
  })

  describe('outlinedInputOverridesCommon', () => {
    it('should be defined', () => {
      expect(outlinedInputOverridesCommon).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof outlinedInputOverridesCommon).toBe('object')
    })
  })
  describe('checkboxOverridesCommon', () => {
    it('should be defined', () => {
      expect(checkboxOverridesCommon).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof checkboxOverridesCommon).toBe('object')
    })
  })
})
