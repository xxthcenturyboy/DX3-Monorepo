/**
 * Internal mock exports for libs modules
 * These mocks replace the scattered __mocks__ folders throughout libs/
 */

// Logger mock
export {
  ApiLoggingClass,
  ApiLoggingClassType,
  logTable,
  mockApiLoggingClass,
} from './logger.mock'
// Postgres mock
export { mockPostgresDbConnection, PostgresDbConnection } from './pg.mock'
// Redis mock
export {
  mockRedisCacheHandle,
  mockRedisService,
  RedisHealthzService,
  RedisService,
  resetRedisMocks,
} from './redis.mock'
// S3 mock
export {
  mockS3GetObjectError,
  mockS3Service,
  mockS3ServiceInstance,
  mockS3UploadError,
  resetS3Mocks,
  S3Service,
  S3ServiceType,
  s3ServiceMock,
} from './s3.mock'
