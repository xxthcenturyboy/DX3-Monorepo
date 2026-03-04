import { AxiosInstance, axiosBaseQuery } from './axios-web.api'

jest.mock('./web.api', () => ({
  apiWeb: { middleware: jest.fn(), reducerPath: 'api' },
  getCustomHeaders: jest.fn().mockReturnValue({}),
}))

jest.mock('@dx3/web-libs/utils/fingerprint-web.service', () => ({
  FingerprintWebService: {
    instance: {
      getFingerprint: jest.fn().mockResolvedValue(null),
    },
  },
}))

jest.mock('../../config/config-web.service', () => ({
  WebConfigService: {
    getWebRoutes: jest.fn().mockReturnValue({
      AUTH: { LOGIN: '/login' },
    }),
    getWebUrls: jest.fn().mockReturnValue({
      API_URL: 'http://localhost:4000',
      WEB_APP_URL: 'http://localhost:3000',
    }),
  },
}))

jest.mock('axios', () => {
  const mockInterceptors = {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  }
  const mockInstance = jest.fn().mockResolvedValue({ data: { result: 'ok' }, status: 200 })
  return {
    ...jest.requireActual('axios'),
    create: jest.fn().mockReturnValue(
      Object.assign(mockInstance, {
        interceptors: mockInterceptors,
      }),
    ),
    default: {
      create: jest.fn().mockReturnValue(
        Object.assign(mockInstance, {
          interceptors: mockInterceptors,
        }),
      ),
    },
  }
})

describe('axios-web.api', () => {
  describe('AxiosInstance', () => {
    it('should exist when imported', () => {
      expect(AxiosInstance).toBeDefined()
    })

    it('should be a function', () => {
      expect(typeof AxiosInstance).toBe('function')
    })

    it('should return an axios instance when called', () => {
      const instance = AxiosInstance({ headers: {} })
      expect(instance).toBeDefined()
    })
  })

  describe('axiosBaseQuery', () => {
    it('should exist when imported', () => {
      expect(axiosBaseQuery).toBeDefined()
    })

    it('should be a higher-order function returning a query function', () => {
      const queryFn = axiosBaseQuery({ baseUrl: '' })
      expect(typeof queryFn).toBe('function')
    })

    it('should return a function when called with baseUrl', () => {
      const result = axiosBaseQuery({ baseUrl: 'http://example.com' })
      expect(typeof result).toBe('function')
    })

    it('should return a function when called without arguments', () => {
      const result = axiosBaseQuery()
      expect(typeof result).toBe('function')
    })
  })
})
