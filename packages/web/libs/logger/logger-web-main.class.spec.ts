import { logger, WebLoggingClass } from './logger-web-main.class'

describe('logger singleton', () => {
  it('should exist when imported', () => {
    expect(logger).toBeDefined()
  })

  it('should have all three methods when instantiated', () => {
    expect(logger.error).toBeDefined()
    expect(logger.log).toBeDefined()
    expect(logger.warn).toBeDefined()
  })
})

describe('WebLoggingClass', () => {
  let consoleErrorSpy: jest.SpyInstance
  let consoleLogSpy: jest.SpyInstance
  let consoleWarnSpy: jest.SpyInstance

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('log level (default / active for all methods)', () => {
    it('should call console.log when log() is invoked', () => {
      const instance = new WebLoggingClass({ level: 'log' })

      instance.log('test message')

      expect(consoleLogSpy).toHaveBeenCalledWith('test message')
    })

    it('should call console.warn when warn() is invoked', () => {
      const instance = new WebLoggingClass({ level: 'log' })

      instance.warn('warn message')

      expect(consoleWarnSpy).toHaveBeenCalledWith('warn message')
    })

    it('should call console.error when error() is invoked', () => {
      const instance = new WebLoggingClass({ level: 'log' })

      instance.error('error message')

      expect(consoleErrorSpy).toHaveBeenCalledWith('error message')
    })

    it('should forward multiple arguments to console methods', () => {
      const instance = new WebLoggingClass({ level: 'log' })

      instance.log('msg', { extra: true }, 42)

      expect(consoleLogSpy).toHaveBeenCalledWith('msg', { extra: true }, 42)
    })
  })

  describe('warn level (suppresses log only)', () => {
    it('should NOT call console.log when log() is invoked', () => {
      const instance = new WebLoggingClass({ level: 'warn' })

      instance.log('should be suppressed')

      expect(consoleLogSpy).not.toHaveBeenCalled()
    })

    it('should call console.warn when warn() is invoked', () => {
      const instance = new WebLoggingClass({ level: 'warn' })

      instance.warn('warn message')

      expect(consoleWarnSpy).toHaveBeenCalledWith('warn message')
    })

    it('should call console.error when error() is invoked', () => {
      const instance = new WebLoggingClass({ level: 'warn' })

      instance.error('error message')

      expect(consoleErrorSpy).toHaveBeenCalledWith('error message')
    })
  })

  describe('error level (suppresses log and warn)', () => {
    it('should NOT call console.log when log() is invoked', () => {
      const instance = new WebLoggingClass({ level: 'error' })

      instance.log('should be suppressed')

      expect(consoleLogSpy).not.toHaveBeenCalled()
    })

    it('should NOT call console.warn when warn() is invoked', () => {
      const instance = new WebLoggingClass({ level: 'error' })

      instance.warn('should be suppressed')

      expect(consoleWarnSpy).not.toHaveBeenCalled()
    })

    it('should call console.error when error() is invoked', () => {
      const instance = new WebLoggingClass({ level: 'error' })

      instance.error('error message')

      expect(consoleErrorSpy).toHaveBeenCalledWith('error message')
    })
  })

  describe('no options (defaults to log level)', () => {
    it('should call console.log when no options are provided', () => {
      const instance = new WebLoggingClass()

      instance.log('default log')

      expect(consoleLogSpy).toHaveBeenCalledWith('default log')
    })

    it('should call console.warn when no options are provided', () => {
      const instance = new WebLoggingClass()

      instance.warn('default warn')

      expect(consoleWarnSpy).toHaveBeenCalledWith('default warn')
    })

    it('should call console.error when no options are provided', () => {
      const instance = new WebLoggingClass()

      instance.error('default error')

      expect(consoleErrorSpy).toHaveBeenCalledWith('default error')
    })
  })
})
