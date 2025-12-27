export const LOGGER_ENTITY_NAME = 'logger'

/**
 * Log levels in order of priority (lowest number = highest priority)
 * Winston uses numeric priorities: lower number = more severe
 */
export const LOG_LEVEL = {
  DATA: 'data',
  DEBUG: 'debug',
  ERROR: 'error',
  INFO: 'info',
  WARN: 'warn',
}

/**
 * Winston custom log levels with priorities
 * Lower number = higher priority (more severe)
 */
export const WINSTON_LOG_LEVELS = {
  data: 5,
  debug: 4,
  error: 0,
  info: 2,
  warn: 1,
}

export const API_LOGGER_COLORS = {
  bgBlack: 'bgBlack',
  bgBlackBright: 'bgBlackBright',
  bgBlue: 'bgBlue',
  bgBlueBright: 'bgBlueBright',
  bgCyan: 'bgCyan',
  bgCyanBright: 'bgCyanBright',
  bgGreen: 'bgGreen',
  bgGreenBright: 'bgGreenBright',
  bgMagenta: 'bgMagenta',
  bgMagentaBright: 'bgMagentaBright',
  bgRed: 'bgRed',
  bgRedBright: 'bgRedBright',
  bgWhite: 'bgWhite',
  bgWhiteBright: 'bgWhiteBright',
  bgYellow: 'bgYellow',
  bgYellowBright: 'bgYellowBright',
  black: 'black',
  blackBright: 'blackBright',
  blue: 'blue',
  blueBright: 'blueBright',
  cyan: 'cyan',
  cyanBright: 'cyanBright',
  gray: 'gray',
  green: 'green',
  greenBright: 'greenBright',
  grey: 'grey',
  magenta: 'magenta',
  magentaBright: 'magentaBright',
  red: 'red',
  redBright: 'redBright',
  white: 'white',
  whiteBright: 'whiteBright',
  yellow: 'yellow',
  yellowBright: 'yellowBright',
}
