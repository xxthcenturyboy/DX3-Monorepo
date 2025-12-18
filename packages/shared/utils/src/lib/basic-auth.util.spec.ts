import { basicAuthHeader } from './basic-auth.util'

describe('basicAuthHeader', () => {
  const originalBuffer = (global as any).Buffer
  const originalBtoa = (global as any).btoa
  const originalTextEncoder = (global as any).TextEncoder

  afterEach(() => {
    ;(global as any).Buffer = originalBuffer
    ;(global as any).btoa = originalBtoa
    ;(global as any).TextEncoder = originalTextEncoder
  })

  test('returns Node-style Basic Authorization header using Buffer', () => {
    const header = basicAuthHeader('user', 'pass')
    const expected = `Basic ${originalBuffer.from('user:pass').toString('base64')}`
    expect(header).toEqual({ Authorization: expected })
  })

  test('falls back to browser btoa + TextEncoder when Buffer is not available', () => {
    // simulate browser environment: remove Buffer, provide btoa and TextEncoder
    ;(global as any).Buffer = undefined
    ;(global as any).btoa = (binary: string) =>
      // use originalBuffer to compute base64 from binary (latin1) string
      originalBuffer
        .from(binary, 'binary')
        .toString('base64')
    ;(global as any).TextEncoder = class {
      encode(str: string) {
        // return Uint8Array of UTF-8 bytes using original Buffer
        return originalBuffer.from(str, 'utf8')
      }
    }

    const username = 'éné'
    const password = 'päss'
    const header = basicAuthHeader(username, password)

    // compute expected using original Buffer to ensure identical base64
    const expected = `Basic ${originalBuffer.from(`${username}:${password}`, 'utf8').toString('base64')}`

    expect(header).toEqual({ Authorization: expected })
  })

  test('throws when no base64 encoder is available', () => {
    ;(global as any).Buffer = undefined
    ;(global as any).btoa = undefined
    ;(global as any).TextEncoder = undefined

    expect(() => basicAuthHeader('a', 'b')).toThrow(
      'No base64 encoder available in this environment',
    )
  })
})
