import { listItemButtonOverridesCommon, listItemOverridesCommon } from './list-common'

describe('list styles', () => {
  describe('listItemOverridesCommon', () => {
    it('should be defined', () => {
      expect(listItemOverridesCommon).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof listItemOverridesCommon).toBe('object')
    })
  })

  describe('listItemButtonOverridesCommon', () => {
    it('should be defined', () => {
      expect(listItemButtonOverridesCommon).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof listItemButtonOverridesCommon).toBe('object')
    })
  })
})
