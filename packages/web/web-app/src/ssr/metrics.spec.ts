import { measureTime, measureTimeAsync, metrics } from './metrics'

describe('SsrMetrics', () => {
  beforeEach(() => {
    metrics.reset()
  })

  describe('increment', () => {
    it('should increment a counter once', () => {
      metrics.increment('test.counter')
      const result = metrics.getMetrics()
      const counter = result.counters.find((c) => c.name === 'test.counter')
      expect(counter).toBeDefined()
      expect(counter?.entries[0].count).toBe(1)
    })

    it('should accumulate increments for same tags', () => {
      metrics.increment('test.counter', { env: 'test' })
      metrics.increment('test.counter', { env: 'test' })
      const result = metrics.getMetrics()
      const counter = result.counters.find((c) => c.name === 'test.counter')
      expect(counter?.entries[0].count).toBe(2)
    })

    it('should track different counters separately with different tags', () => {
      metrics.increment('test.counter', { status: '200' })
      metrics.increment('test.counter', { status: '500' })
      const result = metrics.getMetrics()
      const counter = result.counters.find((c) => c.name === 'test.counter')
      expect(counter?.entries).toHaveLength(2)
    })

    it('should work with no tags', () => {
      metrics.increment('simple.counter')
      const result = metrics.getMetrics()
      expect(result.counters.find((c) => c.name === 'simple.counter')).toBeDefined()
    })
  })

  describe('histogram', () => {
    it('should record a histogram entry', () => {
      metrics.histogram('response.time', 150, { route: '/api/health' })
      const result = metrics.getMetrics()
      const hist = result.histograms.find((h) => h.name === 'response.time')
      expect(hist).toBeDefined()
      expect(hist?.entries[0].value).toBe(150)
    })

    it('should compute stats for multiple entries', () => {
      for (let i = 1; i <= 10; i++) {
        metrics.histogram('perf.metric', i * 10)
      }
      const result = metrics.getMetrics()
      const hist = result.histograms.find((h) => h.name === 'perf.metric')
      expect(hist?.stats.count).toBe(10)
      expect(hist?.stats.min).toBe(10)
      expect(hist?.stats.max).toBe(100)
      expect(hist?.stats.avg).toBe(55)
    })
  })

  describe('gauge', () => {
    it('should record a gauge entry', () => {
      metrics.gauge('memory.heap', 1024 * 1024, { unit: 'bytes' })
      const result = metrics.getMetrics()
      const gauge = result.gauges.find((g) => g.name === 'memory.heap')
      expect(gauge).toBeDefined()
      expect(gauge?.entries[0].value).toBe(1024 * 1024)
    })
  })

  describe('getMemoryUsage', () => {
    it('should return memory usage object', () => {
      const mem = metrics.getMemoryUsage()
      expect(mem).toBeDefined()
      expect(typeof mem.heapUsed).toBe('number')
    })
  })

  describe('getUptime', () => {
    it('should return a non-negative uptime', () => {
      const uptime = metrics.getUptime()
      expect(uptime).toBeGreaterThanOrEqual(0)
    })
  })

  describe('logSummary', () => {
    it('should not throw', () => {
      expect(() => metrics.logSummary()).not.toThrow()
    })
  })

  describe('reset', () => {
    it('should clear all metrics', () => {
      metrics.increment('to.clear')
      metrics.reset()
      const result = metrics.getMetrics()
      expect(result.counters).toHaveLength(0)
      expect(result.histograms).toHaveLength(0)
    })
  })

  describe('getMetrics', () => {
    it('should return an object with counters, histograms, and gauges', () => {
      const result = metrics.getMetrics()
      expect(result).toHaveProperty('counters')
      expect(result).toHaveProperty('gauges')
      expect(result).toHaveProperty('histograms')
    })
  })
})

describe('measureTime', () => {
  beforeEach(() => {
    metrics.reset()
  })

  it('should execute the provided function and return its result', () => {
    const result = measureTime('op.time', {}, () => 42)
    expect(result).toBe(42)
  })

  it('should record a histogram metric', () => {
    measureTime('op.time', { route: '/test' }, () => 'value')
    const metricsResult = metrics.getMetrics()
    const hist = metricsResult.histograms.find((h) => h.name === 'op.time')
    expect(hist).toBeDefined()
  })

  it('should rethrow errors from the function', () => {
    expect(() => {
      measureTime('failing.op', {}, () => {
        throw new Error('test error')
      })
    }).toThrow('test error')
  })

  it('should record the metric even when function throws', () => {
    try {
      measureTime('error.op', {}, () => {
        throw new Error('fail')
      })
    } catch {
      // expected
    }
    const metricsResult = metrics.getMetrics()
    const hist = metricsResult.histograms.find((h) => h.name === 'error.op')
    expect(hist).toBeDefined()
  })
})

describe('measureTimeAsync', () => {
  beforeEach(() => {
    metrics.reset()
  })

  it('should execute the async function and return its result', async () => {
    const result = await measureTimeAsync('async.op', {}, async () => 'async-value')
    expect(result).toBe('async-value')
  })

  it('should record a histogram metric for async operations', async () => {
    await measureTimeAsync('async.metric', { route: '/api' }, async () => undefined)
    const metricsResult = metrics.getMetrics()
    const hist = metricsResult.histograms.find((h) => h.name === 'async.metric')
    expect(hist).toBeDefined()
  })

  it('should rethrow async errors', async () => {
    await expect(
      measureTimeAsync('failing.async', {}, async () => {
        throw new Error('async error')
      }),
    ).rejects.toThrow('async error')
  })
})
