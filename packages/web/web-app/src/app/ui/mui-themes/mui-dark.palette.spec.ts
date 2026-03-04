import type { SimplePaletteColorOptions } from '@mui/material'

import { muiDarkPalette } from './mui-dark.palette'

describe('muiDarkPalette', () => {
  it('should be a non-null object', () => {
    expect(muiDarkPalette).toBeDefined()
    expect(typeof muiDarkPalette).toBe('object')
  })

  it('should have mode set to "dark"', () => {
    expect(muiDarkPalette?.mode).toBe('dark')
  })

  it('should have primary color with main', () => {
    expect(muiDarkPalette?.primary).toBeDefined()
    expect((muiDarkPalette?.primary as SimplePaletteColorOptions)?.main).toBeDefined()
  })

  it('should have secondary color', () => {
    expect(muiDarkPalette?.secondary).toBeDefined()
  })

  it('should have error color', () => {
    expect(muiDarkPalette?.error).toBeDefined()
  })

  it('should have success color', () => {
    expect(muiDarkPalette?.success).toBeDefined()
  })

  it('should have background with default and paper', () => {
    expect(muiDarkPalette?.background).toBeDefined()
    expect(muiDarkPalette?.background?.default).toBeDefined()
    expect(muiDarkPalette?.background?.paper).toBeDefined()
  })
})
