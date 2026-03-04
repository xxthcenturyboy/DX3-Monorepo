import {
  checkboxOverridesLight,
  filledInputOverridesLight,
  outlinedInputOverridesLight,
  textFieldOverridesLight,
} from './inputs-light'

describe('inputs-light theme overrides', () => {
  it('should export filledInputOverridesLight', () => {
    expect(filledInputOverridesLight).toBeDefined()
    expect(filledInputOverridesLight).toHaveProperty('styleOverrides')
  })

  it('should export outlinedInputOverridesLight', () => {
    expect(outlinedInputOverridesLight).toBeDefined()
    expect(outlinedInputOverridesLight).toHaveProperty('styleOverrides')
  })

  it('should export checkboxOverridesLight', () => {
    expect(checkboxOverridesLight).toBeDefined()
    expect(checkboxOverridesLight).toHaveProperty('styleOverrides')
  })

  it('should export textFieldOverridesLight', () => {
    expect(textFieldOverridesLight).toBeDefined()
    expect(textFieldOverridesLight).toHaveProperty('styleOverrides')
  })
})
