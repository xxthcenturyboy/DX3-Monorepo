import {
  API_APP_NAME,
  API_ERROR,
  API_ROOT,
  // APP_PREFIX,
  CRYPT_KEY,
  ERROR_MSG_API,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  OTP_SALT,
  POSTGRES_URI,
  S3_ACCESS_KEY_ID,
  S3_APP_BUCKET_NAME,
  S3_ENDPOINT,
  S3_PROVIDER,
  S3_REGION,
  S3_SECRET_ACCESS_KEY,
  SENDGRID_API_KEY,
  SENDGRID_URL,
} from './config-api.consts'

describe('Config API Constants', () => {
  it('should have all constants defined', () => {
    expect(API_APP_NAME).toBeDefined()
    expect(API_ERROR).toBeDefined()
    expect(API_ROOT).toBeDefined()
    expect(CRYPT_KEY).toBeDefined()
    expect(ERROR_MSG_API).toBeDefined()
    expect(JWT_ACCESS_SECRET).toBeDefined()
    expect(JWT_REFRESH_SECRET).toBeDefined()
    expect(OTP_SALT).toBeDefined()
    expect(POSTGRES_URI).toBeDefined()
    expect(S3_ACCESS_KEY_ID).toBeDefined()
    expect(S3_APP_BUCKET_NAME).toBeDefined()
    expect(S3_ENDPOINT).toBeDefined()
    expect(S3_PROVIDER).toBeDefined()
    expect(S3_REGION).toBeDefined()
    expect(S3_SECRET_ACCESS_KEY).toBeDefined()
    expect(SENDGRID_API_KEY).toBeDefined()
    expect(SENDGRID_URL).toBeDefined()
  })
})
