import { debounce } from './debounce'

describe('debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should debounce function calls', () => {
    const mockFn = jest.fn()
    const debouncedFn = debounce(mockFn, 100)

    debouncedFn()
    debouncedFn()
    debouncedFn()

    expect(mockFn).not.toHaveBeenCalled()

    jest.advanceTimersByTime(100)

    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should call function with the last provided arguments', () => {
    const mockFn = jest.fn()
    const debouncedFn = debounce(mockFn, 100)

    debouncedFn('first')
    debouncedFn('second')
    debouncedFn('third')

    jest.advanceTimersByTime(100)

    expect(mockFn).toHaveBeenCalledWith('third')
  })

  it('should use default wait time of 50ms when not specified', () => {
    const mockFn = jest.fn()
    const debouncedFn = debounce(mockFn)

    debouncedFn()

    jest.advanceTimersByTime(49)
    expect(mockFn).not.toHaveBeenCalled()

    jest.advanceTimersByTime(1)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should handle multiple arguments', () => {
    const mockFn = jest.fn()
    const debouncedFn = debounce(mockFn, 100)

    debouncedFn('arg1', 'arg2', 'arg3')

    jest.advanceTimersByTime(100)

    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3')
  })

  it('should reset the timer on each call', () => {
    const mockFn = jest.fn()
    const debouncedFn = debounce(mockFn, 100)

    debouncedFn()
    jest.advanceTimersByTime(50)
    debouncedFn()
    jest.advanceTimersByTime(50)
    debouncedFn()
    jest.advanceTimersByTime(50)

    expect(mockFn).not.toHaveBeenCalled()

    jest.advanceTimersByTime(50)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should execute immediately when isImmediate is true', () => {
    const mockFn = jest.fn()
    const debouncedFn = debounce(mockFn, 100, { isImmediate: true })

    debouncedFn()

    expect(mockFn).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(100)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should not execute immediately on subsequent calls when isImmediate is true', () => {
    const mockFn = jest.fn()
    const debouncedFn = debounce(mockFn, 100, { isImmediate: true })

    debouncedFn()
    expect(mockFn).toHaveBeenCalledTimes(1)

    debouncedFn()
    debouncedFn()
    expect(mockFn).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(100)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should execute immediately again after wait period with isImmediate', () => {
    const mockFn = jest.fn()
    const debouncedFn = debounce(mockFn, 100, { isImmediate: true })

    debouncedFn()
    expect(mockFn).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(100)

    debouncedFn()
    expect(mockFn).toHaveBeenCalledTimes(2)
  })

  it('should cancel pending function calls', () => {
    const mockFn = jest.fn()
    const debouncedFn = debounce(mockFn, 100)

    debouncedFn()
    debouncedFn()

    debouncedFn.cancel()

    jest.advanceTimersByTime(100)

    expect(mockFn).not.toHaveBeenCalled()
  })

  it('should allow new calls after cancel', () => {
    const mockFn = jest.fn()
    const debouncedFn = debounce(mockFn, 100)

    debouncedFn()
    debouncedFn.cancel()

    jest.advanceTimersByTime(100)
    expect(mockFn).not.toHaveBeenCalled()

    debouncedFn()
    jest.advanceTimersByTime(100)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should handle cancel when no pending calls exist', () => {
    const mockFn = jest.fn()
    const debouncedFn = debounce(mockFn, 100)

    expect(() => debouncedFn.cancel()).not.toThrow()
  })

  it('should preserve this context', () => {
    const obj = {
      method: jest.fn(function (this: any) {
        return this.value
      }),
      value: 'test',
    }

    const debouncedMethod = debounce(obj.method, 100)
    debouncedMethod.call(obj)

    jest.advanceTimersByTime(100)

    expect(obj.method).toHaveBeenCalled()
  })

  it('should handle rapid successive calls', () => {
    const mockFn = jest.fn()
    const debouncedFn = debounce(mockFn, 100)

    for (let i = 0; i < 100; i++) {
      debouncedFn(i)
    }

    jest.advanceTimersByTime(100)

    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenCalledWith(99)
  })

  it('should handle zero wait time', () => {
    const mockFn = jest.fn()
    const debouncedFn = debounce(mockFn, 0)

    debouncedFn()

    expect(mockFn).not.toHaveBeenCalled()

    jest.advanceTimersByTime(0)

    expect(mockFn).toHaveBeenCalledTimes(1)
  })
})
