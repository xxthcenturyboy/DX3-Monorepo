import { dialogOverridesCommon } from './dialog-common'

describe('dialogOverridesCommon', () => {
  it('should be defined', () => {
    expect(dialogOverridesCommon).toBeDefined()
  })

  it('should be an object', () => {
    expect(typeof dialogOverridesCommon).toBe('object')
  })

  it('should have styleOverrides property', () => {
    expect(dialogOverridesCommon.styleOverrides).toBeDefined()
  })

  it('should have root in styleOverrides', () => {
    expect(dialogOverridesCommon.styleOverrides?.root).toBeDefined()
  })

  it('should have paper in styleOverrides', () => {
    expect(dialogOverridesCommon.styleOverrides?.paper).toBeDefined()
  })

  it('should have defaultProps property', () => {
    expect(dialogOverridesCommon.defaultProps).toBeDefined()
  })

  it('should be usable as MUI theme override', () => {
    expect(() => {
      const override = {
        MuiDialog: dialogOverridesCommon,
      }
      expect(override.MuiDialog).toBe(dialogOverridesCommon)
    }).not.toThrow()
  })

  it('should have styleOverrides with root and paper keys', () => {
    const keys = Object.keys(dialogOverridesCommon.styleOverrides || {})
    expect(keys).toContain('root')
    expect(keys).toContain('paper')
  })
})
