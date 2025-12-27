/**
 * Database Configuration for Sequelize CLI Migrations
 *
 * Reads database credentials from environment variables
 * Supports local development, staging, and production environments
 *
 * @fileoverview Sequelize CLI database configuration
 * @module @dx3/api/pg/migrations/database-config
 */

require('dotenv').config()

/**
 * Parse PostgreSQL connection URL into configuration object
 * @param {string} url - PostgreSQL connection URL
 * @returns {object} Parsed configuration object
 */
function parsePostgresUrl(url) {
  if (!url) {
    return null
  }

  try {
    const parsed = new URL(url)
    return {
      database: parsed.pathname.slice(1),
      host: parsed.hostname,
      password: decodeURIComponent(parsed.password || ''),
      port: parseInt(parsed.port, 10) || 5432,
      username: parsed.username,
    }
  } catch (error) {
    console.error('Failed to parse POSTGRES_URI:', error.message)
    return null
  }
}

/**
 * Determine if running in development environment
 * @returns {boolean}
 */
function isDevelopment() {
  const env = process.env.NODE_ENV || 'development'
  return env === 'development' || env === 'local' || env === 'test'
}

/**
 * Get SSL configuration based on environment
 * @returns {boolean|object}
 */
function getSSLConfig() {
  if (isDevelopment()) {
    return false
  }

  return {
    rejectUnauthorized: true,
    require: true,
  }
}

// Parse the connection URL from environment
const postgresConfig = parsePostgresUrl(process.env.POSTGRES_URI)

// Default fallback configuration for local development
const defaultConfig = {
  database: 'dx3',
  host: 'localhost',
  password: 'password',
  port: 5433,
  username: 'pguser',
}

// Merge parsed config with defaults
const config = postgresConfig || defaultConfig

/**
 * Sequelize CLI Configuration Object
 * Exports environment-specific database configurations
 */
module.exports = {
  development: {
    database: config.database,
    dialect: 'postgres',
    dialectOptions: {
      ssl: false,
    },
    host: config.host,
    logging: console.log,
    password: config.password,
    port: config.port,
    username: config.username,
  },
  production: {
    database: config.database,
    dialect: 'postgres',
    dialectOptions: {
      ssl: getSSLConfig(),
    },
    host: config.host,
    logging: false,
    password: config.password,
    pool: {
      acquire: 60000,
      idle: 10000,
      max: 10,
      min: 2,
    },
    port: config.port,
    username: config.username,
  },
  staging: {
    database: config.database,
    dialect: 'postgres',
    dialectOptions: {
      ssl: getSSLConfig(),
    },
    host: config.host,
    logging: false,
    password: config.password,
    pool: {
      acquire: 60000,
      idle: 10000,
      max: 5,
      min: 1,
    },
    port: config.port,
    username: config.username,
  },
  test: {
    database: config.database,
    dialect: 'postgres',
    dialectOptions: {
      ssl: false,
    },
    host: config.host,
    logging: false,
    password: config.password,
    port: config.port,
    username: config.username,
  },
}
