import { toolbarItemOverridesCommon } from './menus-common'

describe('menus styles', () => {
  describe('toolbarItemOverridesCommon', () => {
    it('should be defined', () => {
      expect(toolbarItemOverridesCommon).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof toolbarItemOverridesCommon).toBe('object')
    })
  })
})
