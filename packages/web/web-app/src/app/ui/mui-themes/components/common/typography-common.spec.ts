import { typographyOverridesCommon } from './typography-common'

describe('typographyOverridesCommon', () => {
  it('should be a non-null object', () => {
    expect(typographyOverridesCommon).toBeDefined()
    expect(typeof typographyOverridesCommon).toBe('object')
  })

  it('should have fontFamily defined', () => {
    expect(typographyOverridesCommon.fontFamily).toBeDefined()
  })

  it('should include Roboto in fontFamily', () => {
    expect(typographyOverridesCommon.fontFamily).toContain('Roboto')
  })
})
