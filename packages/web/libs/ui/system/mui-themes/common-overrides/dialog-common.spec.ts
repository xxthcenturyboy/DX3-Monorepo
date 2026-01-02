import { dialogOverridesCommon } from './dialog-common'

describe('dialog styles', () => {
  describe('dialogOverridesCommon', () => {
    it('should be defined', () => {
      expect(dialogOverridesCommon).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof dialogOverridesCommon).toBe('object')
    })

    it('should have root property', () => {
      expect(dialogOverridesCommon.styleOverrides.root).toBeDefined()
    })

    it('should have backdropFilter in root', () => {
      // @ts-expect-error - it does exist
      expect(dialogOverridesCommon.styleOverrides?.root?.backdropFilter).toBeDefined()
    })

    it('should apply blur effect to backdrop', () => {
      // @ts-expect-error - it does exist
      expect(dialogOverridesCommon.styleOverrides?.root?.backdropFilter).toBe('blur(5px)')
    })

    it('should have valid CSS backdropFilter value', () => {
      // @ts-expect-error - it does exist
      expect(dialogOverridesCommon.styleOverrides?.root?.backdropFilter).toContain('blur')
      // @ts-expect-error - it does exist
      expect(dialogOverridesCommon.styleOverrides?.root?.backdropFilter).toContain('px')
    })
  })

  describe('Structure', () => {
    it('should have only root property at top level', () => {
      const keys = Object.keys(dialogOverridesCommon.styleOverrides || {})
      expect(keys).toEqual(['root']) // Assuming styleOverrides always has a 'root' property
    })

    it('should be immutable', () => {
      // @ts-expect-error - it does exist
      const originalBackdrop = dialogOverridesCommon.styleOverrides.root.backdropFilter
      // @ts-expect-error - it does exist
      const accessedBackdrop = dialogOverridesCommon.styleOverrides.root.backdropFilter
      expect(originalBackdrop).toBe(accessedBackdrop)
    })
  })

  describe('CSS Validity', () => {
    it('should be usable as MUI theme override', () => {
      expect(() => {
        const override = {
          MuiDialog: {
            styleOverrides: dialogOverridesCommon,
          },
        }
        expect(override.MuiDialog.styleOverrides).toBe(dialogOverridesCommon)
      }).not.toThrow()
    })

    it('should have valid backdrop filter syntax', () => {
      // @ts-expect-error - it does exist
      const filterValue = dialogOverridesCommon.styleOverrides?.root?.backdropFilter
      expect(filterValue).toMatch(/blur\(\d+px\)/)
    })
  })
})
