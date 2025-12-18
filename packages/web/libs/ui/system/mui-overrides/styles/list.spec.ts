import { BORDER_RADIUS, BOX_SHADOW } from './common'
import { listItemButtonOverrides, listItemOverrides } from './list'

describe('list styles', () => {
  describe('listItemOverrides', () => {
    it('should be defined', () => {
      expect(listItemOverrides).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof listItemOverrides).toBe('object')
    })

    it('should have root property', () => {
      expect(listItemOverrides.root).toBeDefined()
    })

    it('should have menu-item class styles', () => {
      expect(listItemOverrides.root['&&.menu-item']).toBeDefined()
    })

    it('should have privilegeset-item class styles', () => {
      expect(listItemOverrides.root['&&.privilegeset-item']).toBeDefined()
    })

    it('should apply BORDER_RADIUS to menu-item', () => {
      expect(listItemOverrides.root['&&.menu-item'].borderRadius).toBe(BORDER_RADIUS)
    })

    it('should apply BOX_SHADOW to menu-item', () => {
      expect(listItemOverrides.root['&&.menu-item'].boxShadow).toBe(BOX_SHADOW)
    })

    it('should apply margin to menu-item', () => {
      expect(listItemOverrides.root['&&.menu-item'].margin).toBe('10px 0')
    })

    it('should apply BORDER_RADIUS to privilegeset-item', () => {
      expect(listItemOverrides.root['&&.privilegeset-item'].borderRadius).toBe(BORDER_RADIUS)
    })

    it('should apply BOX_SHADOW to privilegeset-item', () => {
      expect(listItemOverrides.root['&&.privilegeset-item'].boxShadow).toBe(BOX_SHADOW)
    })

    it('should apply margin to privilegeset-item', () => {
      expect(listItemOverrides.root['&&.privilegeset-item'].margin).toBe('10px 0')
    })
  })

  describe('listItemButtonOverrides', () => {
    it('should be defined', () => {
      expect(listItemButtonOverrides).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof listItemButtonOverrides).toBe('object')
    })

    it('should have root property', () => {
      expect(listItemButtonOverrides.root).toBeDefined()
    })

    it('should have menu-item class styles', () => {
      expect(listItemButtonOverrides.root['&&.menu-item']).toBeDefined()
    })

    it('should have privilegeset-item class styles', () => {
      expect(listItemButtonOverrides.root['&&.privilegeset-item']).toBeDefined()
    })

    it('should have Mui-selected state styles', () => {
      expect(listItemButtonOverrides.root['&&.Mui-selected']).toBeDefined()
    })

    it('should apply BORDER_RADIUS to menu-item', () => {
      expect(listItemButtonOverrides.root['&&.menu-item'].borderRadius).toBe(BORDER_RADIUS)
    })

    it('should apply BOX_SHADOW to menu-item', () => {
      expect(listItemButtonOverrides.root['&&.menu-item'].boxShadow).toBe(BOX_SHADOW)
    })

    it('should apply margin to menu-item', () => {
      expect(listItemButtonOverrides.root['&&.menu-item'].margin).toBe('10px 0')
    })

    it('should apply BORDER_RADIUS to privilegeset-item', () => {
      expect(listItemButtonOverrides.root['&&.privilegeset-item'].borderRadius).toBe(BORDER_RADIUS)
    })

    it('should apply BOX_SHADOW to privilegeset-item', () => {
      expect(listItemButtonOverrides.root['&&.privilegeset-item'].boxShadow).toBe(BOX_SHADOW)
    })

    it('should apply margin to privilegeset-item', () => {
      expect(listItemButtonOverrides.root['&&.privilegeset-item'].margin).toBe('10px 0')
    })

    it('should have backgroundColor for selected state', () => {
      expect(listItemButtonOverrides.root['&&.Mui-selected'].backgroundColor).toBeDefined()
      expect(typeof listItemButtonOverrides.root['&&.Mui-selected'].backgroundColor).toBe('string')
    })
  })

  describe('Integration with common styles', () => {
    it('should use BORDER_RADIUS from common', () => {
      expect(listItemOverrides.root['&&.menu-item'].borderRadius).toBe(BORDER_RADIUS)
      expect(listItemButtonOverrides.root['&&.menu-item'].borderRadius).toBe(BORDER_RADIUS)
    })

    it('should use BOX_SHADOW from common', () => {
      expect(listItemOverrides.root['&&.menu-item'].boxShadow).toBe(BOX_SHADOW)
      expect(listItemButtonOverrides.root['&&.menu-item'].boxShadow).toBe(BOX_SHADOW)
    })
  })

  describe('Consistency', () => {
    it('should have same styles for menu-item in both overrides', () => {
      const itemStyles = listItemOverrides.root['&&.menu-item']
      const buttonStyles = listItemButtonOverrides.root['&&.menu-item']

      expect(itemStyles.borderRadius).toBe(buttonStyles.borderRadius)
      expect(itemStyles.boxShadow).toBe(buttonStyles.boxShadow)
      expect(itemStyles.margin).toBe(buttonStyles.margin)
    })

    it('should have same styles for privilegeset-item in both overrides', () => {
      const itemStyles = listItemOverrides.root['&&.privilegeset-item']
      const buttonStyles = listItemButtonOverrides.root['&&.privilegeset-item']

      expect(itemStyles.borderRadius).toBe(buttonStyles.borderRadius)
      expect(itemStyles.boxShadow).toBe(buttonStyles.boxShadow)
      expect(itemStyles.margin).toBe(buttonStyles.margin)
    })
  })

  describe('CSS Validity', () => {
    it('should have valid margin values', () => {
      const marginPattern = /^\d+px \d+$/
      expect(listItemOverrides.root['&&.menu-item'].margin).toMatch(marginPattern)
      expect(listItemButtonOverrides.root['&&.menu-item'].margin).toMatch(marginPattern)
    })
  })
})
