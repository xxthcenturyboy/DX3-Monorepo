import type { LogFnType, LogLevelType } from './logger-web-main.types'

// biome-ignore lint/suspicious/noExplicitAny: no-explicit-any
const NO_OP: LogFnType = (_message?: any, ..._optionalParams: any[]) => {}

export class WebLoggingClass {
  readonly log: LogFnType
  readonly warn: LogFnType
  readonly error: LogFnType

  constructor(options?: { level?: LogLevelType }) {
    const { level } = options || {}

    this.error = console.error.bind(console)

    if (level === 'error') {
      this.warn = NO_OP
      this.log = NO_OP

      return
    }

    this.warn = console.warn.bind(console)

    if (level === 'warn') {
      this.log = NO_OP

      return
    }

    this.log = console.log.bind(console)
  }
}

export const logger = new WebLoggingClass({ level: 'log' })
export type WebLoggingClassType = typeof WebLoggingClass.prototype
