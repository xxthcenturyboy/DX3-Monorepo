jest.mock('winston', () => ({
  createLogger: jest.fn(() => ({ error: jest.fn() })),
}))

import fs from 'node:fs'
import * as winston from 'winston'

import { emptyDirectory, readFileLocal } from './file-system.util'

describe('file-system.util', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const getLastLogger = () => {
    const mock = winston.createLogger as jest.Mock
    const results = mock.mock.results
    return results.length ? results[results.length - 1].value : null
  }

  describe('emptyDirectory', () => {
    test('returns false when path is not a string', () => {
      const rmSpy = jest.spyOn(fs, 'rmSync').mockImplementation(() => {})
      const mkdirSpy = jest.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined)

      const result = (emptyDirectory as any)(null)
      expect(result).toBe(false)

      // createLogger is called at function start
      expect(winston.createLogger).toHaveBeenCalled()
      expect(rmSpy).not.toHaveBeenCalled()
      expect(mkdirSpy).not.toHaveBeenCalled()
    })

    test('removes and recreates directory and returns true on success', () => {
      const rmSpy = jest.spyOn(fs, 'rmSync').mockImplementation(() => {})
      const mkdirSpy = jest.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined)

      const path = '/some/path'
      const result = emptyDirectory(path)
      expect(result).toBe(true)

      expect(rmSpy).toHaveBeenCalledWith(path, { recursive: true })
      expect(mkdirSpy).toHaveBeenCalledWith(path, { recursive: true })

      expect(winston.createLogger).toHaveBeenCalled()
      const logger = getLastLogger()
      expect(logger).not.toBeNull()
      expect(logger.error).not.toHaveBeenCalled()
    })

    test('logs error and returns false when fs.rmSync throws', () => {
      jest.spyOn(fs, 'rmSync').mockImplementation(() => {
        throw new Error('rm-fail')
      })
      const mkdirSpy = jest.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined)

      const path = '/bad/path'
      const result = emptyDirectory(path)
      expect(result).toBe(false)

      expect(mkdirSpy).not.toHaveBeenCalled()

      expect(winston.createLogger).toHaveBeenCalled()
      const logger = getLastLogger()
      expect(logger).not.toBeNull()
      expect(logger.error).toHaveBeenCalled()
      const errArg = logger.error.mock.calls[0][0]
      expect(errArg).toBeInstanceOf(Error)
      expect(errArg.message).toBe('rm-fail')
    })
  })

  describe('readFileLocal', () => {
    test('returns false when path is not a string', () => {
      const readSpy = jest.spyOn(fs, 'readFileSync').mockImplementation(() => Buffer.from(''))
      const result = (readFileLocal as any)(123)
      expect(result).toBe(false)

      expect(winston.createLogger).toHaveBeenCalled()
      expect(readSpy).not.toHaveBeenCalled()
    })

    test('returns file contents as string on success', () => {
      const content = 'hello world'
      const readSpy = jest.spyOn(fs, 'readFileSync').mockImplementation(() => Buffer.from(content))

      const path = '/file.txt'
      const result = readFileLocal(path)
      expect(result).toBe(content)

      expect(readSpy).toHaveBeenCalledWith(path)
      expect(winston.createLogger).toHaveBeenCalled()
      const logger = getLastLogger()
      expect(logger.error).not.toHaveBeenCalled()
    })

    test('logs error and returns false when fs.readFileSync throws', () => {
      jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
        throw new Error('read-fail')
      })

      const path = '/nope'
      const result = readFileLocal(path)
      expect(result).toBe(false)

      expect(winston.createLogger).toHaveBeenCalled()
      const logger = getLastLogger()
      expect(logger.error).toHaveBeenCalled()
      const errArg = logger.error.mock.calls[0][0]
      expect(errArg).toBeInstanceOf(Error)
      expect(errArg.message).toBe('read-fail')
    })
  })
})
