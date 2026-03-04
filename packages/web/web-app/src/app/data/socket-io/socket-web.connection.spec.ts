const mockSocket = {
  auth: {},
  connected: false,
  disconnect: jest.fn(),
  emit: jest.fn(),
  on: jest.fn(),
}

jest.mock('socket.io-client', () => ({
  io: jest.fn().mockReturnValue(mockSocket),
}))

jest.mock('../../store', () => ({
  store: {
    getState: jest.fn().mockReturnValue({ auth: { token: 'test.jwt.token' } }),
  },
}))

jest.mock('../../config/config-web.service', () => ({
  WebConfigService: {
    getWebUrls: jest.fn().mockReturnValue({ API_URL: 'http://localhost:4000' }),
  },
}))

import { io } from 'socket.io-client'

import { SocketWebConnection } from './socket-web.connection'

describe('SocketWebConnection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(io as jest.Mock).mockReturnValue(mockSocket)
  })

  describe('createSocket', () => {
    it('should be a static method', () => {
      expect(typeof SocketWebConnection.createSocket).toBe('function')
    })

    it('should return a socket when called', async () => {
      const socket = await SocketWebConnection.createSocket('/test-ns')
      expect(socket).toBeDefined()
    })

    it('should call io with the correct URL including namespace', async () => {
      await SocketWebConnection.createSocket('/admin-logs')
      expect(io).toHaveBeenCalledWith(expect.stringContaining('/admin-logs'), expect.any(Object))
    })

    it('should include withCredentials: true in socket options', async () => {
      await SocketWebConnection.createSocket('/test')
      expect(io).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ withCredentials: true }),
      )
    })

    it('should pass the auth token in socket auth options', async () => {
      await SocketWebConnection.createSocket('/test')
      expect(io).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          auth: expect.objectContaining({ token: 'test.jwt.token' }),
        }),
      )
    })
  })
})
