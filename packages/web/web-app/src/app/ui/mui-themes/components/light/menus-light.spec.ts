import { toolbarItemOverridesLight } from './menus-light'

describe('toolbarItemOverridesLight', () => {
  it('should be defined', () => {
    expect(toolbarItemOverridesLight).toBeDefined()
  })

  it('should have styleOverrides property', () => {
    expect(toolbarItemOverridesLight).toHaveProperty('styleOverrides')
  })

  it('should have root style overrides', () => {
    expect(toolbarItemOverridesLight?.styleOverrides).toHaveProperty('root')
  })
})
