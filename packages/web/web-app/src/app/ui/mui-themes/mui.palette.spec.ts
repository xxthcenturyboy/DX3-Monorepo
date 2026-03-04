import { WEB_APP_COLOR_PALETTE } from './mui.palette'

describe('WEB_APP_COLOR_PALETTE', () => {
  it('should be a non-null object', () => {
    expect(WEB_APP_COLOR_PALETTE).toBeDefined()
    expect(typeof WEB_APP_COLOR_PALETTE).toBe('object')
  })

  it('should have PRIMARY color', () => {
    expect(WEB_APP_COLOR_PALETTE.PRIMARY).toBeDefined()
  })

  it('should have SECONDARY color', () => {
    expect(WEB_APP_COLOR_PALETTE.SECONDARY).toBeDefined()
  })

  it('should have ERROR color', () => {
    expect(WEB_APP_COLOR_PALETTE.ERROR).toBeDefined()
  })

  it('should have SUCCESS color', () => {
    expect(WEB_APP_COLOR_PALETTE.SUCCESS).toBeDefined()
  })

  it('should have BACKGROUND color with DARK and LIGHT variants', () => {
    expect(WEB_APP_COLOR_PALETTE.BACKGROUND).toBeDefined()
    expect(WEB_APP_COLOR_PALETTE.BACKGROUND.DARK).toBeDefined()
    expect(WEB_APP_COLOR_PALETTE.BACKGROUND.LIGHT).toBeDefined()
  })

  it('should have BRAND color', () => {
    expect(WEB_APP_COLOR_PALETTE.BRAND).toBeDefined()
  })
})
