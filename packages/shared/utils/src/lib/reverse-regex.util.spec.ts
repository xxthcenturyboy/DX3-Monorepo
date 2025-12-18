import {
  computeRegex,
  getRegexTypesFromString,
  makeRegex,
  type RegexTypes,
  STRING_INDEX_TYPES,
} from './reverse-regex.util'

describe('reverse-regex.util', () => {
  describe('STRING_INDEX_TYPES', () => {
    it('should have correct type constants', () => {
      // Arrange & Act & Assert
      expect(STRING_INDEX_TYPES.ALPHA).toBe('ALPHA')
      expect(STRING_INDEX_TYPES.NUMERIC).toBe('NUMERIC')
      expect(STRING_INDEX_TYPES.SYMBOL).toBe('SYMBOL')
    })
  })

  describe('getRegexTypesFromString', () => {
    it('should parse a simple alphabetic string', () => {
      // Arrange
      const input = 'abc'

      // Act
      const result = getRegexTypesFromString(input)

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        chars: ['a', 'b', 'c'],
        count: 3,
        type: STRING_INDEX_TYPES.ALPHA,
      })
    })

    it('should parse a simple numeric string', () => {
      // Arrange
      const input = '123'

      // Act
      const result = getRegexTypesFromString(input)

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        chars: ['1', '2', '3'],
        count: 3,
        type: STRING_INDEX_TYPES.NUMERIC,
      })
    })

    it('should parse a simple symbol string', () => {
      // Arrange
      const input = '.-_'

      // Act
      const result = getRegexTypesFromString(input)

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        chars: ['.', '-', '_'],
        count: 3,
        type: STRING_INDEX_TYPES.SYMBOL,
      })
    })

    it('should parse mixed alpha and numeric', () => {
      // Arrange
      const input = 'abc123'

      // Act
      const result = getRegexTypesFromString(input)

      // Assert
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        chars: ['a', 'b', 'c'],
        count: 3,
        type: STRING_INDEX_TYPES.ALPHA,
      })
      expect(result[1]).toEqual({
        chars: ['1', '2', '3'],
        count: 3,
        type: STRING_INDEX_TYPES.NUMERIC,
      })
    })

    it('should parse mixed numeric and alpha', () => {
      // Arrange
      const input = '123abc'

      // Act
      const result = getRegexTypesFromString(input)

      // Assert
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        chars: ['1', '2', '3'],
        count: 3,
        type: STRING_INDEX_TYPES.NUMERIC,
      })
      expect(result[1]).toEqual({
        chars: ['a', 'b', 'c'],
        count: 3,
        type: STRING_INDEX_TYPES.ALPHA,
      })
    })

    it('should parse alpha with symbols', () => {
      // Arrange
      const input = 'abc_def'

      // Act
      const result = getRegexTypesFromString(input)

      // Assert
      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({
        chars: ['a', 'b', 'c'],
        count: 3,
        type: STRING_INDEX_TYPES.ALPHA,
      })
      expect(result[1]).toEqual({
        chars: ['_'],
        count: 1,
        type: STRING_INDEX_TYPES.SYMBOL,
      })
      expect(result[2]).toEqual({
        chars: ['d', 'e', 'f'],
        count: 3,
        type: STRING_INDEX_TYPES.ALPHA,
      })
    })

    it('should parse email-like pattern', () => {
      // Arrange
      const input = 'user123@example.com'

      // Act
      const result = getRegexTypesFromString(input)

      // Assert
      expect(result.length).toBeGreaterThan(0)
      expect(result[0].type).toBe(STRING_INDEX_TYPES.ALPHA)
      expect(result[0].chars).toEqual(['u', 's', 'e', 'r'])
    })

    it('should parse complex patterns with multiple segments', () => {
      // Arrange
      const input = 'test.123_value'

      // Act
      const result = getRegexTypesFromString(input)

      // Assert
      expect(result).toHaveLength(5)
      expect(result[0].type).toBe(STRING_INDEX_TYPES.ALPHA)
      expect(result[1].type).toBe(STRING_INDEX_TYPES.SYMBOL)
      expect(result[2].type).toBe(STRING_INDEX_TYPES.NUMERIC)
      expect(result[3].type).toBe(STRING_INDEX_TYPES.SYMBOL)
      expect(result[4].type).toBe(STRING_INDEX_TYPES.ALPHA)
    })

    it('should handle single character', () => {
      // Arrange & Act & Assert
      expect(getRegexTypesFromString('a')).toHaveLength(1)
      expect(getRegexTypesFromString('5')).toHaveLength(1)
      expect(getRegexTypesFromString('.')).toHaveLength(1)
      expect(getRegexTypesFromString('_')).toHaveLength(1)
    })

    it('should recognize hyphen as a symbol in parsing', () => {
      // Arrange
      const input = 'a-b'

      // Act
      const result = getRegexTypesFromString(input)

      // Assert
      // Hyphen IS recognized as a symbol during parsing
      expect(result).toHaveLength(3)
      expect(result[1]).toEqual({
        chars: ['-'],
        count: 1,
        type: STRING_INDEX_TYPES.SYMBOL,
      })

      // However, the generated regex pattern [.-_] won't actually match it
      // due to the ASCII range quirk (this is tested separately)
    })

    it('should handle consecutive symbols', () => {
      // Arrange
      const input = 'test___value'

      // Act
      const result = getRegexTypesFromString(input)

      // Assert
      expect(result).toHaveLength(3)
      expect(result[1]).toEqual({
        chars: ['_', '_', '_'],
        count: 3,
        type: STRING_INDEX_TYPES.SYMBOL,
      })
    })

    it('should handle mixed case letters', () => {
      // Arrange
      const input = 'AbCdEf'

      // Act
      const result = getRegexTypesFromString(input)

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        chars: ['A', 'b', 'C', 'd', 'E', 'f'],
        count: 6,
        type: STRING_INDEX_TYPES.ALPHA,
      })
    })
  })

  describe('makeRegex', () => {
    it('should create regex for alphabetic segment', () => {
      // Arrange
      const data: RegexTypes[] = [
        {
          chars: ['a', 'b', 'c'],
          count: 3,
          type: STRING_INDEX_TYPES.ALPHA,
        },
      ]

      // Act
      const result = makeRegex(data)

      // Assert
      expect(result).toBe('^[a-zA-Z]{3}$')
    })

    it('should create regex for numeric segment', () => {
      // Arrange
      const data: RegexTypes[] = [
        {
          chars: ['1', '2', '3'],
          count: 3,
          type: STRING_INDEX_TYPES.NUMERIC,
        },
      ]

      // Act
      const result = makeRegex(data)

      // Assert
      expect(result).toBe('^[0-9]{3}$')
    })

    it('should create regex for symbol segment', () => {
      // Arrange
      const data: RegexTypes[] = [
        {
          chars: ['-', '.', '_'],
          count: 3,
          type: STRING_INDEX_TYPES.SYMBOL,
        },
      ]

      // Act
      const result = makeRegex(data)

      // Assert
      expect(result).toBe('^[.-_]{3}$')
    })

    it('should create regex for multiple segments', () => {
      // Arrange
      const data: RegexTypes[] = [
        {
          chars: ['a', 'b', 'c'],
          count: 3,
          type: STRING_INDEX_TYPES.ALPHA,
        },
        {
          chars: ['1', '2', '3'],
          count: 3,
          type: STRING_INDEX_TYPES.NUMERIC,
        },
      ]

      // Act
      const result = makeRegex(data)

      // Assert
      expect(result).toBe('^[a-zA-Z]{3}[0-9]{3}$')
    })

    it('should create regex for complex pattern', () => {
      // Arrange
      const data: RegexTypes[] = [
        {
          chars: ['t', 'e', 's', 't'],
          count: 4,
          type: STRING_INDEX_TYPES.ALPHA,
        },
        {
          chars: ['_'],
          count: 1,
          type: STRING_INDEX_TYPES.SYMBOL,
        },
        {
          chars: ['1', '2', '3'],
          count: 3,
          type: STRING_INDEX_TYPES.NUMERIC,
        },
      ]

      // Act
      const result = makeRegex(data)

      // Assert
      expect(result).toBe('^[a-zA-Z]{4}[.-_]{1}[0-9]{3}$')
    })

    it('should handle empty array', () => {
      // Arrange
      const data: RegexTypes[] = []

      // Act
      const result = makeRegex(data)

      // Assert
      expect(result).toBe('^$')
    })

    it('should handle single character segments', () => {
      // Arrange
      const data: RegexTypes[] = [
        {
          chars: ['a'],
          count: 1,
          type: STRING_INDEX_TYPES.ALPHA,
        },
        {
          chars: ['5'],
          count: 1,
          type: STRING_INDEX_TYPES.NUMERIC,
        },
      ]

      // Act
      const result = makeRegex(data)

      // Assert
      expect(result).toBe('^[a-zA-Z]{1}[0-9]{1}$')
    })
  })

  describe('computeRegex', () => {
    it('should compute regex for simple alphabetic string', () => {
      // Arrange
      const input = 'test'

      // Act
      const result = computeRegex(input)

      // Assert
      expect(result).toBe('^[a-zA-Z]{4}$')

      // Verify the regex works
      const regex = new RegExp(result)
      expect(regex.test('test')).toBe(true)
      expect(regex.test('abcd')).toBe(true)
      expect(regex.test('TEST')).toBe(true)
      expect(regex.test('test1')).toBe(false)
      expect(regex.test('tes')).toBe(false)
    })

    it('should compute regex for simple numeric string', () => {
      // Arrange
      const input = '12345'

      // Act
      const result = computeRegex(input)

      // Assert
      expect(result).toBe('^[0-9]{5}$')

      // Verify the regex works
      const regex = new RegExp(result)
      expect(regex.test('12345')).toBe(true)
      expect(regex.test('67890')).toBe(true)
      expect(regex.test('1234')).toBe(false)
      expect(regex.test('123456')).toBe(false)
    })

    it('should compute regex for mixed alphanumeric', () => {
      // Arrange
      const input = 'user123'

      // Act
      const result = computeRegex(input)

      // Assert
      expect(result).toBe('^[a-zA-Z]{4}[0-9]{3}$')

      // Verify the regex works
      const regex = new RegExp(result)
      expect(regex.test('user123')).toBe(true)
      expect(regex.test('abcd456')).toBe(true)
      expect(regex.test('TEST789')).toBe(true)
      expect(regex.test('user12')).toBe(false)
      expect(regex.test('123user')).toBe(false)
    })

    it('should handle email-like pattern (with limitations)', () => {
      // Arrange
      // Note: @ is treated as ALPHA since it's not in the SYMBOL_PATTERN (.-_)
      // The utility only recognizes '.', '-', and '_' as symbols
      const input = 'test@example.com'

      // Act
      const result = computeRegex(input)

      // Assert
      expect(result).toContain('[a-zA-Z]')
      expect(result).toContain('[.-_]')

      // @ is treated as alphabetic, so test@example becomes one 12-char alpha group
      expect(result).toBe('^[a-zA-Z]{12}[.-_]{1}[a-zA-Z]{3}$')

      const regex = new RegExp(result)
      // This demonstrates the limitation: @ is not recognized as a distinct symbol
      expect(regex.test('testAexample.com')).toBe(true) // @ replaced with 'A'
      expect(regex.test('abcdXdefghij.xyz')).toBe(true) // Similar structure with 12 alpha + dot + 3 alpha
    })

    it('should compute regex for symbol-separated pattern', () => {
      // Arrange
      // Note: Using underscore which works reliably
      // The [.-_] pattern has a quirk where hyphen doesn't match due to ASCII ordering
      const input = 'test_123_value'

      // Act
      const result = computeRegex(input)

      // Assert
      // Verify the regex pattern structure
      expect(result).toBe('^[a-zA-Z]{4}[.-_]{1}[0-9]{3}[.-_]{1}[a-zA-Z]{5}$')

      // Test pattern matching
      const regex = new RegExp(result)

      // The original pattern should match itself
      expect(regex.test(input)).toBe(true)

      // Should match similar patterns with same structure (4 alpha, symbol, 3 num, symbol, 5 alpha)
      // Using period and underscore which work with [.-_] pattern
      expect(regex.test('abcd_456_hello')).toBe(true)
      expect(regex.test('wxyz.789.world')).toBe(true)
      expect(regex.test('TEST_111_VALUE')).toBe(true)

      // Should not match different structures
      expect(regex.test('test_12_value')).toBe(false) // wrong number count (2 vs 3)
      expect(regex.test('test_123_val')).toBe(false) // wrong alpha count (3 vs 5)
      expect(regex.test('te_123_value')).toBe(false) // wrong first alpha count (2 vs 4)
    })

    it('should compute regex for filename pattern', () => {
      // Arrange
      const input = 'document_v1.pdf'

      // Act
      const result = computeRegex(input)

      // Assert
      const regex = new RegExp(result)
      expect(regex.test('document_v1.pdf')).toBe(true)
      expect(regex.test('filename_v2.doc')).toBe(true)
    })

    it('should compute regex for single character', () => {
      // Arrange & Act & Assert
      expect(computeRegex('a')).toBe('^[a-zA-Z]{1}$')
      expect(computeRegex('5')).toBe('^[0-9]{1}$')
      expect(computeRegex('-')).toBe('^[.-_]{1}$')
    })

    it('should handle consecutive same-type characters', () => {
      // Arrange
      const input = 'aaaaaa'

      // Act
      const result = computeRegex(input)

      // Assert
      expect(result).toBe('^[a-zA-Z]{6}$')

      const regex = new RegExp(result)
      expect(regex.test('aaaaaa')).toBe(true)
      expect(regex.test('bbbbbb')).toBe(true)
      expect(regex.test('ZZZZZZ')).toBe(true)
    })

    it('should handle alternating patterns', () => {
      // Arrange
      const input = 'a1b2c3'

      // Act
      const result = computeRegex(input)

      // Assert
      expect(result).toBe('^[a-zA-Z]{1}[0-9]{1}[a-zA-Z]{1}[0-9]{1}[a-zA-Z]{1}[0-9]{1}$')

      const regex = new RegExp(result)
      expect(regex.test('a1b2c3')).toBe(true)
      expect(regex.test('x5y9z2')).toBe(true)
      expect(regex.test('a12b2c3')).toBe(false)
    })

    it('should compute regex that matches supported patterns', () => {
      // Arrange - patterns using supported symbols (. and _ work reliably)
      // Note: Avoiding hyphen due to [.-_] character class quirk

      // Pattern 1: user_name.test (4 alpha, symbol, 4 alpha, symbol, 4 alpha)
      const pattern1 = 'user_name.test'
      const regex1 = new RegExp(computeRegex(pattern1))
      expect(regex1.test(pattern1)).toBe(true)
      expect(regex1.test('abcd_efgh.ijkl')).toBe(true)

      // Pattern 2: file_name_123.txt (4 alpha, sym, 4 alpha, sym, 3 num, sym, 3 alpha)
      const pattern2 = 'file_name_123.txt'
      const regex2 = new RegExp(computeRegex(pattern2))
      expect(regex2.test(pattern2)).toBe(true)
      expect(regex2.test('data_item_456.doc')).toBe(true)

      // Pattern 3: test.123_value (4 alpha, sym, 3 num, sym, 5 alpha)
      const pattern3 = 'test.123_value'
      const regex3 = new RegExp(computeRegex(pattern3))
      expect(regex3.test(pattern3)).toBe(true)
      expect(regex3.test('prod.999_final')).toBe(true)
    })

    it('should create regex that differentiates similar patterns', () => {
      // Arrange
      const pattern1 = 'abc123'
      const pattern2 = '123abc'

      // Act
      const regex1 = new RegExp(computeRegex(pattern1))
      const regex2 = new RegExp(computeRegex(pattern2))

      // Assert
      expect(regex1.test('abc123')).toBe(true)
      expect(regex1.test('123abc')).toBe(false)

      expect(regex2.test('123abc')).toBe(true)
      expect(regex2.test('abc123')).toBe(false)
    })

    it('should only recognize period, hyphen, and underscore as symbols', () => {
      // Arrange & Act
      const withPeriod = computeRegex('test.value')
      const withHyphen = computeRegex('test-value')
      const withUnderscore = computeRegex('test_value')
      const withAt = computeRegex('test@value') // @ treated as alpha
      const withHash = computeRegex('test#value') // # treated as alpha

      // Assert
      // Supported symbols create proper symbol group
      expect(withPeriod).toContain('[.-_]')
      expect(withHyphen).toContain('[.-_]')
      expect(withUnderscore).toContain('[.-_]')

      // Unsupported symbols are treated as alphabetic
      expect(withAt).toBe('^[a-zA-Z]{10}$') // 'test@value' = 10 alpha chars
      expect(withHash).toBe('^[a-zA-Z]{10}$') // 'test#value' = 10 alpha chars
    })

    it('should handle regex character class quirk with hyphen', () => {
      // Arrange
      // KNOWN ISSUE: The pattern [.-_] creates a range from . (ASCII 46) to _ (ASCII 95)
      // Hyphen - (ASCII 45) is BEFORE period, so it doesn't actually match [.-_]!
      const withHyphen = 'test-value'

      // Act
      const result = computeRegex(withHyphen)
      const regex = new RegExp(result)

      // Assert
      // The pattern generates [.-_] but hyphen doesn't match it due to ASCII ordering
      expect(result).toBe('^[a-zA-Z]{4}[.-_]{1}[a-zA-Z]{5}$')

      // This demonstrates the quirk: the hyphen in the original string
      // doesn't actually match the generated [.-_] pattern
      expect(regex.test('test-value')).toBe(false) // hyphen doesn't match!
      expect(regex.test('test.value')).toBe(true) // period matches
      expect(regex.test('test_value')).toBe(true) // underscore matches

      // The [.-_] actually matches ASCII 46-95 which includes many chars
      expect(regex.test('test:value')).toBe(true) // : is in range
      expect(regex.test('testAvalue')).toBe(true) // A is in range
      expect(regex.test('test5value')).toBe(true) // 5 is in range
    })
  })
})
