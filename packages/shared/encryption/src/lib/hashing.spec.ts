import {
  dxGenerateHashWithSalt,
  dxGetSaltFromHash,
  dxHashString,
  dxVerifyHash,
} from './hashing'

describe('dxHashString', () => {
  test('hashing a string', async () => {
    // arrange
    // act
    const hashString = await dxHashString('stringToHash')
    // assert
    expect(dxHashString).toBeDefined()
    expect(hashString).toBeDefined()
    expect(typeof hashString === 'string').toBeTruthy()
  })

  it('should produce a hash containing a dot separator between salt and result', async () => {
    // arrange
    // act
    const hash = await dxHashString('test-value')
    // assert — format is `<base64-salt>.<base64-result>`
    expect(hash).toContain('.')
    expect(hash.split('.').length).toBe(2)
  })
})

describe('dxGetSaltFromHash', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(dxGetSaltFromHash).toBeDefined()
  })

  it('should return the salt portion of a valid hash string', async () => {
    // arrange
    const hash = await dxHashString('my-test-string')
    // act
    const salt = dxGetSaltFromHash(hash)
    // assert
    expect(salt).toBeDefined()
    expect(typeof salt).toBe('string')
    expect(salt.length).toBeGreaterThan(0)
    // the salt is the part before the dot
    expect(hash.startsWith(salt)).toBe(true)
  })

  it('should return empty string when hash is not a string (non-string input)', () => {
    // arrange
    // act — the function guards against typeof hash !== 'string'
    const result = dxGetSaltFromHash(12345 as unknown as string)
    // assert
    expect(result).toBe('')
  })

  it('should return empty string when hash exceeds 120 characters', () => {
    // arrange
    const tooLongHash = 'a'.repeat(121)
    // act
    const result = dxGetSaltFromHash(tooLongHash)
    // assert
    expect(result).toBe('')
  })

  it('should return the part before the dot for a hash at exactly 120 characters', () => {
    // arrange — 120-char string is at the boundary (not over), should not be rejected
    const saltPart = 'abc'
    const hashPart = 'd'.repeat(116) // total = 3 + 1 + 116 = 120
    const boundaryHash = `${saltPart}.${hashPart}`
    // act
    const result = dxGetSaltFromHash(boundaryHash)
    // assert
    expect(result).toBe(saltPart)
  })
})

describe('dxGenerateHashWithSalt', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(dxGenerateHashWithSalt).toBeDefined()
  })

  it('should generate a hash string using a given salt', async () => {
    // arrange
    const original = 'my-password'
    const hash = await dxHashString(original)
    const salt = dxGetSaltFromHash(hash)
    // act
    const rehashedWithSalt = await dxGenerateHashWithSalt(original, salt)
    // assert
    expect(typeof rehashedWithSalt).toBe('string')
    expect(rehashedWithSalt.length).toBeGreaterThan(0)
    expect(rehashedWithSalt).toContain('.')
  })

  it('should produce a consistent hash for the same string and salt', async () => {
    // arrange
    const original = 'consistent-value'
    const hash1 = await dxHashString(original)
    const salt = dxGetSaltFromHash(hash1)
    // act
    const hash2 = await dxGenerateHashWithSalt(original, salt)
    const hash3 = await dxGenerateHashWithSalt(original, salt)
    // assert — same input + same salt must yield the same output
    expect(hash2).toBe(hash3)
  })

  it('should return empty string when salt is not a string', async () => {
    // arrange
    // act — tests the typeof salt !== 'string' runtime guard
    const result = await dxGenerateHashWithSalt('some-string', 99 as unknown as string)
    // assert
    expect(result).toBe('')
  })

  it('should return empty string when str is not a string', async () => {
    // arrange
    const hash = await dxHashString('test')
    const salt = dxGetSaltFromHash(hash)
    // act — tests the typeof str !== 'string' runtime guard
    const result = await dxGenerateHashWithSalt(undefined as unknown as string, salt)
    // assert
    expect(result).toBe('')
  })
})

describe('dxVerifyHash', () => {
  test('validating a hash string', async () => {
    // arrange
    const stringToHash = 'string-test-value'
    // act
    const hashString = await dxHashString(stringToHash)
    const verified = await dxVerifyHash(hashString, stringToHash)
    const notVerified = await dxVerifyHash(hashString, 'incorrect-value')
    // assert
    expect(dxVerifyHash).toBeDefined()
    expect(hashString).toBeDefined()
    expect(verified).toBeTruthy()
    expect(notVerified).toBeFalsy()
  })

  it('should return false when hash is not a string', async () => {
    // arrange
    // act — tests the typeof hash !== 'string' runtime guard
    const result = await dxVerifyHash(42 as unknown as string, 'some-string')
    // assert
    expect(result).toBe(false)
  })

  it('should return false when str is not a string', async () => {
    // arrange
    const hash = await dxHashString('test')
    // act — tests the typeof str !== 'string' runtime guard
    const result = await dxVerifyHash(hash, null as unknown as string)
    // assert
    expect(result).toBe(false)
  })

  it('should return false when hash exceeds 120 characters', async () => {
    // arrange
    const tooLongHash = 'a'.repeat(121)
    // act — tests the hash.length > 120 guard
    const result = await dxVerifyHash(tooLongHash, 'any-string')
    // assert
    expect(result).toBe(false)
  })
})
