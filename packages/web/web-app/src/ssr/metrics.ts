/**
 * SSR Metrics Utility
 *
 * Lightweight metrics collection for SSR monitoring.
 * Tracks performance, errors, and resource usage.
 * Can be upgraded to production tools (DataDog, Prometheus, etc.) later.
 */

type MetricTags = Record<string, string | number | boolean>

interface HistogramEntry {
  tags: MetricTags
  timestamp: number
  value: number
}

interface CounterEntry {
  count: number
  tags: MetricTags
}

class SsrMetrics {
  private counters: Map<string, CounterEntry[]> = new Map()
  private histograms: Map<string, HistogramEntry[]> = new Map()
  private gauges: Map<string, { tags: MetricTags; timestamp: number; value: number }[]> = new Map()
  private startTime: number = Date.now()

  /**
   * Increment a counter metric
   */
  public increment(name: string, tags: MetricTags = {}): void {
    let entries = this.counters.get(name)
    if (!entries) {
      entries = []
      this.counters.set(name, entries)
    }
    const existing = entries.find((e) => this.tagsMatch(e.tags, tags))

    if (existing) {
      existing.count++
    } else {
      entries.push({ count: 1, tags })
    }
  }

  /**
   * Record a histogram value (for timing, sizes, etc.)
   */
  public histogram(name: string, value: number, tags: MetricTags = {}): void {
    let entries = this.histograms.get(name)
    if (!entries) {
      entries = []
      this.histograms.set(name, entries)
    }

    entries.push({
      tags,
      timestamp: Date.now(),
      value,
    })

    // Keep only last 1000 entries per metric to prevent memory leak
    if (entries.length > 1000) {
      entries.shift()
    }
  }

  /**
   * Set a gauge value (for current state metrics like memory usage)
   */
  public gauge(name: string, value: number, tags: MetricTags = {}): void {
    let entries = this.gauges.get(name)
    if (!entries) {
      entries = []
      this.gauges.set(name, entries)
    }

    entries.push({
      tags,
      timestamp: Date.now(),
      value,
    })

    // Keep only last 100 gauge values per metric
    if (entries.length > 100) {
      entries.shift()
    }
  }

  /**
   * Get summary statistics for a histogram
   */
  private getHistogramStats(entries: HistogramEntry[]): {
    avg: number
    count: number
    max: number
    min: number
    p50: number
    p95: number
    p99: number
  } {
    if (entries.length === 0) {
      return { avg: 0, count: 0, max: 0, min: 0, p50: 0, p95: 0, p99: 0 }
    }

    const values = entries.map((e) => e.value).sort((a, b) => a - b)
    const sum = values.reduce((a, b) => a + b, 0)

    return {
      avg: sum / values.length,
      count: values.length,
      max: values[values.length - 1],
      min: values[0],
      p50: this.percentile(values, 50),
      p95: this.percentile(values, 95),
      p99: this.percentile(values, 99),
    }
  }

  /**
   * Calculate percentile from sorted array
   */
  private percentile(sortedValues: number[], p: number): number {
    const index = Math.ceil((p / 100) * sortedValues.length) - 1
    return sortedValues[Math.max(0, index)]
  }

  /**
   * Check if two tag objects match
   */
  private tagsMatch(a: MetricTags, b: MetricTags): boolean {
    const aKeys = Object.keys(a).sort()
    const bKeys = Object.keys(b).sort()

    if (aKeys.length !== bKeys.length) return false
    if (aKeys.join(',') !== bKeys.join(',')) return false

    return aKeys.every((key) => a[key] === b[key])
  }

  /**
   * Format tags for display
   */
  private formatTags(tags: MetricTags): string {
    if (Object.keys(tags).length === 0) return ''
    return Object.entries(tags)
      .map(([k, v]) => `${k}=${v}`)
      .join(', ')
  }

  /**
   * Get current memory usage
   */
  public getMemoryUsage(): NodeJS.MemoryUsage {
    return process.memoryUsage()
  }

  /**
   * Get uptime in seconds
   */
  public getUptime(): number {
    return (Date.now() - this.startTime) / 1000
  }

