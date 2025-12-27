import fs from 'node:fs'

import { getPostgresUriForEnvironment } from './postgres.environment'

// Store original env
const originalEnv = process.env

describe('postgres.environment', () => {
  beforeEach(() => {
    // Reset env before each test
    process.env = { ...originalEnv }
    delete process.env.ROOT_DIR
    delete process.env.POSTGRES_URI
  })

  afterAll(() => {
    // Restore original env
    process.env = originalEnv
  })

  describe('getPostgresUriForEnvironment', () => {
    beforeEach(() => {
      // Default to host environment
      jest.spyOn(fs, 'accessSync').mockImplementation(() => {
        throw new Error('ENOENT')
      })
    })

    it('should throw if POSTGRES_URI is not set', () => {
      expect(() => getPostgresUriForEnvironment()).toThrow(
        'POSTGRES_URI environment variable is not set',
      )
    })

    it('should return URI as-is when running in container', () => {
      process.env.ROOT_DIR = '/app'
      process.env.POSTGRES_URI = 'postgres://pguser:password@postgres-dx3:5432/dx3'

      const uri = getPostgresUriForEnvironment()

      expect(uri).toBe('postgres://pguser:password@postgres-dx3:5432/dx3')
    })

    it('should swap hostname to localhost and port to 5433 when on host', () => {
      process.env.POSTGRES_URI = 'postgres://pguser:password@postgres-dx3:5432/dx3'

      const uri = getPostgresUriForEnvironment()

      expect(uri).toBe('postgres://pguser:password@localhost:5433/dx3')
    })

    it('should preserve all other URI components when swapping', () => {
      process.env.POSTGRES_URI = 'postgres://myuser:mysecret@postgres-dx3:5432/mydb?sslmode=require'

      const uri = getPostgresUriForEnvironment()

      expect(uri).toBe('postgres://myuser:mysecret@localhost:5433/mydb?sslmode=require')
    })

    it('should use custom environment variable name', () => {
      process.env.CUSTOM_POSTGRES = 'postgres://user:pass@custom-host:5432/testdb'

      const uri = getPostgresUriForEnvironment({ envVar: 'CUSTOM_POSTGRES' })

      expect(uri).toBe('postgres://user:pass@localhost:5433/testdb')
    })

    it('should throw on invalid URI', () => {
      process.env.POSTGRES_URI = 'not-a-valid-uri'

      expect(() => getPostgresUriForEnvironment()).toThrow('Failed to parse POSTGRES_URI')
    })
  })
})
