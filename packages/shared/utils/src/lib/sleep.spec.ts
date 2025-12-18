import { sleep } from './sleep'

describe('sleep', () => {
  afterEach(() => {
    jest.useRealTimers()
  })

  test('returns a Promise that resolves after the given milliseconds (fake timers)', async () => {
    jest.useFakeTimers()
    let resolved = false
    const p = sleep(100)
    p.then(() => {
      resolved = true
    })

    jest.advanceTimersByTime(50)
    expect(resolved).toBe(false)

    jest.advanceTimersByTime(50)
    await p
    expect(resolved).toBe(true)
  })

  test('resolves to undefined for 0ms (fake timers)', async () => {
    jest.useFakeTimers()
    const p = sleep(0)
    // flush timers scheduled with 0ms
    jest.runAllTimers()
    await expect(p).resolves.toBeUndefined()
  })

  test('works with real timers (integration-style)', async () => {
    // Use real timers to ensure Promise resolves in real time
    jest.useRealTimers()
    const start = Date.now()
    await sleep(10)
    const elapsed = Date.now() - start
    expect(elapsed).toBeGreaterThanOrEqual(0)
  })
})
