import * as winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

import { LOG_LEVEL, WINSTON_LOG_LEVELS } from './logger-api.consts'

// Register custom colors for log levels BEFORE any logger is created
// Colors must be valid 'colors' package color names
winston.addColors({
  data: 'gray',
  debug: 'green',
  error: 'red',
  info: 'cyan',
  warn: 'yellow',
})

export class ApiLoggingClass {
  static #instance: ApiLoggingClassType
  logger: typeof winston.Logger.prototype

  constructor(params: { appName: string }) {
    this.logger = this.initializeWinston(params.appName)
    ApiLoggingClass.#instance = this
  }

  public static get instance() {
    return ApiLoggingClass.#instance
  }

  public logInfo(msg: string, context?: object) {
    this.log(msg, LOG_LEVEL.INFO, context)
  }

  public logWarn(msg: string, context?: object) {
    this.log(msg, LOG_LEVEL.WARN, context)
  }

  public logError(msg: string, context?: object) {
    this.log(msg, LOG_LEVEL.ERROR, context)
  }

  public logDebug(msg: string, context?: object) {
    if (process.env.NODE_ENV !== 'production') {
      this.log(msg, LOG_LEVEL.DEBUG, context) // Don't log debug in production
    }
  }

  public logData(msg: string, context?: object) {
    if (process.env.NODE_ENV !== 'production') {
      this.log(msg, LOG_LEVEL.DATA, context) // Don't log data in production
    }
  }

  private log(msg: string, level: string, context?: object) {
    this.logger.log(level, msg, { context: context })
  }

  private initializeWinston(appName: string) {
    return winston.createLogger({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'data',
      levels: WINSTON_LOG_LEVELS,
      transports: ApiLoggingClass.getTransports(appName),
    })
  }

  private static getTransports(appName: string) {
    const transports: Array<winston.transport> = [
      new winston.transports.Console({
        format: ApiLoggingClass.getFormatForConsole(),
      }),
    ]

    if (process.env.NODE_ENV === 'production') {
      transports.push(ApiLoggingClass.getFileTransport(appName)) // Also log file in production
    }

    return transports
  }

  private static getFormatForConsole() {
    // Custom format to uppercase level before colorization
    const uppercaseLevel = winston.format((info) => {
      info.level = info.level.toUpperCase()
      return info
    })

    return winston.format.combine(
      winston.format.timestamp(),
      uppercaseLevel(),
      winston.format.colorize({ all: true }),
      winston.format.printf((info) => {
        const context = info.context
          ? ` [CONTEXT] ->\n${JSON.stringify(info.context, null, 2)}`
          : ''
        return `[${info.timestamp}] [${info.level}]: ${info.message}${context}`
      }),
    )
  }

  private static getFileTransport(appName: string) {
    return new DailyRotateFile({
      filename: `${appName}-%DATE%.log`,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format((info) => {
          // console.log(info);
          info.app = appName
          return info
        })(),
        winston.format.json(),
      ),
      maxFiles: '14d', // Only keep last 14 days
      maxSize: '10m', // Rotate after 10MB
      zippedArchive: true, // Compress gzip
    })
  }
}

export type ApiLoggingClassType = typeof ApiLoggingClass.prototype
