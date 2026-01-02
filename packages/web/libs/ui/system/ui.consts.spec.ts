import {
  APP_COLOR_PALETTE,
  BORDER_RADIUS,
  BOX_SHADOW,
  DRAWER_WIDTH,
  FADE_TIMEOUT_DUR,
  MEDIA_BREAK,
  MODAL_ROOT_ELEM_ID,
  TIMEOUT_DUR_200,
  TIMEOUT_DUR_500,
  TIMEOUT_DUR_1000,
} from './ui.consts'

describe('APP_COLOR_PALETTE', () => {
  it('should be defined', () => {
    expect(APP_COLOR_PALETTE).toBeDefined()
  })

  it('should have PRIMARY property', () => {
    expect(APP_COLOR_PALETTE.PRIMARY).toBeDefined()
  })

  it('should have SECONDARY property', () => {
    expect(APP_COLOR_PALETTE.SECONDARY).toBeDefined()
  })

  it('should have DARK object with PRIMARY and SECONDARY', () => {
    expect(APP_COLOR_PALETTE.DARK).toBeDefined()
    expect(APP_COLOR_PALETTE.DARK.PRIMARY).toBeDefined()
    expect(APP_COLOR_PALETTE.DARK.SECONDARY).toBeDefined()
  })

  it('should have LIGHT object with BACKGROUND', () => {
    expect(APP_COLOR_PALETTE.LIGHT).toBeDefined()
    expect(APP_COLOR_PALETTE.LIGHT.BACKGROUND).toBeDefined()
  })

  it('should have color palette properties', () => {
    expect(APP_COLOR_PALETTE.BLUE).toBeDefined()
    expect(APP_COLOR_PALETTE.BLUE_GREY).toBeDefined()
    expect(APP_COLOR_PALETTE.GREEN).toBeDefined()
    expect(APP_COLOR_PALETTE.INFO).toBeDefined()
    expect(APP_COLOR_PALETTE.ORANGE).toBeDefined()
    expect(APP_COLOR_PALETTE.RED).toBeDefined()
  })

  it('should have valid color objects from MUI', () => {
    expect(typeof APP_COLOR_PALETTE.PRIMARY).toBe('object')
    expect(typeof APP_COLOR_PALETTE.SECONDARY).toBe('object')
    expect(typeof APP_COLOR_PALETTE.BLUE).toBe('object')
  })

  it('should have indexable color values', () => {
    expect(APP_COLOR_PALETTE.PRIMARY[900]).toBeDefined()
    expect(APP_COLOR_PALETTE.SECONDARY[800]).toBeDefined()
    expect(APP_COLOR_PALETTE.DARK.PRIMARY[500]).toBeDefined()
  })
})

describe('BORDER_RADIUS', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(BORDER_RADIUS).toBeDefined()
  })
})

describe('BOX_SHADOW', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(BOX_SHADOW).toBeDefined()
  })
})

describe('DRAWER_WIDTH', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(DRAWER_WIDTH).toBeDefined()
  })
})

describe('FADE_TIMEOUT_DUR', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(FADE_TIMEOUT_DUR).toBeDefined()
  })
})

describe('MEDIA_BREAK', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(MEDIA_BREAK).toBeDefined()
  })
})

describe('MODAL_ROOT_ELEM_ID', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(MODAL_ROOT_ELEM_ID).toBeDefined()
  })
})

describe('TIMEOUT_DUR_200', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(TIMEOUT_DUR_200).toBeDefined()
  })
})

describe('TIMEOUT_DUR_500', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(TIMEOUT_DUR_500).toBeDefined()
  })
})

describe('TIMEOUT_DUR_1000', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(TIMEOUT_DUR_1000).toBeDefined()
  })
})
