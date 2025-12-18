import * as winston from 'winston'

import { ApiLoggingClass } from './logger-api.class'
import { LOG_LEVEL } from './logger-api.consts'

// Mock winston
jest.mock('winston', () => {
  const mockLogger = {
    log: jest.fn(),
  }

  // Create a function that can be called directly and also has methods
  const formatFunction = jest.fn((fn) => {
    // Return a function that winston will call with the info object
    if (typeof fn === 'function') {
      // This simulates the winston format behavior - returns a formatter function
      return () => fn({ level: 'info', message: 'test' })
    }
    return 'custom-format'
  })

  // Add format methods to the function
  Object.assign(formatFunction, {
    colorize: jest.fn(() => 'colorize'),
    combine: jest.fn((...args) => args),
    json: jest.fn(() => 'json'),
    printf: jest.fn((fn) => fn),
    timestamp: jest.fn(() => 'timestamp'),
  })

  return {
    createLogger: jest.fn(() => mockLogger),
    format: formatFunction,
    transports: {
      Console: jest.fn(),
    },
  }
})

// Mock winston-daily-rotate-file
jest.mock('winston-daily-rotate-file', () => {
  return jest.fn()
})

describe('ApiLoggingClass', () => {
  let logger: ApiLoggingClass
  let mockWinstonLogger: any
  const originalEnv = process.env.NODE_ENV

  beforeEach(() => {
    jest.clearAllMocks()
    mockWinstonLogger = {
      log: jest.fn(),
    }
    ;(winston.createLogger as jest.Mock).mockReturnValue(mockWinstonLogger)
  })

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
  })

  describe('Constructor', () => {
    it('should exist when imported', () => {
      expect(ApiLoggingClass).toBeDefined()
    })

    it('should create an instance with appName', () => {
      logger = new ApiLoggingClass({ appName: 'Test App' })
      expect(logger).toBeDefined()
      expect(logger.logger).toBeDefined()
    })

    it('should initialize winston logger', () => {
      logger = new ApiLoggingClass({ appName: 'Test App' })
      expect(winston.createLogger).toHaveBeenCalled()
    })

    it('should set the singleton instance', () => {
      logger = new ApiLoggingClass({ appName: 'Test App' })
      expect(ApiLoggingClass.instance).toBe(logger)
    })
  })

  describe('Static instance getter', () => {
    it('should return the singleton instance', () => {
      logger = new ApiLoggingClass({ appName: 'Test App' })
      const instance = ApiLoggingClass.instance
      expect(instance).toBe(logger)
    })
  })

  describe('Public logging methods', () => {
    beforeEach(() => {
      logger = new ApiLoggingClass({ appName: 'Test App' })
    })

    describe('logInfo', () => {
      it('should be defined', () => {
        expect(logger.logInfo).toBeDefined()
      })

      it('should log info message without context', () => {
        logger.logInfo('Test info message')
        expect(mockWinstonLogger.log).toHaveBeenCalledWith(LOG_LEVEL.INFO, 'Test info message', {
          context: undefined,
        })
      })

      it('should log info message with context', () => {
        const context = { userId: '123' }
        logger.logInfo('Test info message', context)
        expect(mockWinstonLogger.log).toHaveBeenCalledWith(LOG_LEVEL.INFO, 'Test info message', {
          context,
        })
      })
    })

    describe('logWarn', () => {
      it('should be defined', () => {
        expect(logger.logWarn).toBeDefined()
      })

      it('should log warning message without context', () => {
        logger.logWarn('Test warning message')
        expect(mockWinstonLogger.log).toHaveBeenCalledWith(LOG_LEVEL.WARN, 'Test warning message', {
          context: undefined,
        })
      })

      it('should log warning message with context', () => {
        const context = { errorCode: 500 }
        logger.logWarn('Test warning message', context)
        expect(mockWinstonLogger.log).toHaveBeenCalledWith(LOG_LEVEL.WARN, 'Test warning message', {
          context,
        })
      })
    })

    describe('logError', () => {
      it('should be defined', () => {
        expect(logger.logError).toBeDefined()
      })

      it('should log error message without context', () => {
        logger.logError('Test error message')
        expect(mockWinstonLogger.log).toHaveBeenCalledWith(LOG_LEVEL.ERROR, 'Test error message', {
          context: undefined,
        })
      })

      it('should log error message with context', () => {
        const context = { stack: 'error stack trace' }
        logger.logError('Test error message', context)
        expect(mockWinstonLogger.log).toHaveBeenCalledWith(LOG_LEVEL.ERROR, 'Test error message', {
          context,
        })
      })
    })

    describe('logDebug', () => {
      it('should be defined', () => {
        expect(logger.logDebug).toBeDefined()
      })

      it('should log debug message in non-production environment', () => {
        process.env.NODE_ENV = 'development'
        logger = new ApiLoggingClass({ appName: 'Test App' })
        logger.logDebug('Test debug message')
        expect(mockWinstonLogger.log).toHaveBeenCalledWith(LOG_LEVEL.DEBUG, 'Test debug message', {
          context: undefined,
        })
      })

      it('should log debug message with context in non-production environment', () => {
        process.env.NODE_ENV = 'development'
        logger = new ApiLoggingClass({ appName: 'Test App' })
        const context = { debugInfo: 'test' }
        logger.logDebug('Test debug message', context)
        expect(mockWinstonLogger.log).toHaveBeenCalledWith(LOG_LEVEL.DEBUG, 'Test debug message', {
          context,
        })
      })

      it('should NOT log debug message in production environment', () => {
        process.env.NODE_ENV = 'production'
        logger = new ApiLoggingClass({ appName: 'Test App' })
        mockWinstonLogger.log.mockClear()
        logger.logDebug('Test debug message')
        expect(mockWinstonLogger.log).not.toHaveBeenCalled()
      })
    })
  })

  describe('Transport configuration', () => {
    it('should create console transport in non-production', () => {
      process.env.NODE_ENV = 'development'
      logger = new ApiLoggingClass({ appName: 'Test App' })
      expect(winston.transports.Console).toHaveBeenCalled()
    })

    it('should create console transport in production', () => {
      process.env.NODE_ENV = 'production'
      logger = new ApiLoggingClass({ appName: 'Test App' })
      expect(winston.transports.Console).toHaveBeenCalled()
    })

    it('should create file transport in production', () => {
      process.env.NODE_ENV = 'production'
      const DailyRotateFile = require('winston-daily-rotate-file')
      logger = new ApiLoggingClass({ appName: 'Test App' })
      expect(DailyRotateFile).toHaveBeenCalled()
    })

    it('should NOT create file transport in non-production', () => {
      process.env.NODE_ENV = 'development'
      const DailyRotateFile = require('winston-daily-rotate-file')
      DailyRotateFile.mockClear()
      logger = new ApiLoggingClass({ appName: 'Test App' })
      expect(DailyRotateFile).not.toHaveBeenCalled()
    })
  })

  describe('Winston format configuration', () => {
    beforeEach(() => {
      logger = new ApiLoggingClass({ appName: 'Test App' })
    })

    it('should configure timestamp format', () => {
      expect(winston.format.timestamp).toHaveBeenCalled()
    })

    it('should configure printf format', () => {
      expect(winston.format.printf).toHaveBeenCalled()
    })

    it('should configure printf formatter function correctly', () => {
      // Get the formatter function that was passed to printf
      const printfCall = (winston.format.printf as jest.Mock).mock.calls[0]
      expect(printfCall).toBeDefined()

      const formatterFn = printfCall[0]
      expect(typeof formatterFn).toBe('function')

      // Test formatter with context
      const infoWithContext = {
        context: { userId: '123' },
        level: 'info',
        message: 'Test message',
        timestamp: '2024-01-01T00:00:00.000Z',
      }
      const resultWithContext = formatterFn(infoWithContext)
      expect(resultWithContext).toContain('[2024-01-01T00:00:00.000Z]')
      expect(resultWithContext).toContain('[INFO]')
      expect(resultWithContext).toContain('Test message')
      expect(resultWithContext).toContain('[CONTEXT]')
      expect(resultWithContext).toContain('"userId": "123"')

      // Test formatter without context
      const infoWithoutContext = {
        level: 'warn',
        message: 'Warning message',
        timestamp: '2024-01-01T00:00:00.000Z',
      }
      const resultWithoutContext = formatterFn(infoWithoutContext)
      expect(resultWithoutContext).toContain('[2024-01-01T00:00:00.000Z]')
      expect(resultWithoutContext).toContain('[WARN]')
      expect(resultWithoutContext).toContain('Warning message')
      expect(resultWithoutContext).not.toContain('[CONTEXT]')
    })

    it('should configure colorize format', () => {
      expect(winston.format.colorize).toHaveBeenCalled()
    })

    it('should configure combine format', () => {
      expect(winston.format.combine).toHaveBeenCalled()
    })
  })

  describe('File transport configuration in production', () => {
    it('should configure daily rotate file with correct options', () => {
      process.env.NODE_ENV = 'production'
      const DailyRotateFile = require('winston-daily-rotate-file')
      logger = new ApiLoggingClass({ appName: 'ProductionApp' })

      expect(DailyRotateFile).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: 'ProductionApp-%DATE%.log',
          maxFiles: '14d',
          maxSize: '10m',
          zippedArchive: true,
        }),
      )
    })

    it('should configure json format for file transport', () => {
      process.env.NODE_ENV = 'production'
      logger = new ApiLoggingClass({ appName: 'Test App' })
      expect(winston.format.json).toHaveBeenCalled()
    })
  })

  describe('Logger instance', () => {
    it('should have logger property', () => {
      logger = new ApiLoggingClass({ appName: 'Test App' })
      expect(logger.logger).toBeDefined()
    })

    it('should use winston logger', () => {
      logger = new ApiLoggingClass({ appName: 'Test App' })
      expect(logger.logger).toBe(mockWinstonLogger)
    })
  })
})
