import { listItemButtonOverridesDark, listItemOverridesDark } from './list-dark'

describe('list-dark theme overrides', () => {
  describe('listItemOverridesDark', () => {
    it('should be defined', () => {
      expect(listItemOverridesDark).toBeDefined()
    })
  })

  describe('listItemButtonOverridesDark', () => {
    it('should be defined', () => {
      expect(listItemButtonOverridesDark).toBeDefined()
    })

    it('should have styleOverrides', () => {
      expect(listItemButtonOverridesDark).toHaveProperty('styleOverrides')
    })
  })
})
