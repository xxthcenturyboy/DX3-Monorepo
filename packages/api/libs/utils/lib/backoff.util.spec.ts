jest.mock('exponential-backoff', () => ({ backOff: jest.fn() }))

import { backOff } from 'exponential-backoff'

import { backOffWrapper } from './backoff.util'

describe('backOffWrapper', () => {
  afterEach(() => {
    jest.resetAllMocks()
    jest.restoreAllMocks()
  })

  test('returns the value from backOff when promiseFunc resolves', async () => {
    // make backOff call the provided function and return its result
    ;(backOff as jest.Mock).mockImplementation(async (fn: () => Promise<unknown>, opts: any) => {
      // assert that numOfAttempts was passed through
      expect(opts.numOfAttempts).toBe(3)
      return fn()
    })

    const promiseFunc = jest.fn().mockResolvedValue('OK')
    const result = await backOffWrapper(promiseFunc, 'msg', 3)
    expect(result).toBe('OK')
    expect(promiseFunc).toHaveBeenCalled()
    expect(backOff).toHaveBeenCalled()
  })

  test('calls logger.error inside retry when logger is provided', async () => {
    let capturedRetry: ((error: Error, attemptNumber: number) => void) | undefined
    ;(backOff as jest.Mock).mockImplementation(async (_fn: any, opts: any) => {
      capturedRetry = opts.retry
      // simulate two retry invocations
      if (capturedRetry) {
        capturedRetry(new Error('boom'), 1)
        capturedRetry(new Error('boom2'), 2)
      }
      return 'done'
    })

    const logger = { error: jest.fn() } as any
    const res = await backOffWrapper(() => Promise.resolve('x'), 'failed-op', 2, logger)
    expect(res).toBe('done')

    // Each retry triggers two logger.error calls (message + stack)
    expect(logger.error).toHaveBeenCalledTimes(4)
    expect((logger.error as jest.Mock).mock.calls[0][0]).toContain(
      'Attempt Number 1 error message: failed-op',
    )
    // second logger.error call for the same retry should have a JSON string (stack)
    expect(typeof (logger.error as jest.Mock).mock.calls[1][0]).toBe('string')
  })

  test('falls back to console.error when no logger is provided', async () => {
    let capturedRetry: ((error: Error, attemptNumber: number) => void) | undefined
    ;(backOff as jest.Mock).mockImplementation(async (_fn: any, opts: any) => {
      capturedRetry = opts.retry
      if (capturedRetry) {
        capturedRetry(new Error('consoleBoom'), 1)
      }
      return 'ok'
    })

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    const res = await backOffWrapper(() => Promise.resolve('x'), 'console-msg', 1)
    expect(res).toBe('ok')

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
    const [firstArg, secondArg] = consoleErrorSpy.mock.calls[0]
    expect(firstArg as string).toContain('Attempt Number 1 error message: console-msg')
    expect(typeof secondArg).toBe('string')

    consoleErrorSpy.mockRestore()
  })
})
