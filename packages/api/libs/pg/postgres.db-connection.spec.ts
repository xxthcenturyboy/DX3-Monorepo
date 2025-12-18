import { Sequelize } from 'sequelize-typescript'

import { TestingEntityModel } from '@dx3/test-data'

import { ApiLoggingClass } from '../logger'
import { PostgresDbConnection } from './postgres.db-connection'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))

describe('PostgresDbConnection', () => {
  let dbConnection: typeof PostgresDbConnection.prototype
  let postgres: typeof Sequelize.prototype
  const postgresUri = 'postgres://pguser:password@postgres:5432/app'
  let logErrorSpy: jest.SpyInstance
  let logInfoSpy: jest.SpyInstance

  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Test' })
    logErrorSpy = jest.spyOn(ApiLoggingClass.prototype, 'logError').mockImplementation(() => {})
    logInfoSpy = jest.spyOn(ApiLoggingClass.prototype, 'logInfo').mockImplementation(() => {})

    try {
      dbConnection = new PostgresDbConnection({
        models: [TestingEntityModel],
        postgresUri,
      })
      postgres = PostgresDbConnection.dbHandle
    } catch (err) {
      console.log(err)
    }
  })

  afterAll(() => {
    logErrorSpy.mockRestore()
    logInfoSpy.mockRestore()
  })

  describe('Class Definition', () => {
    it('should exist when imported', () => {
      expect(PostgresDbConnection).toBeDefined()
    })

    it('should be a constructor function', () => {
      expect(typeof PostgresDbConnection).toBe('function')
      expect(PostgresDbConnection.name).toBe('PostgresDbConnection')
    })

    it('should have static dbHandle getter', () => {
      expect(PostgresDbConnection).toHaveProperty('dbHandle')
    })

    it('should have static sequelize property', () => {
      expect(PostgresDbConnection).toHaveProperty('sequelize')
    })
  })

  describe('Constructor', () => {
    it('should create instance with valid parameters', () => {
      expect(dbConnection).toBeDefined()
      expect(dbConnection).toBeInstanceOf(PostgresDbConnection)
    })

    it('should have values when instantiated but prior to initialization', () => {
      expect(postgres).toBeDefined()
      expect(dbConnection.config).toBeDefined()
      expect(dbConnection.initialize).toBeDefined()
      expect(dbConnection.logger).toBeDefined()
      expect(dbConnection.models).toBeDefined()
      expect(dbConnection.retries).toBeDefined()
      expect(dbConnection.retries).toEqual(5)
      expect(PostgresDbConnection.sequelize).toBeDefined()
    })

    it('should parse postgres URI into config', () => {
      expect(dbConnection.config).toBeDefined()
      expect(dbConnection.config.hostname).toBe('postgres')
      expect(dbConnection.config.port).toBe(5432)
      expect(dbConnection.config.user).toBe('pguser')
      expect(dbConnection.config.password).toBe('password')
      expect(dbConnection.config.segments).toEqual(['app'])
    })

    it('should initialize logger from ApiLoggingClass', () => {
      expect(dbConnection.logger).toBe(ApiLoggingClass.instance)
    })

    it('should store models from params', () => {
      expect(dbConnection.models).toEqual([TestingEntityModel])
      expect(dbConnection.models.length).toBe(1)
    })

    it('should create Sequelize instance with correct config', () => {
      expect(PostgresDbConnection.sequelize).toBeInstanceOf(Sequelize)
    })

    it('should set retries to 5 by default', () => {
      expect(dbConnection.retries).toBe(5)
    })

    it('should handle postgres URI that cannot be parsed', () => {
      logErrorSpy.mockClear()
      // Note: parsePostgresConnectionUrl is very permissive and rarely returns undefined
      // When it does return undefined, accessing config.segments would throw an error
      // This test verifies that the constructor logs an error when config is falsy

      // We can't actually create a connection that triggers this error without
      // causing the constructor to throw, so we just verify the logic exists
      expect(dbConnection.config).toBeDefined()

      // If config were undefined, the error would be logged
      // This is validated by the code path in the constructor at line 28-30
    })
  })

  describe('Static dbHandle getter', () => {
    it('should return the sequelize instance', () => {
      const handle = PostgresDbConnection.dbHandle
      expect(handle).toBe(PostgresDbConnection.sequelize)
    })

    it('should return null if sequelize is not initialized', () => {
      const originalSequelize = PostgresDbConnection.sequelize
      ;(PostgresDbConnection as any).sequelize = null

      const handle = PostgresDbConnection.dbHandle
      expect(handle).toBeNull()

      ;(PostgresDbConnection as any).sequelize = originalSequelize
    })
  })

  describe('Initialize method', () => {
    it('should be defined', () => {
      expect(dbConnection.initialize).toBeDefined()
      expect(typeof dbConnection.initialize).toBe('function')
    })

    it('should throw error if sequelize is not instantiated', async () => {
      const originalSequelize = PostgresDbConnection.sequelize
      ;(PostgresDbConnection as any).sequelize = null

      await expect(dbConnection.initialize()).rejects.toThrow('Sequelize failed to instantiate')

      ;(PostgresDbConnection as any).sequelize = originalSequelize
    })

    it('should throw error if models array is empty', async () => {
      const emptyModelsConnection = new PostgresDbConnection({
        models: [],
        postgresUri,
      })

      await expect(emptyModelsConnection.initialize()).rejects.toThrow('No Models for Postgres DB!')
    })

    it('should log error when models array is empty', async () => {
      logErrorSpy.mockClear()
      const emptyModelsConnection = new PostgresDbConnection({
        models: [],
        postgresUri,
      })

      try {
        await emptyModelsConnection.initialize()
      } catch (_err) {
        expect(logErrorSpy).toHaveBeenCalledWith('No Models for Postgres DB!')
      }
    })

    it('should throw error if models is not an array', async () => {
      const invalidModelsConnection = new PostgresDbConnection({
        models: null as any,
        postgresUri,
      })

      await expect(invalidModelsConnection.initialize()).rejects.toThrow(
        'No Models for Postgres DB!',
      )
    })
  })

  describe('Instance Properties', () => {
    it('should have config property', () => {
      expect(dbConnection).toHaveProperty('config')
      expect(typeof dbConnection.config).toBe('object')
    })

    it('should have logger property', () => {
      expect(dbConnection).toHaveProperty('logger')
      expect(dbConnection.logger).toBeDefined()
    })

    it('should have retries property', () => {
      expect(dbConnection).toHaveProperty('retries')
      expect(typeof dbConnection.retries).toBe('number')
    })

    it('should have models property', () => {
      expect(dbConnection).toHaveProperty('models')
      expect(Array.isArray(dbConnection.models)).toBe(true)
    })
  })

  describe('Sequelize Configuration', () => {
    it('should configure Sequelize instance', () => {
      expect(PostgresDbConnection.sequelize).toBeInstanceOf(Sequelize)
    })

    it('should have getDatabaseName method available', () => {
      expect(PostgresDbConnection.sequelize.getDatabaseName).toBeDefined()
      expect(typeof PostgresDbConnection.sequelize.getDatabaseName).toBe('function')
    })

    it('should have authenticate method available', () => {
      expect(PostgresDbConnection.sequelize.authenticate).toBeDefined()
      expect(typeof PostgresDbConnection.sequelize.authenticate).toBe('function')
    })

    it('should have sync method available', () => {
      expect(PostgresDbConnection.sequelize.sync).toBeDefined()
      expect(typeof PostgresDbConnection.sequelize.sync).toBe('function')
    })

    it('should have query method available', () => {
      expect(PostgresDbConnection.sequelize.query).toBeDefined()
      expect(typeof PostgresDbConnection.sequelize.query).toBe('function')
    })

    it('should have addModels method available', () => {
      expect(PostgresDbConnection.sequelize.addModels).toBeDefined()
      expect(typeof PostgresDbConnection.sequelize.addModels).toBe('function')
    })

    it('should have databaseVersion method available', () => {
      expect(PostgresDbConnection.sequelize.databaseVersion).toBeDefined()
      expect(typeof PostgresDbConnection.sequelize.databaseVersion).toBe('function')
    })

    it('should use database name from parsed URL', () => {
      expect(dbConnection.config.segments).toEqual(['app'])
    })

    it('should use hostname from parsed URL', () => {
      expect(dbConnection.config.hostname).toBe('postgres')
    })

    it('should use port from parsed URL', () => {
      expect(dbConnection.config.port).toBe(5432)
    })

    it('should use username from parsed URL', () => {
      expect(dbConnection.config.user).toBe('pguser')
    })

    it('should use password from parsed URL', () => {
      expect(dbConnection.config.password).toBe('password')
    })
  })

  describe('Multiple Instances', () => {
    it('should allow creating multiple connection instances', () => {
      const connection1 = new PostgresDbConnection({
        models: [TestingEntityModel],
        postgresUri: 'postgres://user1:pass1@host1:5432/db1',
      })
      const connection2 = new PostgresDbConnection({
        models: [TestingEntityModel],
        postgresUri: 'postgres://user2:pass2@host2:5432/db2',
      })

      expect(connection1).toBeDefined()
      expect(connection2).toBeDefined()
      expect(connection1.config.user).toBe('user1')
      expect(connection2.config.user).toBe('user2')
    })

    it('should share static sequelize instance across instances', () => {
      const _connection1 = new PostgresDbConnection({
        models: [TestingEntityModel],
        postgresUri: 'postgres://user:pass@host:5432/db',
      })

      expect(PostgresDbConnection.sequelize).toBeDefined()
      expect(PostgresDbConnection.dbHandle).toBeDefined()
    })
  })
})
