import { SocketApiConnection, type SocketApiConnectionType } from './index'

describe('index', () => {
  describe('Exports', () => {
    it('should export SocketApiConnection', () => {
      expect(SocketApiConnection).toBeDefined()
    })

    it('should export SocketApiConnection as a class', () => {
      expect(typeof SocketApiConnection).toBe('function')
      expect(SocketApiConnection.name).toBe('SocketApiConnection')
    })
  })

  describe('Named Exports', () => {
    it('should allow importing SocketApiConnection', () => {
      expect(SocketApiConnection).toBeDefined()
    })

    it('should have correct class structure', () => {
      expect(SocketApiConnection.prototype).toBeDefined()
      expect(SocketApiConnection.prototype.constructor).toBe(SocketApiConnection)
    })
  })

  describe('Type Exports', () => {
    it('should export SocketApiConnectionType type', () => {
      // TypeScript compilation will fail if this type is not exported
      // Types don't exist at runtime, so we verify by attempting to use the type
      const testType = {} as SocketApiConnectionType
      expect(testType).toBeDefined()
    })

    it('should allow using SocketApiConnectionType', () => {
      // Verify the type can be used in type annotations
      const connection: SocketApiConnectionType = {} as SocketApiConnectionType
      expect(connection).toBeDefined()
    })
  })

  describe('Re-exports from lib/socket-api.connection', () => {
    it('should re-export SocketApiConnection from lib directory', () => {
      // If import is successful, this should work
      expect(SocketApiConnection).toBeDefined()
      expect(SocketApiConnection.name).toBe('SocketApiConnection')
    })

    it('should maintain class functionality through re-export', () => {
      expect(SocketApiConnection.prototype).toBeDefined()
    })

    it('should have static instance getter method', () => {
      // The instance getter exists but may return undefined if no instance created yet
      expect(SocketApiConnection).toHaveProperty('instance')
    })
  })

  describe('Module Structure', () => {
    it('should provide clean module interface', () => {
      // Verify main exports are accessible
      expect(SocketApiConnection).toBeDefined()
    })

    it('should allow class usage from index', () => {
      expect(typeof SocketApiConnection).toBe('function')
    })
  })

  describe('Type Integrity', () => {
    it('should maintain type definitions across re-export', () => {
      const connectionType: SocketApiConnectionType = {} as SocketApiConnectionType
      expect(connectionType).toBeDefined()
    })

    it('should allow type usage in variable declarations', () => {
      let connection: SocketApiConnectionType
      connection = {} as SocketApiConnectionType
      expect(connection).toBeDefined()
    })
  })

  describe('Class Properties', () => {
    it('should have instance getter method available', () => {
      // The instance getter method exists on the class
      expect(SocketApiConnection).toHaveProperty('instance')
    })

    it('should have prototype defined', () => {
      expect(SocketApiConnection.prototype).toBeDefined()
    })

    it('should have constructor available', () => {
      expect(SocketApiConnection.prototype.constructor).toBe(SocketApiConnection)
    })
  })

  describe('Export Consistency', () => {
    it('should export both class and type', () => {
      expect(SocketApiConnection).toBeDefined()
      const type: SocketApiConnectionType = {} as SocketApiConnectionType
      expect(type).toBeDefined()
    })

    it('should maintain correct export types', () => {
      // Named export
      expect(SocketApiConnection).toBeDefined()
      // Type export
      const _typeCheck: SocketApiConnectionType = {} as SocketApiConnectionType
      expect(_typeCheck).toBeDefined()
    })
  })
})
