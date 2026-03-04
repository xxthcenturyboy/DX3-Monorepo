import { listItemButtonOverridesLight, listItemOverridesLight } from './list-light'

describe('list-light theme overrides', () => {
  describe('listItemOverridesLight', () => {
    it('should be defined', () => {
      expect(listItemOverridesLight).toBeDefined()
    })
  })

  describe('listItemButtonOverridesLight', () => {
    it('should be defined', () => {
      expect(listItemButtonOverridesLight).toBeDefined()
    })

    it('should have styleOverrides', () => {
      expect(listItemButtonOverridesLight).toHaveProperty('styleOverrides')
    })
  })
})
