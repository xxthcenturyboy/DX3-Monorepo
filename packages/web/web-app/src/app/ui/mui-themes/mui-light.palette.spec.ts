import type { SimplePaletteColorOptions } from '@mui/material'

import { muiLightPalette } from './mui-light.palette'

describe('muiLightPalette', () => {
  it('should be a non-null object', () => {
    expect(muiLightPalette).toBeDefined()
    expect(typeof muiLightPalette).toBe('object')
  })

  it('should have mode set to "light"', () => {
    expect(muiLightPalette?.mode).toBe('light')
  })

  it('should have primary color with main', () => {
    expect(muiLightPalette?.primary).toBeDefined()
    expect((muiLightPalette?.primary as SimplePaletteColorOptions)?.main).toBeDefined()
  })

  it('should have secondary color', () => {
    expect(muiLightPalette?.secondary).toBeDefined()
  })

  it('should have error color', () => {
    expect(muiLightPalette?.error).toBeDefined()
  })

  it('should have success color', () => {
    expect(muiLightPalette?.success).toBeDefined()
  })

  it('should have background with default and paper', () => {
    expect(muiLightPalette?.background).toBeDefined()
    expect(muiLightPalette?.background?.default).toBeDefined()
    expect(muiLightPalette?.background?.paper).toBeDefined()
  })
})
