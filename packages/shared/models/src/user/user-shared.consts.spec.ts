import {
  DEFAULT_TIMEZONE,
  DISALLOWED_USERNAME_STRINGS,
  USERNAME_MIN_LENGTH,
} from './user-shared.consts'

describe('DEFAULT_TIMEZONE', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(DEFAULT_TIMEZONE).toBeDefined()
  })

  it('should have the correct value of "system"', () => {
    // arrange
    // act
    // assert
    expect(DEFAULT_TIMEZONE).toEqual('system')
  })
})

describe('DISALLOWED_USERNAME_STRINGS', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(DISALLOWED_USERNAME_STRINGS).toBeDefined()
  })

  it('should be an array', () => {
    // arrange
    // act
    // assert
    expect(Array.isArray(DISALLOWED_USERNAME_STRINGS)).toBe(true)
  })

  it('should have exactly 8 entries', () => {
    // arrange
    // act
    // assert
    expect(DISALLOWED_USERNAME_STRINGS.length).toEqual(8)
  })

  it('should contain reserved/sensitive username strings', () => {
    // arrange
    // act
    // assert
    expect(DISALLOWED_USERNAME_STRINGS).toContain('admin')
    expect(DISALLOWED_USERNAME_STRINGS).toContain('demo')
    expect(DISALLOWED_USERNAME_STRINGS).toContain('dev')
    expect(DISALLOWED_USERNAME_STRINGS).toContain('guest')
    expect(DISALLOWED_USERNAME_STRINGS).toContain('superadmin')
    expect(DISALLOWED_USERNAME_STRINGS).toContain('support')
    expect(DISALLOWED_USERNAME_STRINGS).toContain('test')
    expect(DISALLOWED_USERNAME_STRINGS).toContain('webmaster')
  })

  it('should only contain lowercase strings', () => {
    // arrange
    // act
    // assert
    for (const entry of DISALLOWED_USERNAME_STRINGS) {
      expect(entry).toEqual(entry.toLowerCase())
    }
  })
})

describe('USERNAME_MIN_LENGTH', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(USERNAME_MIN_LENGTH).toBeDefined()
  })

  it('should have the correct value of 8', () => {
    // arrange
    // act
    // assert
    expect(USERNAME_MIN_LENGTH).toEqual(8)
  })

  it('should be a positive integer', () => {
    // arrange
    // act
    // assert
    expect(typeof USERNAME_MIN_LENGTH).toBe('number')
    expect(USERNAME_MIN_LENGTH).toBeGreaterThan(0)
    expect(Number.isInteger(USERNAME_MIN_LENGTH)).toBe(true)
  })
})
