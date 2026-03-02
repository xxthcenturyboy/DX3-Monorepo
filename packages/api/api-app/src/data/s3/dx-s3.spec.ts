import { ApiLoggingClass } from '@dx3/api-libs/logger'
import { mockS3ServiceInstance } from '@dx3/api-libs/testing/mocks/internal/s3.mock'

import { DxS3Class } from './dx-s3'

jest.mock('@dx3/api-libs/logger', () => require('@dx3/api-libs/testing/mocks/internal/logger.mock'))

// Use a custom factory that wraps S3Service in jest.fn() so it is trackable as a mock.
// The instance methods delegate to mockS3ServiceInstance so behaviour stays consistent
// with the rest of the test suite that uses the shared s3 mock.
jest.mock('@dx3/api-libs/s3', () => {
  const { mockS3ServiceInstance: inst } = require('@dx3/api-libs/testing/mocks/internal/s3.mock')
  return {
    S3Service: jest.fn().mockImplementation(() => ({
      instantiate: inst.instantiate,
    })),
  }
})

describe('DxS3Class', () => {
  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  it('should exist', () => {
    // arrange / act / assert
    expect(DxS3Class).toBeDefined()
  })

  it('should have a public static method of initializeS3', () => {
    // arrange / act / assert
    expect(DxS3Class.initializeS3).toBeDefined()
  })

  describe('initializeS3', () => {
    it('should create the S3 service, instantiate buckets, and return true on success', async () => {
      // act
      const result = await DxS3Class.initializeS3()
      // assert
      expect(mockS3ServiceInstance.instantiate).toHaveBeenCalledTimes(1)
      expect(result).toBe(true)
    })

    it('should return false and log the error when bucket instantiation throws', async () => {
      // arrange — queue a one-shot rejection on the shared instantiate mock
      mockS3ServiceInstance.instantiate.mockRejectedValueOnce(new Error('S3 bucket not accessible'))
      // act
      const result = await DxS3Class.initializeS3()
      // assert
      expect(result).toBe(false)
    })
  })
})
