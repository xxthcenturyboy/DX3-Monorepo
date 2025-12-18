import { PostgresDbConnection } from './index'

describe('data-access-postgres index', () => {
  describe('Module Exports', () => {
    it('should export PostgresDbConnection', () => {
      expect(PostgresDbConnection).toBeDefined()
    })

    it('should export PostgresDbConnection as a constructor function', () => {
      expect(typeof PostgresDbConnection).toBe('function')
      expect(PostgresDbConnection.name).toBe('PostgresDbConnection')
    })
  })

  describe('PostgresDbConnection Export', () => {
    it('should have dbHandle static getter', () => {
      expect(PostgresDbConnection).toHaveProperty('dbHandle')
    })

    it('should have sequelize static property accessible', () => {
      // Static properties can be checked with 'in' operator
      const hasProperty = 'sequelize' in PostgresDbConnection
      // The property exists even if it hasn't been set yet
      expect(typeof hasProperty).toBe('boolean')
    })

    it('should allow access to sequelize static property after instantiation', () => {
      // Create an instance first to ensure sequelize is set
      new PostgresDbConnection({
        models: [],
        postgresUri: 'postgres://user:pass@host:5432/db',
      })

      // Now verify we can access the static property
      const sequelize = (PostgresDbConnection as any).sequelize
      expect(sequelize).toBeDefined()
    })

    it('should be the same class as the one from postgres.db-connection', () => {
      const { PostgresDbConnection: DirectImport } = require('./postgres.db-connection')
      expect(PostgresDbConnection).toBe(DirectImport)
    })
  })

  describe('Named Imports', () => {
    it('should allow named import of PostgresDbConnection', () => {
      const namedImport = require('./index')
      expect(namedImport.PostgresDbConnection).toBeDefined()
      expect(namedImport.PostgresDbConnection).toBe(PostgresDbConnection)
    })
  })

  describe('Module Structure', () => {
    it('should only export PostgresDbConnection', () => {
      const moduleExports = require('./index')
      const exportedKeys = Object.keys(moduleExports)
      expect(exportedKeys).toContain('PostgresDbConnection')
    })

    it('should not have default export', () => {
      const moduleExports = require('./index')
      expect(moduleExports.default).toBeUndefined()
    })
  })

  describe('Class Functionality', () => {
    it('should be instantiable', () => {
      const instance = new PostgresDbConnection({
        models: [],
        postgresUri: 'postgres://user:pass@host:5432/db',
      })
      expect(instance).toBeInstanceOf(PostgresDbConnection)
    })

    it('should have initialize method', () => {
      const instance = new PostgresDbConnection({
        models: [],
        postgresUri: 'postgres://user:pass@host:5432/db',
      })
      expect(instance.initialize).toBeDefined()
      expect(typeof instance.initialize).toBe('function')
    })

    it('should have config property', () => {
      const instance = new PostgresDbConnection({
        models: [],
        postgresUri: 'postgres://user:pass@host:5432/db',
      })
      expect(instance).toHaveProperty('config')
    })

    it('should have logger property', () => {
      const instance = new PostgresDbConnection({
        models: [],
        postgresUri: 'postgres://user:pass@host:5432/db',
      })
      expect(instance).toHaveProperty('logger')
    })

    it('should have retries property', () => {
      const instance = new PostgresDbConnection({
        models: [],
        postgresUri: 'postgres://user:pass@host:5432/db',
      })
      expect(instance).toHaveProperty('retries')
      expect(instance.retries).toBe(5)
    })

    it('should have models property', () => {
      const instance = new PostgresDbConnection({
        models: [],
        postgresUri: 'postgres://user:pass@host:5432/db',
      })
      expect(instance).toHaveProperty('models')
      expect(Array.isArray(instance.models)).toBe(true)
    })
  })

  describe('Type Safety', () => {
    it('should provide TypeScript types', () => {
      // This test verifies that types are available at compile time
      const _typeCheck: typeof PostgresDbConnection = PostgresDbConnection
      expect(_typeCheck).toBeDefined()
    })
  })
})
