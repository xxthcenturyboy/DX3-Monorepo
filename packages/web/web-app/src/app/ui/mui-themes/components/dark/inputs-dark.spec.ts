import {
  checkboxOverridesDark,
  filledInputOverridesDark,
  outlinedInputOverridesDark,
  textFieldOverridesDark,
} from './inputs-dark'

describe('inputs-dark theme overrides', () => {
  it('should export filledInputOverridesDark', () => {
    expect(filledInputOverridesDark).toBeDefined()
    expect(filledInputOverridesDark).toHaveProperty('styleOverrides')
  })

  it('should export outlinedInputOverridesDark', () => {
    expect(outlinedInputOverridesDark).toBeDefined()
    expect(outlinedInputOverridesDark).toHaveProperty('styleOverrides')
  })

  it('should export checkboxOverridesDark', () => {
    expect(checkboxOverridesDark).toBeDefined()
    expect(checkboxOverridesDark).toHaveProperty('styleOverrides')
  })

  it('should export textFieldOverridesDark', () => {
    expect(textFieldOverridesDark).toBeDefined()
    expect(textFieldOverridesDark).toHaveProperty('styleOverrides')
  })
})
