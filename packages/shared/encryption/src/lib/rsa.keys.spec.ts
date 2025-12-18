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
      privateKey = result.privateKey
      publicKey = result.publicKey
      // assert
      expect(privateKey).toBeDefined()
      expect(publicKey).toBeDefined()
    })
  })

  describe('dxRsaSignPayload', () => {
    it('should exist', () => {
      expect(dxRsaSignPayload).toBeDefined()
    })

    it('should sign a string payload', () => {
      // arrange
      // act
      signature = dxRsaSignPayload(privateKey, payload)
      // assert
      expect(signature).toBeDefined()
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
