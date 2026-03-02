import axios from 'axios'

import { checkDomain, isReferenceDataApiConfigured } from './reference-data-api.client'

const configValues = {
  key: '',
  secret: '',
  url: '',
}

jest.mock('../config/config-api.consts', () => ({
  get REFERENCE_DATA_API_KEY() {
    return configValues.key
  },
  get REFERENCE_DATA_API_SECRET() {
    return configValues.secret
  },
  get REFERENCE_DATA_API_URL() {
    return configValues.url
  },
}))

jest.mock('axios')

const mockAxiosGet = axios.get as jest.MockedFunction<typeof axios.get>

describe('reference-data-api.client', () => {
  beforeEach(() => {
    configValues.url = ''
    configValues.key = ''
    configValues.secret = ''
    jest.clearAllMocks()
  })

  describe('isReferenceDataApiConfigured', () => {
    it('should return false when no config is set', () => {
      expect(isReferenceDataApiConfigured()).toBe(false)
    })

    it('should return false when only URL is set', () => {
      configValues.url = 'https://api.example.com'
      expect(isReferenceDataApiConfigured()).toBe(false)
    })

    it('should return true when url, key, and secret are set', () => {
      configValues.url = 'https://api.example.com'
      configValues.key = 'test-key'
      configValues.secret = 'test-secret'
      expect(isReferenceDataApiConfigured()).toBe(true)
    })
  })

  describe('checkDomain', () => {
    it('should return null when API is not configured', async () => {
      const result = await checkDomain('example.com')
      expect(result).toBeNull()
      expect(mockAxiosGet).not.toHaveBeenCalled()
    })

    it('should return null when domain is empty', async () => {
      configValues.url = 'https://api.example.com'
      configValues.key = 'k'
      configValues.secret = 's'

      const result = await checkDomain('')
      expect(result).toBeNull()
      expect(mockAxiosGet).not.toHaveBeenCalled()
    })

    it('should return null when domain is undefined', async () => {
      configValues.url = 'https://api.example.com'
      configValues.key = 'k'
      configValues.secret = 's'

      const result = await checkDomain(undefined as unknown as string)
      expect(result).toBeNull()
    })

    it('should call axios.get with correct url, headers, and options when configured', async () => {
      configValues.url = 'https://api.example.com'
      configValues.key = 'test-key'
      configValues.secret = 'test-secret'
      mockAxiosGet.mockResolvedValue({ data: { disposable: false, validTld: true }, status: 200 })

      await checkDomain('example.com')

      expect(mockAxiosGet).toHaveBeenCalledWith(
        'https://api.example.com/check/domain/example.com',
        expect.objectContaining({
          headers: {
            'X-API-Key': 'test-key',
            'X-API-Secret': 'test-secret',
          },
          timeout: 5000,
          validateStatus: expect.any(Function),
        }),
      )
    })

    it('should strip trailing slash from API URL', async () => {
      configValues.url = 'https://api.example.com/'
      configValues.key = 'k'
      configValues.secret = 's'
      mockAxiosGet.mockResolvedValue({ data: { disposable: false, validTld: true }, status: 200 })

      await checkDomain('test.com')

      expect(mockAxiosGet).toHaveBeenCalledWith(
        'https://api.example.com/check/domain/test.com',
        expect.any(Object),
      )
    })

    it('should encode domain in URL', async () => {
      configValues.url = 'https://api.example.com'
      configValues.key = 'k'
      configValues.secret = 's'
      mockAxiosGet.mockResolvedValue({ data: { disposable: false, validTld: true }, status: 200 })

      await checkDomain('sub.example.com')

      expect(mockAxiosGet).toHaveBeenCalledWith(
        'https://api.example.com/check/domain/sub.example.com',
        expect.any(Object),
      )
    })

    it('should return data when status is 200 and data exists', async () => {
      configValues.url = 'https://api.example.com'
      configValues.key = 'k'
      configValues.secret = 's'
      const expectedData = { disposable: true, validTld: false }
      mockAxiosGet.mockResolvedValue({ data: expectedData, status: 200 })

      const result = await checkDomain('example.com')

      expect(result).toEqual(expectedData)
    })

    it('should return null when status is 4xx', async () => {
      configValues.url = 'https://api.example.com'
      configValues.key = 'k'
      configValues.secret = 's'
      mockAxiosGet.mockResolvedValue({ data: null, status: 404 })

      const result = await checkDomain('example.com')

      expect(result).toBeNull()
    })

    it('should return null when status is 5xx', async () => {
      configValues.url = 'https://api.example.com'
      configValues.key = 'k'
      configValues.secret = 's'
      mockAxiosGet.mockResolvedValue({ data: null, status: 500 })

      const result = await checkDomain('example.com')

      expect(result).toBeNull()
    })

    it('should return null when axios throws', async () => {
      configValues.url = 'https://api.example.com'
      configValues.key = 'k'
      configValues.secret = 's'
      mockAxiosGet.mockRejectedValue(new Error('Network error'))

      const result = await checkDomain('example.com')

      expect(result).toBeNull()
    })

    it('should return null when data is falsy', async () => {
      configValues.url = 'https://api.example.com'
      configValues.key = 'k'
      configValues.secret = 's'
      mockAxiosGet.mockResolvedValue({ data: null, status: 200 })

      const result = await checkDomain('example.com')

      expect(result).toBeNull()
    })

    it('validateStatus callback should return true for status < 500 and false for >= 500', async () => {
      configValues.url = 'https://api.example.com'
      configValues.key = 'k'
      configValues.secret = 's'
      mockAxiosGet.mockResolvedValue({ data: { disposable: false, validTld: true }, status: 200 })

      await checkDomain('example.com')

      const callOptions = mockAxiosGet.mock.calls[0][1] as {
        validateStatus: (s: number) => boolean
      }
      expect(callOptions.validateStatus(200)).toBe(true)
      expect(callOptions.validateStatus(404)).toBe(true)
      expect(callOptions.validateStatus(499)).toBe(true)
      expect(callOptions.validateStatus(500)).toBe(false)
      expect(callOptions.validateStatus(503)).toBe(false)
    })
  })
})
