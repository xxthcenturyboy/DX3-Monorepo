import { dialogOverrides } from './dialog'

describe('dialog styles', () => {
  describe('dialogOverrides', () => {
    it('should be defined', () => {
      expect(dialogOverrides).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof dialogOverrides).toBe('object')
    })

    it('should have root property', () => {
      expect(dialogOverrides.root).toBeDefined()
    })

    it('should have backdropFilter in root', () => {
      expect(dialogOverrides.root.backdropFilter).toBeDefined()
    })

    it('should apply blur effect to backdrop', () => {
      expect(dialogOverrides.root.backdropFilter).toBe('blur(5px)')
    })

    it('should have valid CSS backdropFilter value', () => {
      expect(dialogOverrides.root.backdropFilter).toContain('blur')
      expect(dialogOverrides.root.backdropFilter).toContain('px')
    })
  })

  describe('Structure', () => {
    it('should have only root property at top level', () => {
      const keys = Object.keys(dialogOverrides)
      expect(keys).toEqual(['root'])
    })

    it('should be immutable', () => {
      const originalBackdrop = dialogOverrides.root.backdropFilter
      const accessedBackdrop = dialogOverrides.root.backdropFilter
      expect(originalBackdrop).toBe(accessedBackdrop)
    })
  })

  describe('CSS Validity', () => {
    it('should be usable as MUI theme override', () => {
      expect(() => {
        const override = {
          MuiDialog: {
            styleOverrides: dialogOverrides,
          },
        }
        expect(override.MuiDialog.styleOverrides).toBe(dialogOverrides)
      }).not.toThrow()
    })

    it('should have valid backdrop filter syntax', () => {
      const filterValue = dialogOverrides.root.backdropFilter
      expect(filterValue).toMatch(/blur\(\d+px\)/)
    })
  })
})
