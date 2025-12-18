import { Console } from 'node:console'
import { Transform } from 'node:stream'

import { logTable } from './console-table-transformer'

// Mock console.log
const originalConsoleLog = console.log
let consoleOutput: string[] = []

describe('console-table-transformer', () => {
  beforeEach(() => {
    // Capture console.log output
    consoleOutput = []
    console.log = jest.fn((message) => {
      consoleOutput.push(message)
    })
  })

  afterEach(() => {
    // Restore console.log
    console.log = originalConsoleLog
    jest.clearAllMocks()
  })

  describe('logTable', () => {
    it('should be defined', () => {
      expect(logTable).toBeDefined()
    })

    it('should be a function', () => {
      expect(typeof logTable).toBe('function')
    })

    it('should handle empty array', () => {
      logTable([])
      expect(console.log).toHaveBeenCalled()
    })

    it('should handle array with single object', () => {
      const input = [{ age: 30, name: 'John' }]
      logTable(input)
      expect(console.log).toHaveBeenCalled()
      expect(consoleOutput.length).toBeGreaterThan(0)
    })

    it('should handle array with multiple objects', () => {
      const input = [
        { age: 30, name: 'John' },
        { age: 25, name: 'Jane' },
        { age: 35, name: 'Bob' },
      ]
      logTable(input)
      expect(console.log).toHaveBeenCalled()
      expect(consoleOutput.length).toBeGreaterThan(0)
    })

    it('should handle objects with various data types', () => {
      const input = [
        {
          boolean: true,
          null: null,
          number: 123,
          string: 'text',
          undefined: undefined,
        },
      ]
      logTable(input)
      expect(console.log).toHaveBeenCalled()
      expect(consoleOutput.length).toBeGreaterThan(0)
    })

    it('should transform table with box-drawing characters', () => {
      const input = [{ id: 1, name: 'Test' }]
      logTable(input)

      const output = consoleOutput[0]
      expect(typeof output).toBe('string')
      expect(output).toBeDefined()
    })

    it('should replace single quotes with spaces', () => {
      const input = [{ text: "it's" }]
      logTable(input)

      const output = consoleOutput[0]
      // The function replaces ' with space
      expect(output).not.toContain("'")
    })

    it('should handle nested data structures', () => {
      const input = [{ data: { nested: 'value' }, id: 1 }]
      logTable(input)
      expect(console.log).toHaveBeenCalled()
      expect(consoleOutput.length).toBeGreaterThan(0)
    })

    it('should process each row with line breaks', () => {
      const input = [
        { col1: 'a', col2: 'b' },
        { col1: 'c', col2: 'd' },
      ]
      logTable(input)

      const output = consoleOutput[0]
      // Output should contain newlines
      expect(output).toContain('\n')
    })

    it('should use Transform stream for table generation', () => {
      const transformSpy = jest.spyOn(Transform.prototype, 'read')
      const input = [{ test: 'value' }]

      logTable(input)

      expect(transformSpy).toHaveBeenCalled()
      transformSpy.mockRestore()
    })

    it('should use Console with custom stdout', () => {
      const consoleSpy = jest.spyOn(Console.prototype, 'table')
      const input = [{ key: 'value' }]

      logTable(input)

      expect(consoleSpy).toHaveBeenCalledWith(input)
      consoleSpy.mockRestore()
    })

    it('should handle objects with special characters', () => {
      const input = [{ text: '┬├└│' }]
      logTable(input)
      expect(console.log).toHaveBeenCalled()
      expect(consoleOutput.length).toBeGreaterThan(0)
    })

    it('should handle objects with numeric keys', () => {
      const input = [{ '1': 'first', '2': 'second' }]
      logTable(input)
      expect(console.log).toHaveBeenCalled()
    })

    it('should handle objects with mixed property types', () => {
      const input = [
        {
          arr: [1, 2, 3],
          bool: false,
          num: 42,
          obj: { key: 'value' },
          str: 'string',
        },
      ]
      logTable(input)
      expect(console.log).toHaveBeenCalled()
      expect(consoleOutput.length).toBeGreaterThan(0)
    })

    it('should produce string output with newline at end', () => {
      const input = [{ test: 'data' }]
      logTable(input)

      const output = consoleOutput[0]
      expect(output.endsWith('\n')).toBe(true)
    })

    it('should handle array with inconsistent object properties', () => {
      const input = [
        { age: 30, name: 'John' },
        { name: 'Jane' }, // missing age
        { age: 25 }, // missing name
      ]
      logTable(input)
      expect(console.log).toHaveBeenCalled()
      expect(consoleOutput.length).toBeGreaterThan(0)
    })

    it('should transform table borders correctly', () => {
      const input = [{ a: 1, b: 2 }]
      logTable(input)

      const output = consoleOutput[0]
      // Check that transformations occurred (looking for box drawing chars)
      expect(output).toMatch(/[┌├└]/)
    })

    it('should handle empty string values', () => {
      const input = [{ empty: '' }]
      logTable(input)
      expect(console.log).toHaveBeenCalled()
    })

    it('should handle whitespace in values', () => {
      const input = [{ text: '  spaced  ' }]
      logTable(input)
      expect(console.log).toHaveBeenCalled()
    })

    it('should call console.log exactly once per invocation', () => {
      const input = [{ test: 'value' }]
      logTable(input)
      expect(console.log).toHaveBeenCalledTimes(1)
    })

    it('should handle large datasets', () => {
      const input = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        value: i * 10,
      }))
      logTable(input)
      expect(console.log).toHaveBeenCalled()
      expect(consoleOutput.length).toBeGreaterThan(0)
    })

    it('should handle when Transform.read() returns null', () => {
      // Mock Transform.read to return null
      const originalRead = Transform.prototype.read
      Transform.prototype.read = jest.fn().mockReturnValue(null)

      const input = [{ test: 'value' }]
      logTable(input)

      // Should still call console.log with empty string result
      expect(console.log).toHaveBeenCalled()
      expect(consoleOutput.length).toBeGreaterThan(0)

      // Restore original
      Transform.prototype.read = originalRead
    })

    it('should handle when Transform.read() returns undefined', () => {
      // Mock Transform.read to return undefined
      const originalRead = Transform.prototype.read
      Transform.prototype.read = jest.fn().mockReturnValue(undefined)

      const input = [{ test: 'value' }]
      logTable(input)

      // Should still call console.log with empty string result
      expect(console.log).toHaveBeenCalled()
      expect(consoleOutput.length).toBeGreaterThan(0)

      // Restore original
      Transform.prototype.read = originalRead
    })
  })
})
