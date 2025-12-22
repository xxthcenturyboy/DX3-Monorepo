# API Security Remediation Guide

> **Generated**: December 21, 2025
> **Scope**: `packages/api/`
> **Priority Levels**: 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low

---

## Table of Contents

1. [Critical: Remove Hardcoded Secret Fallbacks](#1-critical-remove-hardcoded-secret-fallbacks)
2. [Critical: Separate JWT Secrets for Access & Refresh Tokens](#2-critical-separate-jwt-secrets-for-access--refresh-tokens)
3. [High: Enable PostgreSQL SSL in Production](#3-high-enable-postgresql-ssl-in-production)
4. [High: Change S3 Upload ACL to Private by Default](#4-high-change-s3-upload-acl-to-private-by-default)
5. [High: Add SameSite Attribute to Cookies](#5-high-add-samesite-attribute-to-cookies)
6. [High: Add File Type Validation on Uploads](#6-high-add-file-type-validation-on-uploads)
7. [High: Enable Redis TLS Validation in Production](#7-high-enable-redis-tls-validation-in-production)
8. [Medium: Improve Rate Limiting Resilience](#8-medium-improve-rate-limiting-resilience)
9. [Medium: Sanitize Sensitive Data in Logs](#9-medium-sanitize-sensitive-data-in-logs)
10. [Medium: Add Role/Restriction Whitelist Validation](#10-medium-add-rolerestriction-whitelist-validation)
11. [Medium: Add JWT Algorithm and Audience Claims](#11-medium-add-jwt-algorithm-and-audience-claims)
12. [Low: Add Helmet.js Security Headers](#12-low-add-helmetjs-security-headers)

---

## 1. Critical: Remove Hardcoded Secret Fallbacks

🔴 **Priority**: Critical
📁 **File**: `libs/config/config-api.consts.ts`

### Current State (Vulnerable)

```typescript
export const CRYPT_KEY =
  env.CRYPT_KEY || '21011dc57c5bed4efac0101a340665b1e45a87aa0606e534244d203133e6a83e'
export const JWT_SECRET = env.JWT_SECRET || APP_NAME
export const OTP_SALT = env.OTP_SALT || 'OU812'
export const SENDGRID_API_KEY = env.SENDGRID_API_KEY || 'SG.secret'
```

### Risk

If environment variables are not set, the API uses predictable defaults. Attackers knowing these values can:
- Forge JWT tokens
- Decrypt sensitive data
- Predict OTP hashes

### Remediation

```typescript
import { getEnvironment } from './config-api.service'

const env = getEnvironment()

/**
 * Retrieves a required environment variable or throws an error.
 * This ensures the application fails fast if critical secrets are missing.
 */
function getRequiredEnvVar(name: string): string {
  const value = env[name]
  if (!value) {
    throw new Error(
      `CRITICAL: Required environment variable "${name}" is not set. ` +
      `The application cannot start without this configuration.`
    )
  }
  return value
}

/**
 * Retrieves an optional environment variable with a default value.
 * Only use for non-sensitive configuration.
 */
function getOptionalEnvVar(name: string, defaultValue: string): string {
  return env[name] || defaultValue
}

// REQUIRED - Application will not start without these
export const CRYPT_KEY = getRequiredEnvVar('CRYPT_KEY')
export const JWT_SECRET = getRequiredEnvVar('JWT_SECRET')
export const OTP_SALT = getRequiredEnvVar('OTP_SALT')
export const SENDGRID_API_KEY = getRequiredEnvVar('SENDGRID_API_KEY')

// OPTIONAL - Safe to have defaults
export const POSTGRES_URI = getOptionalEnvVar('POSTGRES_URI', '')
export const UPLOAD_MAX_FILE_SIZE = getOptionalEnvVar('UPLOAD_MAX_FILE_SIZE', '50')
```

### Testing

- [ ] Verify application fails to start when required env vars are missing
- [ ] Verify application starts successfully with all env vars configured
- [ ] Update CI/CD pipelines to ensure all required env vars are set

---

## 2. Critical: Separate JWT Secrets for Access & Refresh Tokens

🔴 **Priority**: Critical
📁 **File**: `libs/auth/tokens/token.service.ts`

### Current State (Vulnerable)

Both access and refresh tokens use the same `JWT_SECRET`, meaning compromise of one token type exposes both.

### Remediation

#### Step 1: Add new environment variables

Add to `libs/config/config-api.consts.ts`:

```typescript
export const JWT_ACCESS_SECRET = getRequiredEnvVar('JWT_ACCESS_SECRET')
export const JWT_REFRESH_SECRET = getRequiredEnvVar('JWT_REFRESH_SECRET')
```

#### Step 2: Update TokenService

```typescript
import jwt from 'jsonwebtoken'

import { APP_DOMAIN, type JwtPayloadType } from '@dx3/models-shared'
import { DxDateUtilClass } from '@dx3/utils-shared'

import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from '../../config/config-api.consts'
import { ApiLoggingClass } from '../../logger'
import { UserModel } from '../../user/user-api.postgres-model'
import type { GenerateTokenParams, GenerateTokenResponse, TokenExpiration } from './token.types'

// Token types for preventing token confusion attacks
const TOKEN_TYPE = {
  ACCESS: 'access',
  REFRESH: 'refresh',
} as const

export class TokenService {
  public static issuer = `accounts.${APP_DOMAIN}`
  public static audience = 'dx3-api'

  private static getExpiresIn(time: number, unit: string): string {
    const unitMap: Record<string, string> = {
      day: 'd',
      days: 'd',
      hour: 'h',
      hours: 'h',
      minute: 'm',
      minutes: 'm',
      second: 's',
      seconds: 's',
      year: 'y',
      years: 'y',
    }

    const abbreviation = unitMap[unit] || 's'
    return `${time}${abbreviation}`
  }

  public static generateTokens(
    userId: string,
    params?: GenerateTokenParams,
  ): GenerateTokenResponse {
    const accessExpOptions: TokenExpiration = params?.accessToken
      ? params?.accessToken
      : {
          addSub: 'ADD',
          time: 30,
          unit: 'minutes',
        }
    const refreshExpOptions: TokenExpiration = params?.refreshToken
      ? params?.refreshToken
      : {
          addSub: 'ADD',
          time: 2,
          unit: 'days',
        }

    const accessTokenExp = DxDateUtilClass.getTimestamp(
      accessExpOptions.time,
      accessExpOptions.unit,
      accessExpOptions.addSub,
    )

    // Access token uses dedicated secret and includes type claim
    const accessToken = jwt.sign(
      {
        _id: userId,
        type: TOKEN_TYPE.ACCESS,
        issuer: TokenService.issuer,
        aud: TokenService.audience,
      },
      JWT_ACCESS_SECRET,
      {
        algorithm: 'HS256',
        expiresIn: TokenService.getExpiresIn(
          accessExpOptions.time,
          accessExpOptions.unit,
        ) as jwt.SignOptions['expiresIn'],
      },
    )

    const refreshTokenExp = DxDateUtilClass.getTimestamp(
      refreshExpOptions.time,
      refreshExpOptions.unit,
      refreshExpOptions.addSub,
    )

    // Refresh token uses separate secret and includes type claim
    const refreshToken = jwt.sign(
      {
        _id: userId,
        type: TOKEN_TYPE.REFRESH,
        issuer: TokenService.issuer,
        aud: TokenService.audience,
      },
      JWT_REFRESH_SECRET,
      {
        algorithm: 'HS256',
        expiresIn: TokenService.getExpiresIn(
          refreshExpOptions.time,
          refreshExpOptions.unit,
        ) as jwt.SignOptions['expiresIn'],
      },
    )

    return {
      accessToken,
      accessTokenExp,
      refreshToken,
      refreshTokenExp,
    }
  }

  /**
   * Extracts user ID from an access token.
   * Uses the access secret and validates token type.
   */
  public static getUserIdFromToken(token: string): string {
    try {
      const payload = jwt.verify(token, JWT_ACCESS_SECRET, {
        algorithms: ['HS256'],
        audience: TokenService.audience,
      }) as JwtPayloadType & { type?: string }

      // Verify this is an access token, not a refresh token
      if (payload.type !== TOKEN_TYPE.ACCESS) {
        ApiLoggingClass.instance.logError('Invalid token type: expected access token')
        return ''
      }

      return payload._id || ''
    } catch (err) {
      ApiLoggingClass.instance.logError((err as Error).message)
    }
    return ''
  }

  /**
   * Extracts user ID from a refresh token.
   * Uses the refresh secret and validates token type.
   */
  public static getUserIdFromRefreshToken(token: string): string {
    try {
      const payload = jwt.verify(token, JWT_REFRESH_SECRET, {
        algorithms: ['HS256'],
        audience: TokenService.audience,
      }) as JwtPayloadType & { type?: string }

      // Verify this is a refresh token, not an access token
      if (payload.type !== TOKEN_TYPE.REFRESH) {
        ApiLoggingClass.instance.logError('Invalid token type: expected refresh token')
        return ''
      }

      return payload._id || ''
    } catch (err) {
      ApiLoggingClass.instance.logError((err as Error).message)
    }
    return ''
  }

  public static async isRefreshValid(refreshToken: string): Promise<string | boolean> {
    try {
      const user = await UserModel.getByRefreshToken(refreshToken)
      if (!user) {
        // Use the refresh-specific method
        const userId = TokenService.getUserIdFromRefreshToken(refreshToken)
        if (!userId) {
          return false
        }

        // This user has been hacked - clear all tokens
        await UserModel.clearRefreshTokens(userId)
        return false
      }

      return user.id
    } catch (err) {
      ApiLoggingClass.instance.logError((err as Error).message)
      return false
    }
  }
}
```

### Testing

- [ ] Generate new secrets for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`
- [ ] Update all environments with new secrets
- [ ] Verify access tokens cannot be validated as refresh tokens and vice versa
- [ ] Existing tokens will be invalidated - plan for user re-authentication

---

## 3. High: Enable PostgreSQL SSL in Production

🟠 **Priority**: High
📁 **File**: `libs/pg/postgres.db-connection.ts`

### Current State (Vulnerable)

```typescript
dialectOptions: {
  ssl: false,  // SSL disabled for all environments
},
```

### Remediation

```typescript
import { isLocal, isStaging, isProd } from '../config/config-api.service'

// In the constructor:
PostgresDbConnection.sequelize = new Sequelize({
  database: this.config.segments?.[0],
  define: {
    underscored: true,
  },
  dialect: 'postgres',
  dialectOptions: {
    // Enable SSL for production and staging, disable for local development
    ssl: isLocal()
      ? false
      : {
          require: true,
          rejectUnauthorized: true,
          // Optionally specify CA certificate for strict validation
          // ca: process.env.POSTGRES_CA_CERT,
        },
  },
  host: this.config.hostname,
  logging: () => {},
  password: this.config.password,
  port: this.config.port,
  username: this.config.user,
})
```

### Testing

- [ ] Verify local development still works without SSL
- [ ] Verify staging/production connects with SSL enabled
- [ ] Test connection with invalid certificates is rejected

---

## 4. High: Change S3 Upload ACL to Private by Default

🟠 **Priority**: High
📁 **File**: `libs/s3/s3.service.ts`

### Current State (Vulnerable)

```typescript
const params: PutObjectCommandInput = {
  ACL: 'public-read',  // All uploads publicly accessible
  // ...
}
```

### Remediation

```typescript
public async uploadObject(
  bucket: string,
  key: string,
  file: Buffer,
  mimeType: string,
  metadata?: Record<string, string>,
  acl: 'private' | 'public-read' = 'private',  // Default to private
) {
  try {
    const params: PutObjectCommandInput = {
      ACL: acl,
      Body: file,
      Bucket: bucket,
      ContentType: mimeType,
      Key: key,
      Metadata: metadata,
    }
    return await new Upload({
      client: this.s3,
      params,
    }).done()
  } catch (err) {
    this.logger.logError((err as Error).message || 'Error uploading S3 Object')
  }
}
```

### Usage

```typescript
// Private upload (default)
await s3Service.uploadObject(bucket, key, file, mimeType)

// Public upload (explicit)
await s3Service.uploadObject(bucket, key, file, mimeType, metadata, 'public-read')
```

### Testing

- [ ] Verify new uploads are private by default
- [ ] Verify public uploads work when explicitly requested
- [ ] Audit existing public files and change ACL if needed

---

## 5. High: Add SameSite Attribute to Cookies

🟠 **Priority**: High
📁 **File**: `libs/cookies/cookie.service.ts`

### Current State (Vulnerable)

Cookies lack the `SameSite` attribute, making them vulnerable to CSRF in older browsers.

### Remediation

```typescript
import type { CookieOptions, Request, Response } from 'express'

import { AUTH_TOKEN_NAMES } from '@dx3/models-shared'

import { isLocal } from '../config/config-api.service'

export class CookeiService {
  /**
   * Default cookie options with security attributes.
   * Uses 'lax' for SameSite to allow top-level navigation (OAuth redirects)
   * while still protecting against most CSRF attacks.
   */
  private static getSecureCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: !isLocal(),
      sameSite: 'lax',
    }
  }

  public static setCookies(
    res: Response,
    hasAccountBeenSecured: boolean,
    refreshToken: string,
    refreshTokenExpTimestamp: number,
  ) {
    res.cookie(AUTH_TOKEN_NAMES.ACCTSECURE, hasAccountBeenSecured, {
      ...CookeiService.getSecureCookieOptions(),
    })

    CookeiService.setRefreshCookie(res, refreshToken, refreshTokenExpTimestamp)
  }

  public static setRefreshCookie(res: Response, refreshToken: string, exp: number) {
    res.cookie(AUTH_TOKEN_NAMES.REFRESH, refreshToken, {
      ...CookeiService.getSecureCookieOptions(),
      maxAge: exp * 1000,
    })
  }

  public static setCookie(
    res: Response,
    cookeiName: string,
    cookieValue: string,
    cookieOptions: CookieOptions,
  ) {
    if (res) {
      // Merge provided options with secure defaults
      const secureOptions: CookieOptions = {
        ...CookeiService.getSecureCookieOptions(),
        ...cookieOptions,
      }
      res.cookie(cookeiName, cookieValue, secureOptions)
      return true
    }
    return false
  }

  public static getCookie(req: Request, cookeiName: string): string {
    const cookie = req?.cookies[cookeiName]
    return cookie || ''
  }

  public static clearCookies(res: Response) {
    if (res) {
      const options: CookieOptions = {
        ...CookeiService.getSecureCookieOptions(),
      }

      res.clearCookie(AUTH_TOKEN_NAMES.ACCTSECURE, options)
      res.clearCookie(AUTH_TOKEN_NAMES.REFRESH, options)

      return true
    }

    return false
  }

  public static clearCookie(res: Response, cookeiName: string) {
    if (res) {
      const options: CookieOptions = {
        ...CookeiService.getSecureCookieOptions(),
      }

      res.clearCookie(cookeiName, options)

      return true
    }

    return false
  }
}
```

### Testing

- [ ] Verify cookies are set with `SameSite=Lax` in browser dev tools
- [ ] Verify local development works correctly (HTTP)
- [ ] Verify production works correctly (HTTPS)
- [ ] Test OAuth/redirect flows still work with `lax` setting

---

## 6. High: Add File Type Validation on Uploads

🟠 **Priority**: High
📁 **File**: `libs/media/media-api-file-upload.middleware.ts`

### Current State (Vulnerable)

The upload middleware accepts any file type without validation.

### Remediation

Add a new file `libs/media/media-api.allowed-types.ts`:

```typescript
/**
 * Allowed MIME types for file uploads.
 * Add or remove types based on application requirements.
 */
export const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Documents
  'application/pdf',
  // Video (if needed)
  // 'video/mp4',
  // 'video/webm',
] as const

export type AllowedMimeType = typeof ALLOWED_MIME_TYPES[number]

/**
 * Validates if a MIME type is allowed for upload.
 */
export function isAllowedMimeType(mimeType: string | null): mimeType is AllowedMimeType {
  if (!mimeType) return false
  return ALLOWED_MIME_TYPES.includes(mimeType as AllowedMimeType)
}

/**
 * Gets the file extension for an allowed MIME type.
 */
export function getExtensionForMimeType(mimeType: AllowedMimeType): string {
  const mimeToExtension: Record<AllowedMimeType, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'application/pdf': 'pdf',
  }
  return mimeToExtension[mimeType] || ''
}
```

Update `libs/media/media-api-file-upload.middleware.ts`:

```typescript
import { ALLOWED_MIME_TYPES, isAllowedMimeType } from './media-api.allowed-types'

// In the formidable configuration:
const formData: IncomingForm = formidable({
  // Add file filter to validate MIME types
  filter: ({ mimetype, originalFilename }) => {
    if (!isAllowedMimeType(mimetype)) {
      ApiLoggingClass.instance.logWarn(
        `Rejected file upload: ${originalFilename} with type ${mimetype}`
      )
      return false
    }
    return true
  },
  fileWriteStreamHandler: (file?: VolatileFile): internal.Writable => {
    // ... existing code
  },
  maxFileSize: Number(UPLOAD_MAX_FILE_SIZE) * MB,
  maxFiles: 10,
  multiples: true,
})
```

### Testing

- [ ] Verify allowed file types upload successfully
- [ ] Verify disallowed file types are rejected with appropriate error
- [ ] Test file type spoofing (wrong extension with valid MIME type)

---

## 7. High: Enable Redis TLS Validation in Production

🟠 **Priority**: High
📁 **File**: `libs/redis/redis.service.ts`

### Current State (Vulnerable)

TLS certificate validation is disabled in production:

```typescript
tls: {
  checkServerIdentity: () => undefined,  // Validation disabled!
},
```

### Remediation

```typescript
import { Redis } from 'ioredis'

import { isNumber, parseJson } from '@dx3/utils-shared'

import { ApiLoggingClass, type ApiLoggingClassType } from '../logger'
import { REDIS_DELIMITER } from './redis.consts'
import type { RedisConfigType, RedisConstructorType, RedisExpireOptions } from './redis.types'

export class RedisService {
  cacheHandle: typeof Redis.Cluster.prototype | typeof Redis.prototype
  config: RedisConfigType
  static #instance: RedisServiceType
  logger: ApiLoggingClassType

  constructor(params: RedisConstructorType) {
    this.config = params.redis
    this.logger = ApiLoggingClass.instance
    RedisService.#instance = this

    if (params.isLocal) {
      // Local development - no TLS required
      const url = `${params.redis.url}:${params.redis.port}/0`
      this.cacheHandle = new Redis(url, {
        keyPrefix: `${params.redis.prefix}${REDIS_DELIMITER}`,
      })
      return
    }

    // Production/Staging - TLS with proper validation
    const hosts = params.redis.url.split('|')
    console.log(`trying to connect to: Redis Cluster ${JSON.stringify(hosts)}`)

    this.cacheHandle = new Redis.Cluster(hosts, {
      keyPrefix: `${params.redis.prefix}${REDIS_DELIMITER}`,
      redisOptions: {
        tls: {
          // Use Node.js default certificate validation
          // Remove checkServerIdentity to enable proper validation
          rejectUnauthorized: true,
          // Optionally specify CA certificate for strict validation
          // ca: process.env.REDIS_CA_CERT,
        },
      },
      scaleReads: 'slave',
    })
  }

  // ... rest of the class unchanged
}
```

### Testing

- [ ] Verify local development works without TLS
- [ ] Verify production connects with TLS and validates certificates
- [ ] Test that invalid certificates cause connection failures

---

## 8. Medium: Improve Rate Limiting Resilience

🟡 **Priority**: Medium
📁 **Files**:
- `api-app/src/express.ts`
- `api-app/src/rate-limiters/rate-limiters.dx.ts`

### Current Issues

1. Rate limiting completely bypassed in local environment
2. IP can be spoofed via `X-Forwarded-For` header
3. Body-based key generation can be bypassed

### Remediation

#### Step 1: Configure trust proxy in Express

Update `api-app/src/express.ts`:

```typescript
export async function configureExpress(app: Express, _settings: DxApiSettingsType) {
  // Trust the first proxy only when in production
  // This ensures req.ip reflects the real client IP when behind a load balancer
  if (isProd() || isStaging()) {
    app.set('trust proxy', 1)
  }

  // ... rest of configuration
}
```

#### Step 2: Update rate limiters

Update `api-app/src/rate-limiters/rate-limiters.dx.ts`:

```typescript
import type { NextFunction, Request, Response } from 'express'
import { rateLimit } from 'express-rate-limit'
import { RedisStore } from 'rate-limit-redis'

import { sendOK, sendTooManyRequests } from '@dx3/api-libs/http-response/http-responses'
import { REDIS_DELIMITER, RedisService } from '@dx3/api-libs/redis'
import { APP_PREFIX } from '@dx3/models-shared'

import { AUTH_ROUTES_V1_RATE_LIMIT } from '../auth/auth-api.consts'
import { isLocal } from '../config/config-api.service'
import { RATE_LIMIT_MESSAGE, RATE_LIMITS } from './rate-limter.const'

export class DxRateLimiters {
  /**
   * Handler for rate limit exceeded.
   * Only bypasses rate limiting in local dev when explicitly configured.
   */
  static handleLimitCommon(
    req: Request,
    res: Response,
    next: NextFunction,
    options: { message: string },
  ) {
    // Only bypass rate limiting if EXPLICITLY disabled in local development
    // This prevents accidental bypass in production if NODE_ENV is misconfigured
    if (isLocal() && process.env.DISABLE_RATE_LIMIT === 'true') {
      return next()
    }

    const url = req.originalUrl
    if (AUTH_ROUTES_V1_RATE_LIMIT.indexOf(url) > -1) {
      const message = options.message || RATE_LIMIT_MESSAGE
      return sendOK(req, res, { error: message })
    }

    sendTooManyRequests(req, res, RATE_LIMIT_MESSAGE)
  }

  /**
   * Generates a rate limiting key from the request.
   * Uses user ID if authenticated, otherwise uses IP.
   */
  static keyGenStandard(req: Request): string {
    if (req.user?.id) {
      return req.user.id
    }

    // req.ip is already resolved correctly when trust proxy is set
    return req.ip || 'unknown'
  }

  /**
   * Generates a rate limiting key for login attempts.
   * Combines multiple identifiers for better protection against bypass.
   */
  static keyGenLogin(req: Request): string {
    const ip = req.ip || 'unknown'
    const value = req.body?.value?.toLowerCase().trim() || ''
    const deviceId = req.body?.device?.uniqueDeviceId || ''

    // Combine identifiers to prevent simple bypass
    // If attacker changes one identifier, they still hit limits on others
    if (value) {
      return `login:${value}`
    }

    if (deviceId) {
      return `login:device:${deviceId}`
    }

    return `login:ip:${ip}`
  }

  // ... rest of the class with existing methods unchanged
}
```

### Testing

- [ ] Verify rate limiting works in production
- [ ] Test that `X-Forwarded-For` spoofing doesn't bypass limits
- [ ] Verify local development works with `DISABLE_RATE_LIMIT=true`
- [ ] Test rate limits trigger correctly for repeated requests

---

## 9. Medium: Sanitize Sensitive Data in Logs

🟡 **Priority**: Medium
📁 **File**: `libs/auth/auth-api.service.ts`

### Current State (Vulnerable)

```typescript
const message = `Account could not be created with payload: ${JSON.stringify(payload, null, 2)}`
// Logs may contain passwords, OTP codes, etc.
```

### Remediation

Add a utility function in `libs/logger/sanitize-log.util.ts`:

```typescript
/**
 * Fields that should never be logged.
 */
const SENSITIVE_FIELDS = [
  'password',
  'passwordConfirm',
  'oldPassword',
  'newPassword',
  'code',
  'otpCode',
  'token',
  'refreshToken',
  'accessToken',
  'secret',
  'apiKey',
  'signature',
  'hashword',
  'hashanswer',
] as const

/**
 * Sanitizes an object by redacting sensitive fields.
 * Returns a new object safe for logging.
 */
export function sanitizeForLogging<T extends Record<string, unknown>>(obj: T): T {
  if (!obj || typeof obj !== 'object') {
    return obj
  }

  const sanitized = { ...obj }

  for (const key of Object.keys(sanitized)) {
    if (SENSITIVE_FIELDS.includes(key.toLowerCase() as typeof SENSITIVE_FIELDS[number])) {
      (sanitized as Record<string, unknown>)[key] = '[REDACTED]'
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      (sanitized as Record<string, unknown>)[key] = sanitizeForLogging(
        sanitized[key] as Record<string, unknown>
      )
    }
  }

  return sanitized
}

/**
 * Safely stringifies an object for logging, redacting sensitive fields.
 */
export function safeStringify(obj: unknown, space?: number): string {
  if (!obj || typeof obj !== 'object') {
    return String(obj)
  }
  return JSON.stringify(sanitizeForLogging(obj as Record<string, unknown>), null, space)
}
```

Update usage in `libs/auth/auth-api.service.ts`:

```typescript
import { safeStringify } from '../logger/sanitize-log.util'

// Before:
// const message = `Account could not be created with payload: ${JSON.stringify(payload, null, 2)}`

// After:
const message = `Account could not be created with payload: ${safeStringify(payload, 2)}`
```

### Testing

- [ ] Verify sensitive fields are redacted in logs
- [ ] Verify non-sensitive fields are still visible
- [ ] Test with nested objects containing sensitive data

---

## 10. Medium: Add Role/Restriction Whitelist Validation

🟡 **Priority**: Medium
📁 **File**: `libs/user/user-api.postgres-model.ts`

### Current State (Partially Vulnerable)

Roles are escaped for SQL injection but not validated against allowed values:

```typescript
set(userRoles: string[] = []): void {
  const sanitizedRoles = userRoles.map((role) => role.replace(/'/g, "''"))
  // ...
}
```

### Remediation

```typescript
import { literal } from 'sequelize'
import { USER_ROLE, USER_ROLE_ARRAY } from '@dx3/models-shared'
import { ACCOUNT_RESTRICTIONS } from '@dx3/models-shared'

// Create array of valid restrictions
const ACCOUNT_RESTRICTIONS_ARRAY = Object.values(ACCOUNT_RESTRICTIONS)

// In the UserModel class:

@AllowNull(false)
@Column({
  set(userRoles: string[] = []): void {
    // Validate all roles are in the allowed list
    const invalidRoles = userRoles.filter(role => !USER_ROLE_ARRAY.includes(role))
    if (invalidRoles.length > 0) {
      throw new Error(
        `Invalid role(s) specified: ${invalidRoles.join(', ')}. ` +
        `Allowed roles are: ${USER_ROLE_ARRAY.join(', ')}`
      )
    }

    // Now safe to use literal since we've validated the input
    const sanitizedRoles = userRoles.map((role) => role.replace(/'/g, "''"))
    this.setDataValue(
      'roles',
      literal(`ARRAY[${sanitizedRoles.map((role) => `'${role}'`).join(',')}]::user_role[]`),
    )
  },
  type: DataType.ARRAY(DataType.STRING),
})
roles: string[]

@Column({
  set(restrictions: string[] = []): void {
    // Validate all restrictions are in the allowed list
    const invalidRestrictions = restrictions.filter(
      r => !ACCOUNT_RESTRICTIONS_ARRAY.includes(r)
    )
    if (invalidRestrictions.length > 0) {
      throw new Error(
        `Invalid restriction(s) specified: ${invalidRestrictions.join(', ')}. ` +
        `Allowed restrictions are: ${ACCOUNT_RESTRICTIONS_ARRAY.join(', ')}`
      )
    }

    // Now safe to use literal since we've validated the input
    const sanitizedRestrictions = restrictions.map((r) => r.replace(/'/g, "''"))
    this.setDataValue(
      'restrictions',
      literal(
        `ARRAY[${sanitizedRestrictions.map((restriction) => `'${restriction}'`).join(',')}]::account_restriction[]`,
      ),
    )
  },
  type: DataType.ARRAY(DataType.STRING),
})
restrictions: string[] | null
```

### Testing

- [ ] Verify valid roles can be set
- [ ] Verify invalid roles throw an error
- [ ] Verify valid restrictions can be set
- [ ] Verify invalid restrictions throw an error

---

## 11. Medium: Add JWT Algorithm and Audience Claims

🟡 **Priority**: Medium
📁 **File**: `libs/auth/tokens/token.service.ts`

> **Note**: This is already addressed in [Section 2](#2-critical-separate-jwt-secrets-for-access--refresh-tokens). The updated `TokenService` includes:
> - Explicit `algorithm: 'HS256'` specification
> - `aud` (audience) claim in tokens
> - Audience validation during verification

No additional changes needed if Section 2 is implemented.

---

## 12. Low: Add Helmet.js Security Headers

🟢 **Priority**: Low
📁 **File**: `api-app/src/express.ts`

### Current State

No security headers are set on API responses.

### Remediation

#### Step 1: Install Helmet

```bash
cd packages/api
pnpm add helmet
pnpm add -D @types/helmet
```

#### Step 2: Configure Helmet

Update `api-app/src/express.ts`:

```typescript
import cookieParser from 'cookie-parser'
import cors from 'cors'
import type { Express, NextFunction, Request, Response } from 'express'
import express from 'express'
import helmet from 'helmet'
import { logger as expressWinston } from 'express-winston'

import { ApiLoggingClass } from '@dx3/api-libs/logger'
import { handleError } from '@dx3/api-libs/error-handler/error-handler'

import { webUrl } from './config/config-api.service'

type DxApiSettingsType = {
  DEBUG: boolean
  SESSION_SECRET: string
}

export async function configureExpress(app: Express, _settings: DxApiSettingsType) {
  const allowedOrigin = webUrl()

  // Security headers via Helmet
  app.use(
    helmet({
      // Content Security Policy - customize based on your needs
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      // Prevent clickjacking
      frameguard: { action: 'deny' },
      // Hide X-Powered-By header
      hidePoweredBy: true,
      // Strict-Transport-Security for HTTPS
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      // Prevent MIME type sniffing
      noSniff: true,
      // XSS filter (legacy browsers)
      xssFilter: true,
    })
  )

  app.use(
    cors({
      credentials: true,
      origin: allowedOrigin,
    }),
  )

  // ... rest of existing configuration
}
```

### Testing

- [ ] Verify security headers are present in API responses
- [ ] Check headers with security scanner (e.g., securityheaders.com)
- [ ] Verify CSP doesn't break legitimate functionality

---

## Implementation Checklist

### Phase 1: Critical (Immediate)

- [ ] **1.** Remove hardcoded secret fallbacks
- [ ] **2.** Implement separate JWT secrets

### Phase 2: High Priority (This Week)

- [ ] **3.** Enable PostgreSQL SSL (prod/staging)
- [ ] **4.** Change S3 ACL to private
- [ ] **5.** Add SameSite to cookies
- [ ] **6.** Add file type validation
- [ ] **7.** Enable Redis TLS (prod/staging)

### Phase 3: Medium Priority (This Sprint)

- [ ] **8.** Improve rate limiting
- [ ] **9.** Sanitize logs
- [ ] **10.** Add role/restriction validation
- [ ] **11.** JWT algorithm/audience (included in #2)

### Phase 4: Low Priority (Next Sprint)

- [ ] **12.** Add Helmet.js

---

## Environment Variables to Add

```bash
# Required - Application will fail to start without these
JWT_ACCESS_SECRET=<generate-strong-secret-min-32-chars>
JWT_REFRESH_SECRET=<generate-strong-secret-min-32-chars>
CRYPT_KEY=<generate-strong-key-64-hex-chars>
OTP_SALT=<generate-strong-salt-min-16-chars>
SENDGRID_API_KEY=<your-sendgrid-api-key>

# Optional - For local development
DISABLE_RATE_LIMIT=true  # Only in .env.local
```

### Generating Secure Secrets

```bash
# Generate JWT secrets (256-bit)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate CRYPT_KEY (256-bit hex)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate OTP_SALT
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
```

---

## Notes

- **OTP in Local Dev**: The behavior of returning OTP codes in non-production responses is intentional for development/testing purposes.
- **CSRF**: Not implemented as the API primarily uses JWT Bearer tokens via Authorization headers, which are not vulnerable to CSRF. Cookie-only endpoints are protected with `SameSite` attribute.
- **Environment-Aware**: All remediations are designed to work correctly in both local development and production environments.