  /**
   * Log metrics summary to console
   */
  public logSummary(): void {
    const uptime = this.getUptime()
    const memory = this.getMemoryUsage()

    console.log('\n' + '='.repeat(60))
    console.log('SSR METRICS SUMMARY')
    console.log('='.repeat(60))
    console.log(`Uptime: ${Math.floor(uptime)}s`)
    console.log(
      `Memory: ${(memory.heapUsed / 1024 / 1024).toFixed(1)}MB / ${(memory.heapTotal / 1024 / 1024).toFixed(1)}MB`,
    )
    console.log('')

    // Counters
    if (this.counters.size > 0) {
      console.log('COUNTERS:')
      for (const [name, entries] of this.counters) {
        for (const entry of entries) {
          const tags = this.formatTags(entry.tags)
          console.log(`  ${name}${tags ? ` [${tags}]` : ''}: ${entry.count}`)
        }
      }
      console.log('')
    }

    // Histograms
    if (this.histograms.size > 0) {
      console.log('HISTOGRAMS (timing/size metrics):')
      for (const [name, entries] of this.histograms) {
        // Group by tags
        const grouped = new Map<string, HistogramEntry[]>()
        for (const entry of entries) {
          const tagKey = this.formatTags(entry.tags)
          let tagEntries = grouped.get(tagKey)
          if (!tagEntries) {
            tagEntries = []
            grouped.set(tagKey, tagEntries)
          }
          tagEntries.push(entry)
        }

        for (const [tagKey, tagEntries] of grouped) {
          const stats = this.getHistogramStats(tagEntries)
          console.log(
            `  ${name}${tagKey ? ` [${tagKey}]` : ''}: ` +
              `avg=${stats.avg.toFixed(1)}ms, ` +
              `p50=${stats.p50.toFixed(1)}ms, ` +
              `p95=${stats.p95.toFixed(1)}ms, ` +
              `p99=${stats.p99.toFixed(1)}ms, ` +
              `count=${stats.count}`,
          )
        }
      }
      console.log('')
    }

    // Gauges (show latest value per tag)
    if (this.gauges.size > 0) {
      console.log('GAUGES (current state):')
      for (const [name, entries] of this.gauges) {
        const latest = entries[entries.length - 1]
        if (latest) {
          const tags = this.formatTags(latest.tags)
          const unit = name.includes('memory') ? 'MB' : ''
          const value = name.includes('memory')
            ? (latest.value / 1024 / 1024).toFixed(1)
            : latest.value.toFixed(2)
          console.log(`  ${name}${tags ? ` [${tags}]` : ''}: ${value}${unit}`)
        }
      }
      console.log('')
    }

    console.log('='.repeat(60) + '\n')
  }

  /**
   * Reset all metrics (useful for testing)
   */
  public reset(): void {
    this.counters.clear()
    this.histograms.clear()
    this.gauges.clear()
  }

  /**
   * Get raw metrics data (for external tools integration)
   */
  public getMetrics() {
    return {
      counters: Array.from(this.counters.entries()).map(([name, entries]) => ({
        entries,
        name,
      })),
      gauges: Array.from(this.gauges.entries()).map(([name, entries]) => ({
        entries,
        name,
      })),
      histograms: Array.from(this.histograms.entries()).map(([name, entries]) => ({
        entries,
        name,
        stats: this.getHistogramStats(entries),
      })),
    }
  }
}

// Export singleton instance
export const metrics = new SsrMetrics()

// Export helper for timing operations
export function measureTime<T>(name: string, tags: MetricTags, fn: () => T): T {
  const start = Date.now()
  try {
    const result = fn()
    metrics.histogram(name, Date.now() - start, tags)
    return result
  } catch (error) {
    metrics.histogram(name, Date.now() - start, { ...tags, error: true })
    throw error
  }
}

// Export helper for async timing operations
export async function measureTimeAsync<T>(
  name: string,
  tags: MetricTags,
  fn: () => Promise<T>,
): Promise<T> {
  const start = Date.now()
  try {
    const result = await fn()
    metrics.histogram(name, Date.now() - start, tags)
    return result
  } catch (error) {
    metrics.histogram(name, Date.now() - start, { ...tags, error: true })
    throw error
  }
}
