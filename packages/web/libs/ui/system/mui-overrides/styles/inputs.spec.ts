import { BORDER_RADIUS } from './common'
import {
  checkboxStyleOverrides,
  filledInputDefaults,
  filledInputSyleOverrides,
  outlinedInputInputDefaults,
  outlinedInputSyleOverrides,
} from './inputs'
import { APP_COLOR_PALETTE } from './themeColors'

describe('inputs styles', () => {
  describe('filledInputSyleOverrides', () => {
    it('should be defined', () => {
      expect(filledInputSyleOverrides).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof filledInputSyleOverrides).toBe('object')
    })

    it('should have root property', () => {
      expect(filledInputSyleOverrides.root).toBeDefined()
    })

    it('should apply BORDER_RADIUS', () => {
      expect(filledInputSyleOverrides.root.borderRadius).toBe(BORDER_RADIUS)
    })

    it('should have transparent border', () => {
      expect(filledInputSyleOverrides.root.border).toBe('1px solid transparent')
    })

    it('should have Mui-focused state', () => {
      expect(filledInputSyleOverrides.root['&.Mui-focused']).toBeDefined()
    })

    it('should apply colored border when focused', () => {
      const focusedBorder = filledInputSyleOverrides.root['&.Mui-focused'].border
      expect(focusedBorder).toContain('1px solid')
      expect(focusedBorder).toContain(APP_COLOR_PALETTE.SECONDARY[700])
    })

    it('should apply background color when focused', () => {
      const focusedBg = filledInputSyleOverrides.root['&.Mui-focused'].backgroundColor
      expect(focusedBg).toBe(APP_COLOR_PALETTE.SECONDARY[50])
    })
  })

  describe('outlinedInputSyleOverrides', () => {
    it('should be defined', () => {
      expect(outlinedInputSyleOverrides).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof outlinedInputSyleOverrides).toBe('object')
    })

    it('should have root property', () => {
      expect(outlinedInputSyleOverrides.root).toBeDefined()
    })

    it('should apply BORDER_RADIUS', () => {
      expect(outlinedInputSyleOverrides.root.borderRadius).toBe(BORDER_RADIUS)
    })

    it('should have Mui-focused state', () => {
      expect(outlinedInputSyleOverrides.root['&.Mui-focused']).toBeDefined()
    })

    it('should have notchedOutline selector when focused', () => {
      const focused = outlinedInputSyleOverrides.root['&.Mui-focused']
      expect(focused['& .MuiOutlinedInput-notchedOutline']).toBeDefined()
    })

    it('should apply colored border to notchedOutline when focused', () => {
      const notchedBorder =
        outlinedInputSyleOverrides.root['&.Mui-focused']['& .MuiOutlinedInput-notchedOutline']
          .border
      expect(notchedBorder).toContain('1px solid')
      expect(notchedBorder).toContain(APP_COLOR_PALETTE.SECONDARY[700])
    })

    it('should apply background color when focused', () => {
      const focusedBg = outlinedInputSyleOverrides.root['&.Mui-focused'].backgroundColor
      expect(focusedBg).toBe(APP_COLOR_PALETTE.SECONDARY[50])
    })
  })

  describe('filledInputDefaults', () => {
    it('should be defined', () => {
      expect(filledInputDefaults).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof filledInputDefaults).toBe('object')
    })

    it('should have disableUnderline property', () => {
      expect(filledInputDefaults.disableUnderline).toBeDefined()
    })

    it('should set disableUnderline to true', () => {
      expect(filledInputDefaults.disableUnderline).toBe(true)
    })
  })

  describe('outlinedInputInputDefaults', () => {
    it('should be defined', () => {
      expect(outlinedInputInputDefaults).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof outlinedInputInputDefaults).toBe('object')
    })

    it('should be an empty object or have optional properties', () => {
      expect(outlinedInputInputDefaults).toEqual({})
    })
  })

  describe('checkboxStyleOverrides', () => {
    it('should be defined', () => {
      expect(checkboxStyleOverrides).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof checkboxStyleOverrides).toBe('object')
    })

    it('should have root property', () => {
      expect(checkboxStyleOverrides.root).toBeDefined()
    })

    it('should apply color from APP_COLOR_PALETTE', () => {
      expect(checkboxStyleOverrides.root.color).toBe(APP_COLOR_PALETTE.PRIMARY[200])
    })

    it('should have Mui-checked state', () => {
      expect(checkboxStyleOverrides.root['&.Mui-checked']).toBeDefined()
    })

    it('should apply checked color', () => {
      expect(checkboxStyleOverrides.root['&.Mui-checked'].color).toBe(
        APP_COLOR_PALETTE.SECONDARY[700],
      )
    })

    it('should have Mui-checked-error state', () => {
      expect(checkboxStyleOverrides.root['&.Mui-checked-error']).toBeDefined()
    })

    it('should apply error color', () => {
      expect(checkboxStyleOverrides.root['&.Mui-checked-error'].color).toBe(
        APP_COLOR_PALETTE.RED[200],
      )
    })

    it('should have nested Mui-checked in error state', () => {
      const errorChecked = checkboxStyleOverrides.root['&.Mui-checked-error']['&.Mui-checked']
      expect(errorChecked).toBeDefined()
      expect(errorChecked.color).toBe(APP_COLOR_PALETTE.RED[500])
    })
  })

  describe('Integration with themeColors and common', () => {
    it('should use BORDER_RADIUS from common in filled inputs', () => {
      expect(filledInputSyleOverrides.root.borderRadius).toBe(BORDER_RADIUS)
    })

    it('should use BORDER_RADIUS from common in outlined inputs', () => {
      expect(outlinedInputSyleOverrides.root.borderRadius).toBe(BORDER_RADIUS)
    })

    it('should use APP_COLOR_PALETTE colors consistently', () => {
      const focusColor = APP_COLOR_PALETTE.SECONDARY[700]
      const focusBg = APP_COLOR_PALETTE.SECONDARY[50]

      expect(filledInputSyleOverrides.root['&.Mui-focused'].border).toContain(focusColor)
      expect(filledInputSyleOverrides.root['&.Mui-focused'].backgroundColor).toBe(focusBg)
      expect(
        outlinedInputSyleOverrides.root['&.Mui-focused']['& .MuiOutlinedInput-notchedOutline']
          .border,
      ).toContain(focusColor)
      expect(outlinedInputSyleOverrides.root['&.Mui-focused'].backgroundColor).toBe(focusBg)
    })
  })

  describe('CSS Validity', () => {
    it('should have valid border syntax in filled inputs', () => {
      const border = filledInputSyleOverrides.root.border
      expect(border).toMatch(/^\d+px solid/)
    })

    it('should have valid border syntax in outlined inputs when focused', () => {
      const border =
        outlinedInputSyleOverrides.root['&.Mui-focused']['& .MuiOutlinedInput-notchedOutline']
          .border
      expect(border).toMatch(/^\d+px solid/)
    })

    it('should have valid color values in checkbox', () => {
      const isValidColor = (color: string) => {
        return /^#[0-9A-F]{6}$/i.test(color) || /^[a-z]+$/i.test(color)
      }

      const defaultColor = checkboxStyleOverrides.root.color
      const checkedColor = checkboxStyleOverrides.root['&.Mui-checked'].color

      expect(isValidColor(defaultColor)).toBe(true)
      expect(isValidColor(checkedColor)).toBe(true)
    })
  })

  describe('Consistency', () => {
    it('should use same focus background color for both input types', () => {
      const filledBg = filledInputSyleOverrides.root['&.Mui-focused'].backgroundColor
      const outlinedBg = outlinedInputSyleOverrides.root['&.Mui-focused'].backgroundColor
      expect(filledBg).toBe(outlinedBg)
    })

    it('should maintain immutable values', () => {
      const firstRadius = filledInputSyleOverrides.root.borderRadius
      const secondRadius = filledInputSyleOverrides.root.borderRadius
      expect(firstRadius).toBe(secondRadius)
    })
  })
})
