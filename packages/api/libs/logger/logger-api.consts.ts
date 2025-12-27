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
