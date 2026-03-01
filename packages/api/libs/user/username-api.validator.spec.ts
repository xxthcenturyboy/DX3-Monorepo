import { usernameValidator } from './username-api.validator'

describe('usernameValidator', () => {
  it('should return true for valid username without whitespace', () => {
    expect(usernameValidator('testuser')).toBe(true)
    expect(usernameValidator('user123')).toBe(true)
    expect(usernameValidator('a')).toBe(true)
  })

  it('should return false for username with spaces', () => {
    expect(usernameValidator('test user')).toBe(false)
    expect(usernameValidator(' user')).toBe(false)
    expect(usernameValidator('user ')).toBe(false)
  })

  it('should return false for username with tabs or newlines', () => {
    expect(usernameValidator('test\tuser')).toBe(false)
    expect(usernameValidator('test\nuser')).toBe(false)
  })

  it('should return true for empty string (regex allows zero chars)', () => {
    expect(usernameValidator('')).toBe(true)
  })

  it('should return false for non-string input', () => {
    expect(usernameValidator(null as unknown as string)).toBe(false)
    expect(usernameValidator(123 as unknown as string)).toBe(false)
  })
})
