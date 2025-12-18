/**
 * Mock for S3Service from @dx3/api-libs/s3
 * Provides AWS S3 client and file operation mocks
 */
// import { TEST_BAD_UUID } from '@dx3/test-data'

import type { S3ServiceParamType } from '../../../s3/s3.types'

/**
 * Mock S3Service instance methods
 * These are the methods available on an instantiated S3Service
 */
export const mockS3ServiceInstance = {
  emptyS3Directory: jest.fn().mockResolvedValue({ message: 'Success', removed: true }),
  // emptyS3Directory: jest.fn().mockImplementation((_bucket: string, dir: string) => {
  //   console.log('Mock emptyS3Directory called with dir:', dir)
  //   if (dir === TEST_BAD_UUID) {
  //     return { message: 'not exist', removed: false }
  //   } else {
  //     return { message: 'Success', removed: true }
  //   }
  // }),
  getContentType: jest.fn().mockResolvedValue('image/jpeg'),
  getObject: jest.fn().mockResolvedValue(Buffer.from('mock-file-content')),
  getSignedUrlPromise: jest.fn().mockResolvedValue({
    expires: 900,
    url: 'https://mock-signed-url.com',
  }),
  instantiate: jest.fn().mockResolvedValue(undefined),
  moveObject: jest.fn().mockResolvedValue(true),
  uploadObject: jest.fn().mockResolvedValue({
    Bucket: 'mock-s3-bucket',
    ETag: '"mock-etag-12345"',
    Key: 'test-file.jpg',
    Location: 'https://mock-s3-bucket.s3.amazonaws.com/test-file.jpg',
  }),
}

/**
 * Mock S3Service class
 * Matches the interface of the real S3Service
 */
export class S3Service {
  private accessKeyId: string
  private secretAccessKey: string

  constructor(params: S3ServiceParamType) {
    this.accessKeyId = params.accessKeyId
    this.secretAccessKey = params.secretAccessKey
  }

  public static getS3Client = jest.fn().mockReturnValue({
    send: jest.fn().mockResolvedValue({
      ETag: 'mock-etag',
      Key: 'test-file.jpg',
      Location: 'https://mock-s3-bucket.s3.amazonaws.com/test-file.jpg',
    }),
  })

  public instantiate = mockS3ServiceInstance.instantiate
  public uploadObject = mockS3ServiceInstance.uploadObject
  public moveObject = mockS3ServiceInstance.moveObject
  public getObject = mockS3ServiceInstance.getObject
  public getSignedUrlPromise = mockS3ServiceInstance.getSignedUrlPromise
  public emptyS3Directory = mockS3ServiceInstance.emptyS3Directory
  public getContentType = mockS3ServiceInstance.getContentType
}

export type S3ServiceType = typeof S3Service.prototype

/**
 * Setup function for S3Service mocking
 * Call this in test setup if you need to reinitialize mocks
 */
export const mockS3Service = () => {
  // Reset all mocks to their default implementations
  mockS3ServiceInstance.emptyS3Directory.mockResolvedValue({ message: 'Success', removed: true })
  mockS3ServiceInstance.getContentType.mockResolvedValue('image/jpeg')
  mockS3ServiceInstance.getObject.mockResolvedValue(Buffer.from('mock-file-content'))
  mockS3ServiceInstance.getSignedUrlPromise.mockResolvedValue({
    expires: 900,
    url: 'https://mock-signed-url.com',
  })
  mockS3ServiceInstance.instantiate.mockResolvedValue(undefined)
  mockS3ServiceInstance.moveObject.mockResolvedValue(true)
  mockS3ServiceInstance.uploadObject.mockResolvedValue({
    Bucket: 'mock-s3-bucket',
    ETag: '"mock-etag-12345"',
    Key: 'test-file.jpg',
    Location: 'https://mock-s3-bucket.s3.amazonaws.com/test-file.jpg',
  })
}

/**
 * Export mock instance for use in test assertions (alias for backwards compatibility)
 *
 * @example
 * import { s3ServiceMock } from '../testing/mocks';
 * expect(s3ServiceMock.uploadObject).toHaveBeenCalledWith(expect.objectContaining({
 *   Bucket: 'test-bucket',
 *   Key: 'test-file.jpg'
 * }));
 */
export const s3ServiceMock = mockS3ServiceInstance

/**
 * Helper to reset all S3 mocks between tests
 *
 * @example
 * import { resetS3Mocks } from '../testing/mocks';
 * beforeEach(() => resetS3Mocks());
 */
export const resetS3Mocks = () => {
  Object.values(mockS3ServiceInstance).forEach((mock) => {
    if (typeof mock.mockClear === 'function') {
      mock.mockClear()
    }
  })
  S3Service.getS3Client.mockClear()
}

/**
 * Helper to mock S3 upload errors
 *
 * @example
 * import { mockS3UploadError } from '../testing/mocks';
 * mockS3UploadError('Upload failed');
 */
export const mockS3UploadError = (errorMessage: string) => {
  mockS3ServiceInstance.uploadObject.mockRejectedValue(new Error(errorMessage))
}

/**
 * Helper to mock S3 getObject errors
 *
 * @example
 * import { mockS3GetObjectError } from '../testing/mocks';
 * mockS3GetObjectError('Object not found');
 */
export const mockS3GetObjectError = (errorMessage: string) => {
  mockS3ServiceInstance.getObject.mockRejectedValue(new Error(errorMessage))
}
