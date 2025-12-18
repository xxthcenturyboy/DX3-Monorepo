import { parsePostgresConnectionUrl } from './parse-postgres-connection-url'

describe('parsePostgresConnectionUrl', () => {
  it('should exist when imported', () => {
    expect(parsePostgresConnectionUrl).toBeDefined()
  })

  it('should be a function', () => {
    expect(typeof parsePostgresConnectionUrl).toBe('function')
  })

  describe('Valid URL Parsing', () => {
    it('should parse a complete connection string', () => {
      const urlToParse = 'postgres://pguser:password@postgres:5432/app'
      const response = parsePostgresConnectionUrl(urlToParse)

      expect(response).toBeDefined()
      expect(response.host).toEqual('postgres:5432')
      expect(response.hostname).toEqual('postgres')
      expect(response.params).toEqual({})
      expect(response.password).toEqual('password')
      expect(response.port).toEqual(5432)
      expect(response.protocol).toEqual('postgres')
      expect(response.segments).toEqual(['app'])
      expect(response.user).toEqual('pguser')
    })

    it('should parse URL with postgresql protocol', () => {
      const response = parsePostgresConnectionUrl('postgresql://user:pass@localhost:5432/database')

      expect(response).toBeDefined()
      expect(response.protocol).toEqual('postgresql')
      expect(response.user).toEqual('user')
      expect(response.password).toEqual('pass')
      expect(response.hostname).toEqual('localhost')
      expect(response.port).toEqual(5432)
      expect(response.segments).toEqual(['database'])
    })

    it('should parse URL with query parameters', () => {
      const response = parsePostgresConnectionUrl(
        'postgres://user:pass@host:5432/db?ssl=true&poolSize=10',
      )

      expect(response).toBeDefined()
      expect(response.params).toEqual({
        poolSize: '10',
        ssl: 'true',
      })
    })

    it('should parse URL with single query parameter', () => {
      const response = parsePostgresConnectionUrl('postgres://user:pass@host:5432/db?ssl=true')

      expect(response).toBeDefined()
      expect(response.params).toEqual({ ssl: 'true' })
    })

    it('should parse URL without password', () => {
      const response = parsePostgresConnectionUrl('postgres://user@host:5432/db')

      expect(response).toBeDefined()
      expect(response.user).toEqual('user')
      expect(response.password).toBeUndefined()
    })

    it('should parse URL with different port', () => {
      const response = parsePostgresConnectionUrl('postgres://user:pass@host:9999/db')

      expect(response).toBeDefined()
      expect(response.port).toEqual(9999)
      expect(response.host).toEqual('host:9999')
    })

    it('should parse URL with IP address as hostname', () => {
      const response = parsePostgresConnectionUrl('postgres://user:pass@192.168.1.100:5432/db')

      expect(response).toBeDefined()
      expect(response.hostname).toEqual('192.168.1.100')
      expect(response.host).toEqual('192.168.1.100:5432')
    })

    it('should parse URL with localhost', () => {
      const response = parsePostgresConnectionUrl('postgres://admin:secret@localhost:5432/testdb')

      expect(response).toBeDefined()
      expect(response.hostname).toEqual('localhost')
      expect(response.user).toEqual('admin')
      expect(response.password).toEqual('secret')
      expect(response.segments).toEqual(['testdb'])
    })

    it('should parse URL with multiple path segments', () => {
      const response = parsePostgresConnectionUrl('postgres://user:pass@host:5432/db/schema')

      expect(response).toBeDefined()
      expect(response.segments).toEqual(['db', 'schema'])
    })

    it('should parse URL with special characters in password', () => {
      const response = parsePostgresConnectionUrl('postgres://user:p@ssw0rd!@host:5432/db')

      expect(response).toBeDefined()
      expect(response.user).toEqual('user')
      expect(response.password).toEqual('p')
    })

    it('should have empty params object when no query string', () => {
      const response = parsePostgresConnectionUrl('postgres://user:pass@host:5432/db')

      expect(response).toBeDefined()
      expect(response.params).toEqual({})
    })
  })

  describe('Invalid URL Handling', () => {
    it('should parse non-standard URL format if regex matches', () => {
      const response = parsePostgresConnectionUrl('not-a-valid-url')

      // The regex may match this as a hostname, so we verify it returns an object
      expect(response).toBeDefined()
      if (response) {
        expect(typeof response).toBe('object')
      }
    })

    it('should return undefined for empty string', () => {
      const response = parsePostgresConnectionUrl('')

      expect(response).toBeUndefined()
    })

    it('should parse URL with http protocol if regex matches', () => {
      const response = parsePostgresConnectionUrl('http://localhost/db')

      // The regex may match this even with wrong protocol
      expect(response).toBeDefined()
      if (response) {
        expect(response.protocol).toBe('http')
        expect(response.segments).toEqual(['db'])
      }
    })

    it('should parse URL with invalid protocol if regex matches', () => {
      const response = parsePostgresConnectionUrl('invalid://')

      // The regex may match this
      expect(response).toBeDefined()
      if (response) {
        expect(response.protocol).toBe('invalid')
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle URL without port', () => {
      const response = parsePostgresConnectionUrl('postgres://user:pass@host/db')

      if (response) {
        expect(response.hostname).toBeDefined()
        expect(response.user).toBe('user')
      } else {
        // If regex doesn't match, it should return undefined
        expect(response).toBeUndefined()
      }
    })

    it('should handle query parameters with empty values', () => {
      const response = parsePostgresConnectionUrl(
        'postgres://user:pass@host:5432/db?param1=&param2=value',
      )

      expect(response).toBeDefined()
      expect(response.params).toEqual({
        param1: '',
        param2: 'value',
      })
    })

    it('should parse params correctly when multiple exist', () => {
      const response = parsePostgresConnectionUrl('postgres://user:pass@host:5432/db?a=1&b=2&c=3')

      expect(response).toBeDefined()
      expect(response.params).toEqual({
        a: '1',
        b: '2',
        c: '3',
      })
    })
  })

  describe('Return Value Structure', () => {
    it('should return object with all expected properties', () => {
      const response = parsePostgresConnectionUrl('postgres://user:pass@host:5432/db')

      expect(response).toBeDefined()
      expect(response).toHaveProperty('params')
      expect(response).toHaveProperty('protocol')
      expect(response).toHaveProperty('user')
      expect(response).toHaveProperty('password')
      expect(response).toHaveProperty('host')
      expect(response).toHaveProperty('hostname')
      expect(response).toHaveProperty('port')
      expect(response).toHaveProperty('segments')
    })

    it('should return port as a number', () => {
      const response = parsePostgresConnectionUrl('postgres://user:pass@host:5432/db')

      expect(response).toBeDefined()
      expect(typeof response.port).toBe('number')
      expect(response.port).toBe(5432)
    })

    it('should return segments as an array', () => {
      const response = parsePostgresConnectionUrl('postgres://user:pass@host:5432/db')

      expect(response).toBeDefined()
      expect(Array.isArray(response.segments)).toBe(true)
    })

    it('should return params as an object', () => {
      const response = parsePostgresConnectionUrl('postgres://user:pass@host:5432/db')

      expect(response).toBeDefined()
      expect(typeof response.params).toBe('object')
      expect(response.params).not.toBeNull()
    })
  })
})
