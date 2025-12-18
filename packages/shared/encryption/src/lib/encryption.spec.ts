import { randomBytes } from 'node:crypto'

import { dxDecryptString, dxEncryptString } from './encryption'

// Generate a proper 32-byte key for AES-256-CBC
const CRYPT_KEY = randomBytes(32)

describe('dxEncryptString', () => {
  // arrange
  const key = CRYPT_KEY
  // act
  const encryptionResult = dxEncryptString('stringToEncrypt', key)
  key.fill(0)
  // assert
  it('should exist when imported', () => {
    expect(dxEncryptString).toBeDefined()
  })

  it('should encrypt a string when invoked', () => {
    expect(encryptionResult).toBeDefined()
    expect(typeof encryptionResult.encryptedValue === 'string').toBeTruthy()
    expect(typeof encryptionResult.iv === 'string').toBeTruthy()
  })
})

describe('dxDecryptString', () => {
  // arrange
  const key = CRYPT_KEY
  const stringToEncrypt = 'string-test-value'
  // act
  const encryptedResult = dxEncryptString(stringToEncrypt, key)
  const decryptedValue = dxDecryptString(encryptedResult.encryptedValue, encryptedResult.iv, key)
  key.fill(0)
  // assert
  it('should exist when imported', () => {
    expect(dxDecryptString).toBeDefined()
  })

  it('should decrypt an encrypted string when invoked', () => {
    expect(decryptedValue).toBeDefined()
    expect(typeof decryptedValue === 'string').toBeTruthy()
    expect(decryptedValue).toEqual(stringToEncrypt)
  })
})

describe('encryption and decryption consistency', () => {
  // arrange
  const key = randomBytes(32)
  const originalText = 'This is a test message for encryption consistency'

  // act
  const encrypted = dxEncryptString(originalText, key)
  const decrypted = dxDecryptString(encrypted.encryptedValue, encrypted.iv, key)
  key.fill(0)

  // assert
  it('should decrypt to the original text', () => {
    expect(decrypted).toBe(originalText)
  })

  it('should produce valid encrypted output', () => {
    expect(encrypted.encryptedValue).toBeDefined()
    expect(encrypted.iv).toBeDefined()
    expect(encrypted.encryptedValue.length).toBeGreaterThan(0)
    expect(encrypted.iv.length).toBe(32) // 16 bytes in hex = 32 characters
  })
})
