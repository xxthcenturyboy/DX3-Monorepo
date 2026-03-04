import { toolbarItemOverridesDark } from './menus-dark'

describe('toolbarItemOverridesDark', () => {
  it('should be defined', () => {
    expect(toolbarItemOverridesDark).toBeDefined()
  })

  it('should have styleOverrides property', () => {
    expect(toolbarItemOverridesDark).toHaveProperty('styleOverrides')
  })

  it('should have root style overrides', () => {
    expect(toolbarItemOverridesDark?.styleOverrides).toHaveProperty('root')
  })
})
