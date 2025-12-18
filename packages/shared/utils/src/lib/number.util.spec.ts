import { formatBytes, formatNumThouSeparator, isNumber, randomId } from './number.util'

describe('isNumber', () => {
  it('should return true when passed a valid number', () => {
    // Arrange & Act & Assert
    expect(isNumber(0)).toBe(true)
    expect(isNumber(1)).toBe(true)
    expect(isNumber(-1)).toBe(true)
    expect(isNumber(2e64)).toBe(true)
    expect(isNumber(3.14)).toBe(true)
    expect(isNumber(-273.15)).toBe(true)
  })

  it('should return false when passed a string', () => {
    // Arrange & Act & Assert
    expect(isNumber('1')).toBe(false)
    expect(isNumber('hello')).toBe(false)
    expect(isNumber('')).toBe(false)
  })

  it('should return false when passed invalid numbers', () => {
    // Arrange & Act & Assert
    expect(isNumber(Infinity)).toBe(false)
    expect(isNumber(-Infinity)).toBe(false)
    expect(isNumber(NaN)).toBe(false)
  })

  it('should return false when passed undefined or null', () => {
    // Arrange & Act & Assert
    expect(isNumber(undefined)).toBe(false)
    expect(isNumber(null as any)).toBe(false)
  })
})

describe('formatBytes', () => {
  it('should format 0 bytes correctly', () => {
    // Arrange & Act
    const result = formatBytes(0)

    // Assert
    expect(result).toBe('0 Bytes')
  })

  it('should format bytes correctly', () => {
    // Arrange & Act & Assert
    expect(formatBytes(100)).toBe('100 Bytes')
    expect(formatBytes(500)).toBe('500 Bytes')
    expect(formatBytes(1023)).toBe('1023 Bytes')
  })

  it('should format kilobytes correctly', () => {
    // Arrange & Act & Assert
    expect(formatBytes(1024)).toBe('1 KB')
    expect(formatBytes(1536)).toBe('1.5 KB')
    expect(formatBytes(5120)).toBe('5 KB')
  })

  it('should format megabytes correctly', () => {
    // Arrange & Act & Assert
    expect(formatBytes(1048576)).toBe('1 MB') // 1024 * 1024
    expect(formatBytes(5242880)).toBe('5 MB') // 5 * 1024 * 1024
    expect(formatBytes(10485760)).toBe('10 MB')
  })

  it('should format gigabytes correctly', () => {
    // Arrange & Act & Assert
    expect(formatBytes(1073741824)).toBe('1 GB') // 1024^3
    expect(formatBytes(2147483648)).toBe('2 GB')
  })

  it('should format terabytes correctly', () => {
    // Arrange & Act & Assert
    expect(formatBytes(1099511627776)).toBe('1 TB') // 1024^4
  })

  it('should respect custom decimal places', () => {
    // Arrange
    const bytes = 1536 // 1.5 KB

    // Act & Assert
    expect(formatBytes(bytes, 0)).toBe('2 KB')
    expect(formatBytes(bytes, 1)).toBe('1.5 KB')
    expect(formatBytes(bytes, 2)).toBe('1.5 KB')
    expect(formatBytes(bytes, 3)).toBe('1.5 KB')
  })

  it('should handle negative decimal places', () => {
    // Arrange
    const bytes = 1536

    // Act
    const result = formatBytes(bytes, -1)

    // Assert
    expect(result).toBe('2 KB') // Should default to 0 decimals
  })

  it('should format fractional bytes correctly', () => {
    // Arrange & Act & Assert
    expect(formatBytes(1536, 2)).toBe('1.5 KB')
    expect(formatBytes(1638, 2)).toBe('1.6 KB')
    expect(formatBytes(10000000, 2)).toBe('9.54 MB')
  })
})

describe('randomId', () => {
  it('should return a number', () => {
    // Arrange & Act
    const id = randomId()

    // Assert
    expect(id).toBeDefined()
    expect(typeof id).toBe('number')
  })

  it('should return a positive integer', () => {
    // Arrange & Act
    const id = randomId()

    // Assert
    expect(id).toBeGreaterThan(0)
    expect(Number.isInteger(id)).toBe(true)
  })

  it('should generate different IDs on multiple calls', () => {
    // Arrange & Act
    const id1 = randomId()
    const id2 = randomId()
    const id3 = randomId()

    // Assert
    // While theoretically they could be the same, it's extremely unlikely
    const allDifferent = id1 !== id2 || id2 !== id3 || id1 !== id3
    expect(allDifferent).toBe(true)
  })

  it('should generate valid numeric IDs', () => {
    // Arrange & Act
    const ids = Array.from({ length: 100 }, () => randomId())

    // Assert
    ids.forEach((id) => {
      expect(typeof id).toBe('number')
      expect(id).toBeGreaterThan(0)
      expect(Number.isFinite(id)).toBe(true)
    })
  })
})

describe('formatNumThouSeparator', () => {
  it('should format small numbers without separators', () => {
    // Arrange & Act & Assert
    expect(formatNumThouSeparator(0)).toBe('0')
    expect(formatNumThouSeparator(1)).toBe('1')
    expect(formatNumThouSeparator(99)).toBe('99')
    expect(formatNumThouSeparator(999)).toBe('999')
  })

  it('should format thousands with comma separator', () => {
    // Arrange & Act & Assert
    expect(formatNumThouSeparator(1000)).toBe('1,000')
    expect(formatNumThouSeparator(5000)).toBe('5,000')
    expect(formatNumThouSeparator(9999)).toBe('9,999')
  })

  it('should format tens of thousands correctly', () => {
    // Arrange & Act & Assert
    expect(formatNumThouSeparator(10000)).toBe('10,000')
    expect(formatNumThouSeparator(50000)).toBe('50,000')
    expect(formatNumThouSeparator(99999)).toBe('99,999')
  })

  it('should format hundreds of thousands correctly', () => {
    // Arrange & Act & Assert
    expect(formatNumThouSeparator(100000)).toBe('100,000')
    expect(formatNumThouSeparator(500000)).toBe('500,000')
    expect(formatNumThouSeparator(999999)).toBe('999,999')
  })

  it('should format millions correctly', () => {
    // Arrange & Act & Assert
    expect(formatNumThouSeparator(1000000)).toBe('1,000,000')
    expect(formatNumThouSeparator(5000000)).toBe('5,000,000')
    expect(formatNumThouSeparator(12345678)).toBe('12,345,678')
  })

  it('should format billions correctly', () => {
    // Arrange & Act & Assert
    expect(formatNumThouSeparator(1000000000)).toBe('1,000,000,000')
    expect(formatNumThouSeparator(1234567890)).toBe('1,234,567,890')
  })

  it('should handle negative numbers', () => {
    // Arrange & Act & Assert
    expect(formatNumThouSeparator(-1000)).toBe('-1,000')
    expect(formatNumThouSeparator(-10000)).toBe('-10,000')
    expect(formatNumThouSeparator(-1234567)).toBe('-1,234,567')
  })

  it('should handle decimal numbers', () => {
    // Arrange & Act & Assert
    expect(formatNumThouSeparator(1000.5)).toBe('1,000.5')
    expect(formatNumThouSeparator(12345.67)).toBe('12,345.67')
  })
})
