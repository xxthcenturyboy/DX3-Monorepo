import type { ModelCtor } from 'sequelize-typescript'

import type { PostgresConnectionParamsType, PostgresUrlObject } from './postgres.types'

describe('postgres.types', () => {
  describe('PostgresUrlObject', () => {
    it('should be defined', () => {
      const urlObject: PostgresUrlObject = {
        params: {},
      }
      expect(urlObject).toBeDefined()
    })

    it('should allow all optional properties', () => {
      const urlObject: PostgresUrlObject = {
        host: 'localhost:5432',
        hostname: 'localhost',
        params: {},
        password: 'testpass',
        port: 5432,
        protocol: 'postgres',
        segments: ['database'],
        user: 'testuser',
      }
      expect(urlObject.protocol).toBe('postgres')
      expect(urlObject.user).toBe('testuser')
      expect(urlObject.password).toBe('testpass')
      expect(urlObject.host).toBe('localhost:5432')
      expect(urlObject.hostname).toBe('localhost')
      expect(urlObject.port).toBe(5432)
      expect(urlObject.segments).toEqual(['database'])
    })

    it('should have params property of any type', () => {
      const urlObject: PostgresUrlObject = {
        params: { key: 'value', nested: { data: 123 } },
      }
      expect(urlObject.params).toBeDefined()
      expect(urlObject.params.key).toBe('value')
      expect(urlObject.params.nested.data).toBe(123)
    })

    it('should allow protocol to be optional', () => {
      const urlObject: PostgresUrlObject = {
        params: {},
        user: 'test',
      }
      expect(urlObject.protocol).toBeUndefined()
    })

    it('should allow user to be optional', () => {
      const urlObject: PostgresUrlObject = {
        params: {},
        protocol: 'postgres',
      }
      expect(urlObject.user).toBeUndefined()
    })

    it('should allow password to be optional', () => {
      const urlObject: PostgresUrlObject = {
        params: {},
        user: 'test',
      }
      expect(urlObject.password).toBeUndefined()
    })

    it('should allow host to be optional', () => {
      const urlObject: PostgresUrlObject = {
        hostname: 'localhost',
        params: {},
      }
      expect(urlObject.host).toBeUndefined()
    })

    it('should allow hostname to be optional', () => {
      const urlObject: PostgresUrlObject = {
        host: 'localhost:5432',
        params: {},
      }
      expect(urlObject.hostname).toBeUndefined()
    })

    it('should allow port to be optional', () => {
      const urlObject: PostgresUrlObject = {
        hostname: 'localhost',
        params: {},
      }
      expect(urlObject.port).toBeUndefined()
    })

    it('should allow segments to be optional', () => {
      const urlObject: PostgresUrlObject = {
        hostname: 'localhost',
        params: {},
      }
      expect(urlObject.segments).toBeUndefined()
    })

    it('should have port as number type', () => {
      const urlObject: PostgresUrlObject = {
        params: {},
        port: 5432,
      }
      expect(typeof urlObject.port).toBe('number')
    })

    it('should have segments as array of strings', () => {
      const urlObject: PostgresUrlObject = {
        params: {},
        segments: ['db1', 'db2'],
      }
      expect(Array.isArray(urlObject.segments)).toBe(true)
      expect(urlObject.segments.every((s) => typeof s === 'string')).toBe(true)
    })

    it('should allow empty params object', () => {
      const urlObject: PostgresUrlObject = {
        params: {},
      }
      expect(urlObject.params).toEqual({})
    })

    it('should allow null params', () => {
      const urlObject: PostgresUrlObject = {
        params: null,
      }
      expect(urlObject.params).toBeNull()
    })

    it('should support full URL structure', () => {
      const urlObject: PostgresUrlObject = {
        host: 'db.example.com:5432',
        hostname: 'db.example.com',
        params: { ssl: 'true' },
        password: 'secret',
        port: 5432,
        protocol: 'postgres',
        segments: ['production', 'main'],
        user: 'admin',
      }
      expect(urlObject).toMatchObject({
        host: 'db.example.com:5432',
        hostname: 'db.example.com',
        params: { ssl: 'true' },
        password: 'secret',
        port: 5432,
        protocol: 'postgres',
        segments: ['production', 'main'],
        user: 'admin',
      })
    })
  })

  describe('PostgresConnectionParamsType', () => {
    it('should be defined', () => {
      const mockModel = {} as ModelCtor
      const params: PostgresConnectionParamsType = {
        models: [mockModel],
        postgresUri: 'postgres://localhost/db',
      }
      expect(params).toBeDefined()
    })

    it('should have models property as array of ModelCtor', () => {
      const mockModel = {} as ModelCtor
      const params: PostgresConnectionParamsType = {
        models: [mockModel],
        postgresUri: 'postgres://localhost/db',
      }
      expect(Array.isArray(params.models)).toBe(true)
      expect(params.models.length).toBe(1)
    })

    it('should have postgresUri property as string', () => {
      const mockModel = {} as ModelCtor
      const params: PostgresConnectionParamsType = {
        models: [mockModel],
        postgresUri: 'postgres://localhost/db',
      }
      expect(typeof params.postgresUri).toBe('string')
    })

    it('should allow empty models array', () => {
      const params: PostgresConnectionParamsType = {
        models: [],
        postgresUri: 'postgres://localhost/db',
      }
      expect(params.models).toEqual([])
    })

    it('should allow multiple models', () => {
      const mockModel1 = {} as ModelCtor
      const mockModel2 = {} as ModelCtor
      const mockModel3 = {} as ModelCtor
      const params: PostgresConnectionParamsType = {
        models: [mockModel1, mockModel2, mockModel3],
        postgresUri: 'postgres://localhost/db',
      }
      expect(params.models.length).toBe(3)
    })

    it('should support various postgresUri formats', () => {
      const mockModel = {} as ModelCtor
      const params1: PostgresConnectionParamsType = {
        models: [mockModel],
        postgresUri: 'postgres://user:pass@host:5432/db',
      }
      const params2: PostgresConnectionParamsType = {
        models: [mockModel],
        postgresUri: 'postgresql://localhost/testdb',
      }
      expect(params1.postgresUri).toContain('postgres://')
      expect(params2.postgresUri).toContain('postgresql://')
    })

    it('should have both required properties', () => {
      const mockModel = {} as ModelCtor
      const params: PostgresConnectionParamsType = {
        models: [mockModel],
        postgresUri: 'postgres://localhost/db',
      }
      expect(params).toHaveProperty('models')
      expect(params).toHaveProperty('postgresUri')
    })
  })

  describe('Type Integration', () => {
    it('should work together in a complete configuration', () => {
      const mockModel = {} as ModelCtor
      const connectionParams: PostgresConnectionParamsType = {
        models: [mockModel],
        postgresUri: 'postgres://user:pass@localhost:5432/mydb',
      }

      const urlObject: PostgresUrlObject = {
        host: 'localhost:5432',
        hostname: 'localhost',
        params: {},
        password: 'pass',
        port: 5432,
        protocol: 'postgres',
        segments: ['mydb'],
        user: 'user',
      }

      expect(connectionParams).toBeDefined()
      expect(urlObject).toBeDefined()
      expect(connectionParams.models).toBeDefined()
      expect(urlObject.hostname).toBeDefined()
    })

    it('should support type checking for ModelCtor array', () => {
      const mockModels: ModelCtor[] = [{} as ModelCtor, {} as ModelCtor]
      const params: PostgresConnectionParamsType = {
        models: mockModels,
        postgresUri: 'postgres://localhost/db',
      }
      expect(params.models).toBe(mockModels)
    })
  })

  describe('Type Exports', () => {
    it('should export PostgresUrlObject type', () => {
      const _typeCheck: PostgresUrlObject = {
        params: {},
      }
      expect(_typeCheck).toBeDefined()
    })

    it('should export PostgresConnectionParamsType type', () => {
      const mockModel = {} as ModelCtor
      const _typeCheck: PostgresConnectionParamsType = {
        models: [mockModel],
        postgresUri: 'postgres://localhost/db',
      }
      expect(_typeCheck).toBeDefined()
    })
  })
})
