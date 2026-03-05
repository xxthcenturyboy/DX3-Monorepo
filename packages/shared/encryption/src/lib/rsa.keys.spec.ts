import NodeRsa from 'node-rsa'

import {
  dxRsaGenerateKeyPair,
  dxRsaSignPayload,
  dxRsaValidateBiometricKey,
  dxRsaValidatePayload,
} from './rsa.keys'

const errorLogSpyMock = jest
  .spyOn(console, 'error')
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  .mockImplementation(() => {})

describe('dxRSAKeys', () => {
  const payload = JSON.stringify({ test: 'test' })
  let privateKey: string
  let publicKey: string
  let signature: string

  afterAll(() => {
    errorLogSpyMock.mockRestore()
  })

  describe('dxRsaGenerateKeyPair', () => {
    it('should exist', () => {
      expect(dxRsaGenerateKeyPair).toBeDefined()
    })

    it('should create a public/private key pair', () => {
      // arrange
      // act
      const result = dxRsaGenerateKeyPair()
      // dxRsaGenerateKeyPair returns string | null; the expect() calls below assert they're defined
      privateKey = result.privateKey!
      publicKey = result.publicKey!
      // assert
      expect(privateKey).toBeDefined()
      expect(publicKey).toBeDefined()
    })

    it('should return null keys and log error when key generation throws', () => {
      // arrange — spy on generateKeyPair to force the catch block (lines 19-21 in rsa.keys.ts)
      const spy = jest.spyOn(NodeRsa.prototype, 'generateKeyPair').mockImplementation(() => {
        throw new Error('Simulated key generation failure')
      })
      // act
      const result = dxRsaGenerateKeyPair()
      // assert
      expect(result.privateKey).toBeNull()
      expect(result.publicKey).toBeNull()
      expect(errorLogSpyMock).toHaveBeenCalled()
      // cleanup
      spy.mockRestore()
    })
  })

  describe('dxRsaSignPayload', () => {
    it('should exist', () => {
      expect(dxRsaSignPayload).toBeDefined()
    })

    it('should sign a string payload', () => {
      // arrange
      // act
      // dxRsaSignPayload returns string | undefined; the expect() call below asserts it's defined
      signature = dxRsaSignPayload(privateKey, payload)!
      // assert
      expect(signature).toBeDefined()
    })

    it('should return undefined and log an error when private key is invalid', () => {
      // arrange — an invalid key triggers the catch block (lines 35-38 in rsa.keys.ts)
      // act
      const result = dxRsaSignPayload('not-a-valid-rsa-key', payload)
      // assert
      expect(result).toBeUndefined()
      expect(errorLogSpyMock).toHaveBeenCalled()
    })
  })

  describe('dxRsaValidateBiometricKey', () => {
    it('should exist', () => {
      expect(dxRsaValidateBiometricKey).toBeDefined()
    })

    it('should validate signed data', () => {
      // arrange
      // act
      const isValid = dxRsaValidateBiometricKey(signature, payload, publicKey)
      // assert
      expect(isValid).toBe(true)
    })

    it('should invalidate signed data with incorrect payload', () => {
      // arrange
      // act
      const isValid = dxRsaValidateBiometricKey(signature, 'invalid', publicKey)
      // assert
      expect(isValid).toBe(false)
    })

    it('should invalidate signed data with incorrect public key', () => {
      // arrange
      // act
      const isValid = dxRsaValidateBiometricKey(signature, payload, 'bad-key')
      // assert
      expect(isValid).toBe(false)
    })
  })

  describe('dxRsaValidatePayload', () => {
    it('should exist', () => {
      expect(dxRsaValidatePayload).toBeDefined()
    })

    it('should validate signed data', () => {
      // arrange
      // act
      const isValid = dxRsaValidatePayload(signature, payload, publicKey)
      // assert
      expect(isValid).toBe(true)
    })

    it('should invalidate signed data with incorrect payload', () => {
      // arrange
      // act
      const isValid = dxRsaValidatePayload(signature, 'invalid', publicKey)
      // assert
      expect(isValid).toBe(false)
    })

    it('should invalidate signed data with incorrect public key', () => {
      // arrange
      // act
      const isValid = dxRsaValidatePayload(signature, payload, 'bad-key')
      // assert
      expect(isValid).toBe(false)
    })
  })
})
