import { safeStringify, sanitizeForLogging } from './sanitize-log.util'

describe('sanitize-log.util', () => {
  describe('sanitizeForLogging', () => {
    it('should redact password fields', () => {
      const input = { email: 'test@example.com', password: 'secret123' }
      const result = sanitizeForLogging(input)

      expect(result.email).toBe('test@example.com')
      expect(result.password).toBe('[REDACTED]')
    })

    it('should redact token fields', () => {
      const input = { refreshToken: 'refresh-token-here', token: 'jwt-token-here', userId: '123' }
      const result = sanitizeForLogging(input)

      expect(result.userId).toBe('123')
      expect(result.token).toBe('[REDACTED]')
      expect(result.refreshToken).toBe('[REDACTED]')
    })

    it('should redact OTP/code fields', () => {
      const input = { code: '123456', email: 'test@example.com', otpCode: '654321' }
      const result = sanitizeForLogging(input)

      expect(result.email).toBe('test@example.com')
      expect(result.code).toBe('[REDACTED]')
      expect(result.otpCode).toBe('[REDACTED]')
    })

    it('should handle nested objects', () => {
      const input = {
        session: {
          token: 'abc123',
        },
        user: {
          email: 'test@example.com',
          password: 'secret',
        },
      }
      const result = sanitizeForLogging(input)

      expect(result.user.email).toBe('test@example.com')
      expect(result.user.password).toBe('[REDACTED]')
      expect(result.session.token).toBe('[REDACTED]')
    })

    it('should handle arrays in nested objects', () => {
      const input = {
        users: [
          { email: 'test1@example.com', password: 'pass1' },
          { email: 'test2@example.com', password: 'pass2' },
        ],
      }
      const result = sanitizeForLogging(input)

      expect((result.users[0] as Record<string, string>).email).toBe('test1@example.com')
      expect((result.users[0] as Record<string, string>).password).toBe('[REDACTED]')
      expect((result.users[1] as Record<string, string>).email).toBe('test2@example.com')
      expect((result.users[1] as Record<string, string>).password).toBe('[REDACTED]')
    })

    it('should be case-insensitive for field names', () => {
      const input = { CODE: '123', PASSWORD: 'secret', Token: 'abc' }
      const result = sanitizeForLogging(input)

      expect(result.PASSWORD).toBe('[REDACTED]')
      expect(result.Token).toBe('[REDACTED]')
      expect(result.CODE).toBe('[REDACTED]')
    })

    it('should return non-objects unchanged', () => {
      expect(sanitizeForLogging(null as unknown as Record<string, unknown>)).toBe(null)
      expect(sanitizeForLogging(undefined as unknown as Record<string, unknown>)).toBe(undefined)
      expect(sanitizeForLogging('string' as unknown as Record<string, unknown>)).toBe('string')
      expect(sanitizeForLogging(123 as unknown as Record<string, unknown>)).toBe(123)
    })

    it('should preserve non-sensitive fields', () => {
      const input = {
        email: 'test@example.com',
        firstName: 'John',
        id: '12345',
        lastName: 'Doe',
      }
      const result = sanitizeForLogging(input)

      expect(result).toEqual(input)
    })
  })

  describe('safeStringify', () => {
    it('should return sanitized JSON string', () => {
      const input = { email: 'test@example.com', password: 'secret' }
      const result = safeStringify(input)

      expect(result).toContain('"email":"test@example.com"')
      expect(result).toContain('"password":"[REDACTED]"')
      expect(result).not.toContain('secret')
    })

    it('should support pretty printing', () => {
      const input = { email: 'test@example.com', password: 'secret' }
      const result = safeStringify(input, 2)

      expect(result).toContain('\n')
      expect(result).toContain('  ')
    })

    it('should handle null and undefined', () => {
      expect(safeStringify(null)).toBe('null')
      expect(safeStringify(undefined)).toBe('undefined')
    })

    it('should handle primitives', () => {
      expect(safeStringify('hello')).toBe('hello')
      expect(safeStringify(123)).toBe('123')
      expect(safeStringify(true)).toBe('true')
    })
  })
})
