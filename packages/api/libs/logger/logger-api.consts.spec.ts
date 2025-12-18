import { API_LOGGER_COLORS, LOG_LEVEL, LOGGER_ENTITY_NAME } from './logger-api.consts'

describe('LOGGER_ENTITY_NAME ', () => {
  // arrange
  // act
  // assert
  it('should exist when imported', () => {
    expect(LOGGER_ENTITY_NAME).toBeDefined()
  })

  it('should have correct value', () => {
    expect(LOGGER_ENTITY_NAME).toEqual('logger')
  })
})

describe('LOG_LEVEL ', () => {
  // arrange
  // act
  // assert
  it('should exist when imported', () => {
    expect(LOG_LEVEL).toBeDefined()
  })

  it('should have correct values', () => {
    expect(LOG_LEVEL.DEBUG).toEqual('debug')
    expect(LOG_LEVEL.ERROR).toEqual('error')
    expect(LOG_LEVEL.INFO).toEqual('info')
    expect(LOG_LEVEL.WARN).toEqual('warn')
  })
})

describe('API_LOGGER_COLORS', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(API_LOGGER_COLORS).toBeDefined()
  })

  it('should be an object', () => {
    // arrange
    // act
    // assert
    expect(typeof API_LOGGER_COLORS).toBe('object')
  })

  describe('Basic colors', () => {
    it('should have correct basic color values', () => {
      // arrange
      // act
      // assert
      expect(API_LOGGER_COLORS.black).toEqual('black')
      expect(API_LOGGER_COLORS.red).toEqual('red')
      expect(API_LOGGER_COLORS.green).toEqual('green')
      expect(API_LOGGER_COLORS.yellow).toEqual('yellow')
      expect(API_LOGGER_COLORS.blue).toEqual('blue')
      expect(API_LOGGER_COLORS.magenta).toEqual('magenta')
      expect(API_LOGGER_COLORS.cyan).toEqual('cyan')
      expect(API_LOGGER_COLORS.white).toEqual('white')
      expect(API_LOGGER_COLORS.gray).toEqual('gray')
      expect(API_LOGGER_COLORS.grey).toEqual('grey')
    })
  })

  describe('Bright colors', () => {
    it('should have correct bright color values', () => {
      // arrange
      // act
      // assert
      expect(API_LOGGER_COLORS.blackBright).toEqual('blackBright')
      expect(API_LOGGER_COLORS.redBright).toEqual('redBright')
      expect(API_LOGGER_COLORS.greenBright).toEqual('greenBright')
      expect(API_LOGGER_COLORS.yellowBright).toEqual('yellowBright')
      expect(API_LOGGER_COLORS.blueBright).toEqual('blueBright')
      expect(API_LOGGER_COLORS.magentaBright).toEqual('magentaBright')
      expect(API_LOGGER_COLORS.cyanBright).toEqual('cyanBright')
      expect(API_LOGGER_COLORS.whiteBright).toEqual('whiteBright')
    })
  })

  describe('Background colors', () => {
    it('should have correct background color values', () => {
      // arrange
      // act
      // assert
      expect(API_LOGGER_COLORS.bgBlack).toEqual('bgBlack')
      expect(API_LOGGER_COLORS.bgRed).toEqual('bgRed')
      expect(API_LOGGER_COLORS.bgGreen).toEqual('bgGreen')
      expect(API_LOGGER_COLORS.bgYellow).toEqual('bgYellow')
      expect(API_LOGGER_COLORS.bgBlue).toEqual('bgBlue')
      expect(API_LOGGER_COLORS.bgMagenta).toEqual('bgMagenta')
      expect(API_LOGGER_COLORS.bgCyan).toEqual('bgCyan')
      expect(API_LOGGER_COLORS.bgWhite).toEqual('bgWhite')
    })
  })

  describe('Background bright colors', () => {
    it('should have correct background bright color values', () => {
      // arrange
      // act
      // assert
      expect(API_LOGGER_COLORS.bgBlackBright).toEqual('bgBlackBright')
      expect(API_LOGGER_COLORS.bgRedBright).toEqual('bgRedBright')
      expect(API_LOGGER_COLORS.bgGreenBright).toEqual('bgGreenBright')
      expect(API_LOGGER_COLORS.bgYellowBright).toEqual('bgYellowBright')
      expect(API_LOGGER_COLORS.bgBlueBright).toEqual('bgBlueBright')
      expect(API_LOGGER_COLORS.bgMagentaBright).toEqual('bgMagentaBright')
      expect(API_LOGGER_COLORS.bgCyanBright).toEqual('bgCyanBright')
      expect(API_LOGGER_COLORS.bgWhiteBright).toEqual('bgWhiteBright')
    })
  })

  it('should have exactly 34 color properties', () => {
    // arrange
    // act
    const colorKeys = Object.keys(API_LOGGER_COLORS)
    // assert
    expect(colorKeys.length).toBe(34)
  })

  it('should have all expected color properties', () => {
    // arrange
    const expectedColors = [
      'black',
      'red',
      'green',
      'yellow',
      'blue',
      'magenta',
      'cyan',
      'white',
      'gray',
      'grey',
      'blackBright',
      'redBright',
      'greenBright',
      'yellowBright',
      'blueBright',
      'magentaBright',
      'cyanBright',
      'whiteBright',
      'bgBlack',
      'bgRed',
      'bgGreen',
      'bgYellow',
      'bgBlue',
      'bgMagenta',
      'bgCyan',
      'bgWhite',
      'bgBlackBright',
      'bgRedBright',
      'bgGreenBright',
      'bgYellowBright',
      'bgBlueBright',
      'bgMagentaBright',
      'bgCyanBright',
      'bgWhiteBright',
    ]
    // act
    const colorKeys = Object.keys(API_LOGGER_COLORS)
    // assert
    expectedColors.forEach((color) => {
      expect(colorKeys).toContain(color)
    })
  })
})
