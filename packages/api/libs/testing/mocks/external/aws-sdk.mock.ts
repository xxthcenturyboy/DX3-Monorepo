/**
 * Mock for AWS SDK @aws-sdk/lib-storage
 * Provides Upload class mock for S3 multipart uploads
 */

export const mockAwsSdk = () => {
  const uploadMock = {
    abort: jest.fn().mockResolvedValue(undefined),
    done: jest.fn().mockResolvedValue({
      Bucket: 'mock-s3-bucket',
      ETag: '"mock-etag-12345"',
      Key: 'uploaded-file.jpg',
      Location: 'https://mock-s3-bucket.s3.amazonaws.com/uploaded-file.jpg',
    }),
    on: jest.fn().mockReturnThis(),
  }

  jest.mock('@aws-sdk/lib-storage', () => ({
    Upload: jest.fn().mockImplementation(() => uploadMock),
  }))

  return uploadMock
}

/**
 * Export mock instance for use in test assertions
 *
 * @example
 * import { awsUploadMock } from '../testing/mocks';
 * expect(awsUploadMock.done).toHaveBeenCalled();
 */
export const awsUploadMock = {
  abort: jest.fn(),
  done: jest.fn(),
  on: jest.fn(),
}

/**
 * Helper to mock S3 upload errors
 *
 * @example
 * import { mockAwsUploadError } from '../testing/mocks';
 * mockAwsUploadError('Upload failed');
 */
export const mockAwsUploadError = (errorMessage: string) => {
  const { Upload } = require('@aws-sdk/lib-storage')
  ;(Upload as jest.Mock).mockImplementation(() => ({
    abort: jest.fn(),
    done: jest.fn().mockRejectedValue(new Error(errorMessage)),
    on: jest.fn().mockReturnThis(),
  }))
}
