import { getCookie } from './cookies'

describe('getCookie', () => {
  // Store original document.cookie
  let originalCookie: string

  beforeEach(() => {
    // Save the original cookie state
    originalCookie = document.cookie
    // Clear all cookies before each test
    document.cookie.split(';').forEach((cookie) => {
      const name = cookie.split('=')[0].trim()
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    })
  })

  afterEach(() => {
    // Restore original cookie state
    document.cookie = originalCookie
  })

  it('should return the value of an existing cookie', () => {
    // Set a test cookie
    document.cookie = 'testCookie=testValue'

    const result = getCookie('testCookie')

    expect(result).toBe('testValue')
  })

  it('should return an empty string for a non-existent cookie', () => {
    const result = getCookie('nonExistentCookie')

    expect(result).toBe('')
  })

  it('should return the correct value when multiple cookies exist', () => {
    document.cookie = 'cookie1=value1'
    document.cookie = 'cookie2=value2'
    document.cookie = 'cookie3=value3'

    expect(getCookie('cookie1')).toBe('value1')
    expect(getCookie('cookie2')).toBe('value2')
    expect(getCookie('cookie3')).toBe('value3')
  })

  it('should handle cookies with special characters in the value', () => {
    document.cookie = 'specialCookie=value%20with%20spaces'

    const result = getCookie('specialCookie')

    expect(result).toBe('value%20with%20spaces')
  })

  it('should handle cookies with equals signs in the value', () => {
    document.cookie =
      'tokenCookie=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0='

    const result = getCookie('tokenCookie')

    expect(result).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0=')
  })

  it('should return the correct cookie when cookie names are similar', () => {
    document.cookie = 'user=john'
    document.cookie = 'userId=123'
    document.cookie = 'userToken=abc'

    expect(getCookie('user')).toBe('john')
    expect(getCookie('userId')).toBe('123')
    expect(getCookie('userToken')).toBe('abc')
  })

  it('should handle empty cookie values', () => {
    document.cookie = 'emptyCookie='

    const result = getCookie('emptyCookie')

    expect(result).toBe('')
  })

  it('should be case-sensitive for cookie names', () => {
    document.cookie = 'MyCookie=value1'
    document.cookie = 'myCookie=value2'

    expect(getCookie('MyCookie')).toBe('value1')
    expect(getCookie('myCookie')).toBe('value2')
  })

  it('should return empty string when searching for a partial cookie name', () => {
    document.cookie = 'fullCookieName=value'

    const result = getCookie('full')

    expect(result).toBe('')
  })

  it('should handle cookies with spaces around the equals sign', () => {
    // Note: This tests the actual regex behavior
    // Manually set document.cookie to simulate this scenario
    Object.defineProperty(document, 'cookie', {
      value: 'spacedCookie = spacedValue',
      writable: true,
    })

    const result = getCookie('spacedCookie')

    expect(result).toBe('spacedValue')
  })

  it('should handle numeric cookie values', () => {
    document.cookie = 'numericCookie=12345'

    const result = getCookie('numericCookie')

    expect(result).toBe('12345')
  })

  it('should handle boolean-like cookie values', () => {
    document.cookie = 'boolCookie=true'

    const result = getCookie('boolCookie')

    expect(result).toBe('true')
  })

  it('should handle JSON string cookie values', () => {
    const jsonValue = JSON.stringify({ key: 'value' })
    document.cookie = `jsonCookie=${jsonValue}`

    const result = getCookie('jsonCookie')

    expect(result).toBe(jsonValue)
  })
})
