export const APP_DESCRIPTION = 'Boiler plate monorepo: Node, Express, React, Expo, Postgres, Redis'
export const APP_DOMAIN = 'danex.software'
export const APP_NAME = 'DX3'
export const APP_PREFIX = 'dx'
export const APPLE_APP_ID = ''
export const APPLE_WEB_CREDENTIALS = ''
export const COMPANY_NAME = 'Danex Software'
export const DEFAULT_LIMIT = 10
export const DEFAULT_OFFSET = 0
export const DEFAULT_SORT = 'ASC'
export const DEV_ENV_NAME = 'development'
export const ERROR_MSG =
  "Oops! Something went wrong. It's probably nothing you did and most likely our fault. There may be additional info for this message."
export const LOREM =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum"
export const MOBILE_PACKAGE_NAME = 'com.dx'
export const PHONE_DEFAULT_REGION_CODE = 'US'
export const PROD_ENV_NAME = 'production'
export const SHA256_CERT_FINGERPRINT = ''
export const STAGING_ENV_NAME = 'staging'

// ============================================================================
// Multi-App Ecosystem Configuration
// ============================================================================

/**
 * Unique identifier for this application in the ecosystem.
 * Set via environment variable APP_ID.
 * Used for logging partitioning and multi-app architectures.
 *
 * @example 'artefx', 'dan-underwood.com', 'michelleradnia.com'
 */
export const APP_ID = (typeof process !== 'undefined' && process.env?.APP_ID) || 'dx3-default'

/**
 * The APP_ID of the parent dashboard application.
 * Used to determine if current app is the umbrella dashboard.
 */
export const PARENT_DASHBOARD_APP_ID = 'ax-admin'

/**
 * Boolean flag indicating if current app is the parent dashboard.
 * Parent dashboard has read access to all app logs and metrics.
 */
export const IS_PARENT_DASHBOARD_APP = APP_ID === PARENT_DASHBOARD_APP_ID
