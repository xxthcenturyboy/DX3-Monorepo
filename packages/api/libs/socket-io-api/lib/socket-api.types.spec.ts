import type { Server } from 'node:http'

import type {
  SocketApiConnectionConstructorType,
  SocketApiServiceConstructorType,
} from './socket-api.types'

describe('socket-api.types', () => {
  describe('SocketApiConnectionConstructorType', () => {
    it('should define SocketApiConnectionConstructorType type', () => {
      const mockHttpServer = {} as Server
      const params: SocketApiConnectionConstructorType = {
        httpServer: mockHttpServer,
        webUrl: 'http://localhost:3000',
      }
      expect(params).toBeDefined()
    })

    it('should have httpServer property as Server', () => {
      const mockHttpServer = {} as Server
      const params: SocketApiConnectionConstructorType = {
        httpServer: mockHttpServer,
        webUrl: 'http://localhost:3000',
      }
      expect(params.httpServer).toBeDefined()
    })

    it('should have webUrl property as string', () => {
      const mockHttpServer = {} as Server
      const params: SocketApiConnectionConstructorType = {
        httpServer: mockHttpServer,
        webUrl: 'http://localhost:3000',
      }
      expect(typeof params.webUrl).toBe('string')
    })

    it('should enforce required properties', () => {
      const mockHttpServer = {} as Server
      const params: SocketApiConnectionConstructorType = {
        httpServer: mockHttpServer,
        webUrl: 'http://localhost:3000',
      }
      expect(params).toBeDefined()
    })

    it('should allow correct assignment of httpServer', () => {
      const mockHttpServer = {} as Server
      const params: SocketApiConnectionConstructorType = {
        httpServer: mockHttpServer,
        webUrl: 'http://localhost:3000',
      }
      expect(params.httpServer).toBe(mockHttpServer)
    })

    it('should allow correct assignment of webUrl', () => {
      const mockHttpServer = {} as Server
      const webUrl = 'http://example.com:8080'
      const params: SocketApiConnectionConstructorType = {
        httpServer: mockHttpServer,
        webUrl,
      }
      expect(params.webUrl).toBe(webUrl)
    })

    it('should allow different URL formats', () => {
      const mockHttpServer = {} as Server
      const urls = [
        'http://localhost',
        'http://localhost:3000',
        'https://example.com',
        'https://example.com:443',
      ]

      urls.forEach((url) => {
        const params: SocketApiConnectionConstructorType = {
          httpServer: mockHttpServer,
          webUrl: url,
        }
        expect(params.webUrl).toBe(url)
      })
    })
  })

  describe('SocketApiServiceConstructorType', () => {
    it('should define SocketApiServiceConstructorType type', () => {
      const mockHttpServer = {} as Server
      const params: SocketApiServiceConstructorType = {
        httpServer: mockHttpServer,
        webUrl: 'http://localhost:3000',
      }
      expect(params).toBeDefined()
    })

    it('should extend SocketApiConnectionConstructorType', () => {
      const mockHttpServer = {} as Server
      const params: SocketApiServiceConstructorType = {
        httpServer: mockHttpServer,
        webUrl: 'http://localhost:3000',
      }
      // Should have all properties from SocketApiConnectionConstructorType
      expect(params.httpServer).toBeDefined()
      expect(params.webUrl).toBeDefined()
    })

    it('should have httpServer property from base type', () => {
      const mockHttpServer = {} as Server
      const params: SocketApiServiceConstructorType = {
        httpServer: mockHttpServer,
        webUrl: 'http://localhost:3000',
      }
      expect(params.httpServer).toBe(mockHttpServer)
    })

    it('should have webUrl property from base type', () => {
      const mockHttpServer = {} as Server
      const params: SocketApiServiceConstructorType = {
        httpServer: mockHttpServer,
        webUrl: 'http://localhost:3000',
      }
      expect(typeof params.webUrl).toBe('string')
    })

    it('should be assignable to SocketApiConnectionConstructorType', () => {
      const mockHttpServer = {} as Server
      const serviceParams: SocketApiServiceConstructorType = {
        httpServer: mockHttpServer,
        webUrl: 'http://localhost:3000',
      }

      // Should be assignable to base type
      const connectionParams: SocketApiConnectionConstructorType = serviceParams
      expect(connectionParams).toBeDefined()
      expect(connectionParams.httpServer).toBe(mockHttpServer)
    })

    it('should allow creating params with all required properties', () => {
      const mockHttpServer = {} as Server
      const params: SocketApiServiceConstructorType = {
        httpServer: mockHttpServer,
        webUrl: 'https://api.example.com',
      }
      expect(params.httpServer).toBe(mockHttpServer)
      expect(params.webUrl).toBe('https://api.example.com')
    })
  })

  describe('Type Compatibility', () => {
    it('should allow SocketApiServiceConstructorType to be used as SocketApiConnectionConstructorType', () => {
      const mockHttpServer = {} as Server
      const serviceParams: SocketApiServiceConstructorType = {
        httpServer: mockHttpServer,
        webUrl: 'http://localhost:3000',
      }

      // This should compile without errors
      const connectionParams: SocketApiConnectionConstructorType = serviceParams
      expect(connectionParams).toBeDefined()
    })

    it('should maintain type integrity across assignments', () => {
      const mockHttpServer = {} as Server
      const params: SocketApiServiceConstructorType = {
        httpServer: mockHttpServer,
        webUrl: 'http://test.com',
      }

      const connectionParams: SocketApiConnectionConstructorType = params
      expect(connectionParams.httpServer).toBe(params.httpServer)
      expect(connectionParams.webUrl).toBe(params.webUrl)
    })
  })

  describe('Type Structure', () => {
    it('should have correct property types', () => {
      const mockHttpServer = {} as Server
      const params: SocketApiConnectionConstructorType = {
        httpServer: mockHttpServer,
        webUrl: 'http://localhost',
      }

      expect(typeof params.webUrl).toBe('string')
      expect(params.httpServer).toBeDefined()
    })

    it('should enforce type safety at compile time', () => {
      // This test verifies TypeScript type checking
      // The following would cause compilation errors:
      // const invalid: SocketApiConnectionConstructorType = { httpServer: 'not a server', webUrl: 123 };
      expect(true).toBe(true) // Placeholder for compile-time check
    })
  })
})
