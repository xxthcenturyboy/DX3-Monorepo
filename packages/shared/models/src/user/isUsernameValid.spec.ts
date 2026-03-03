import { isUsernameValid } from './isUsernameValid'
import { DISALLOWED_USERNAME_STRINGS, USERNAME_MIN_LENGTH } from './user-shared.consts'

describe('isUsernameValid', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(isUsernameValid).toBeDefined()
  })

  describe('falsy / empty input', () => {
    it('should return false for an empty string', () => {
      // arrange
      // act
      const result = isUsernameValid('')
      // assert
      expect(result).toBe(false)
    })
  })

  describe('length validation', () => {
    it('should return false for a username exactly at USERNAME_MIN_LENGTH (8 chars)', () => {
      // arrange — 8 characters equals the min, but the check requires length > min (length >= 9)
      const shortUsername = 'abcdefgh'
      // act
      const result = isUsernameValid(shortUsername)
      // assert
      expect(result).toBe(false)
    })

    it('should return false for a username shorter than USERNAME_MIN_LENGTH', () => {
      // arrange
      const tooShort = 'abc123'
      // act
      const result = isUsernameValid(tooShort)
      // assert
      expect(result).toBe(false)
    })

    it('should return true for a username of exactly USERNAME_MIN_LENGTH + 1 characters', () => {
      // arrange — minimum valid length is USERNAME_MIN_LENGTH + 1 = 9 characters
      const minValidUsername = 'abcdefghi' // 9 characters, alphanumeric, no disallowed substring
      // act
      const result = isUsernameValid(minValidUsername)
      // assert
      expect(result).toBe(true)
    })
  })

  describe('character validation (regexNoWhiteSpaceAlphaNumeric)', () => {
    it('should return false for a username containing whitespace', () => {
      // arrange
      const usernameWithSpace = 'valid user'
      // act
      const result = isUsernameValid(usernameWithSpace)
      // assert
      expect(result).toBe(false)
    })

    it('should return false for a username containing special characters', () => {
      // arrange
      const usernameWithSpecial = 'validuser!'
      // act
      const result = isUsernameValid(usernameWithSpecial)
      // assert
      expect(result).toBe(false)
    })

    it('should return false for a username containing a hyphen', () => {
      // arrange
      const usernameWithHyphen = 'valid-user-name'
      // act
      const result = isUsernameValid(usernameWithHyphen)
      // assert
      expect(result).toBe(false)
    })

    it('should return true for a fully alphanumeric username of sufficient length', () => {
      // arrange
      const validUsername = 'validuser123'
      // act
      const result = isUsernameValid(validUsername)
      // assert
      expect(result).toBe(true)
    })
  })

  describe('disallowed username strings', () => {
    it('should return false for each exact disallowed username string', () => {
      // arrange
      // act
      // assert — all disallowed strings are checked individually (they are already >= min length guard
      // for longer ones, but short ones like "dev", "test" also fail the length check, which is fine)
      for (const disallowed of DISALLOWED_USERNAME_STRINGS) {
        expect(isUsernameValid(disallowed)).toBe(false)
      }
    })

    it('should return false for "admin" exact match', () => {
      // arrange
      // act
      // assert
      expect(isUsernameValid('admin')).toBe(false)
    })

    it('should return false for "superadmin" exact match', () => {
      // arrange
      // act
      // assert
      expect(isUsernameValid('superadmin')).toBe(false)
    })

    it('should return false for "webmaster" exact match', () => {
      // arrange
      // act
      // assert
      expect(isUsernameValid('webmaster')).toBe(false)
    })
  })

  describe('disallowed substring detection', () => {
    it('should return false when username contains "admin" as a substring', () => {
      // arrange — "xadminxx" is 8 chars, so must pad to 9+ to pass length check
      const usernameWithAdmin = 'myadminxyz'
      // act
      const result = isUsernameValid(usernameWithAdmin)
      // assert
      expect(result).toBe(false)
    })

    it('should return false when username contains "superadmin" as a substring', () => {
      // arrange
      const usernameWithSuperAdmin = 'mysuperadminaccount'
      // act
      const result = isUsernameValid(usernameWithSuperAdmin)
      // assert
      expect(result).toBe(false)
    })

    it('should return false when username contains "test" as a substring', () => {
      // arrange
      const usernameWithTest = 'mytestaccount'
      // act
      const result = isUsernameValid(usernameWithTest)
      // assert
      expect(result).toBe(false)
    })

    it('should return false when username contains "support" as a substring', () => {
      // arrange
      const usernameWithSupport = 'supportuser1'
      // act
      const result = isUsernameValid(usernameWithSupport)
      // assert
      expect(result).toBe(false)
    })
  })

  describe('case-insensitive disallowed string matching', () => {
    it('should return false for uppercase disallowed string "ADMIN"', () => {
      // arrange
      const uppercaseAdmin = 'ADMINUSER1'
      // act
      const result = isUsernameValid(uppercaseAdmin)
      // assert
      expect(result).toBe(false)
    })

    it('should return false for mixed-case disallowed string "Admin"', () => {
      // arrange
      const mixedCaseAdmin = 'AdminUser1'
      // act
      const result = isUsernameValid(mixedCaseAdmin)
      // assert
      expect(result).toBe(false)
    })

    it('should return false for uppercase "SUPERADMIN"', () => {
      // arrange
      const upperSuperAdmin = 'SUPERADMIN'
      // act
      const result = isUsernameValid(upperSuperAdmin)
      // assert
      expect(result).toBe(false)
    })
  })

  describe('valid usernames', () => {
    it('should return true for a long alphanumeric username with no disallowed substrings', () => {
      // arrange
      const validUsername = 'JohnDoe1234'
      // act
      const result = isUsernameValid(validUsername)
      // assert
      expect(result).toBe(true)
    })

    it('should return true for a username that is exactly 9 characters and valid', () => {
      // arrange — exactly USERNAME_MIN_LENGTH + 1 = 9 chars
      const minValidUsername = 'aBcDeFgHi'
      // act
      const result = isUsernameValid(minValidUsername)
      // assert
      expect(result).toBe(true)
    })

    it('should return true for a username with mixed case and numbers', () => {
      // arrange
      const validMixed = 'CoolUser99'
      // act
      const result = isUsernameValid(validMixed)
      // assert
      expect(result).toBe(true)
    })

    it('should satisfy minimum required length contract (USERNAME_MIN_LENGTH + 1)', () => {
      // arrange — documents the boundary: length must exceed USERNAME_MIN_LENGTH
      const boundaryValid = 'x'.repeat(USERNAME_MIN_LENGTH + 1)
      const boundaryInvalid = 'x'.repeat(USERNAME_MIN_LENGTH)
      // act
      // assert
      expect(isUsernameValid(boundaryValid)).toBe(true)
      expect(isUsernameValid(boundaryInvalid)).toBe(false)
    })
  })
})
