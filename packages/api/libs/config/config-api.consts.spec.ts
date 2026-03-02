import {
  API_APP_NAME,
  API_ERROR,
  API_ROOT,
  CRYPT_KEY,
  ERROR_MSG_API,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  MAXMIND_GEOIP_DB_PATH,
  OTP_SALT,
  POSTGRES_URI,
  REFERENCE_DATA_API_KEY,
  REFERENCE_DATA_API_SECRET,
  REFERENCE_DATA_API_URL,
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
    expect(REFERENCE_DATA_API_URL).toBeDefined()
    expect(REFERENCE_DATA_API_KEY).toBeDefined()
    expect(REFERENCE_DATA_API_SECRET).toBeDefined()
    expect(S3_ACCESS_KEY_ID).toBeDefined()
    expect(S3_APP_BUCKET_NAME).toBeDefined()
    expect(S3_ENDPOINT).toBeDefined()
    expect(S3_PROVIDER).toBeDefined()
    expect(S3_REGION).toBeDefined()
    expect(S3_SECRET_ACCESS_KEY).toBeDefined()
    expect(SENDGRID_API_KEY).toBeDefined()
    expect(SENDGRID_URL).toBeDefined()
  })

  it('MAXMIND_GEOIP_DB_PATH should be a string (empty when env var not set)', () => {
    expect(typeof MAXMIND_GEOIP_DB_PATH).toBe('string')
  })
})

describe('Config API Constants - module isolation branch coverage', () => {
  const originalEnv = process.env

  afterEach(() => {
    process.env = originalEnv
    jest.resetModules()
  })

  it('should use env var value directly when it is set', () => {
    process.env = {
      ...originalEnv,
      CRYPT_KEY: 'direct-crypt-key-value',
      NODE_ENV: 'test',
    }
    jest.isolateModules(() => {
      var { CRYPT_KEY: key } = require('./config-api.consts') as { CRYPT_KEY: string }
      expect(key).toBe('direct-crypt-key-value')
    })
  })

  it('should resolve MAXMIND_GEOIP_DB_PATH with path.join when env var is set', () => {
    process.env = {
      ...originalEnv,
      MAXMIND_GEOIP_DB_PATH: '../geoip/GeoLite2-City.mmdb',
      NODE_ENV: 'test',
    }
    jest.isolateModules(() => {
      var { MAXMIND_GEOIP_DB_PATH: geoPath } = require('./config-api.consts') as {
        MAXMIND_GEOIP_DB_PATH: string
      }
      expect(geoPath).toContain('GeoLite2-City.mmdb')
    })
  })

  it('should throw when required env var is missing in production', () => {
    process.env = { NODE_ENV: 'production' }

    expect(() => {
      jest.isolateModules(() => {
        require('./config-api.consts')
      })
    }).toThrow('CRITICAL: Required environment variable')
  })

  it('should use dev fallback and emit console.warn when NODE_ENV is development', () => {
    process.env = { NODE_ENV: 'development' }

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined)

    jest.isolateModules(() => {
      require('./config-api.consts')
    })

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('[DEV WARNING]'))
    warnSpy.mockRestore()
  })
})
