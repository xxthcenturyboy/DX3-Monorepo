import * as winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

import { API_LOGGER_COLORS, LOG_LEVEL } from './logger-api.consts'

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

  private log(msg: string, level: string, context?: object) {
    this.logger.log(level, msg, { context: context })
  }

  private initializeWinston(appName: string) {
    const logger = winston.createLogger({
      transports: ApiLoggingClass.getTransports(appName),
    })
    return logger
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
    return winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(
        (info) =>
          `[${info.timestamp}] [${info.level.toUpperCase()}]: ${info.message} ${info.context ? ` [CONTEXT] -> \n ${JSON.stringify(info.context, null, 2)}` : ''}`,
      ),
      winston.format.colorize({
        all: true,
        colors: {
          debug: API_LOGGER_COLORS.greenBright,
          error: API_LOGGER_COLORS.magenta,
          info: API_LOGGER_COLORS.cyan,
          warn: API_LOGGER_COLORS.yellow,
        },
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
