import { ApiLoggingClass } from '../logger'
import { HEALTHZ_STATUS_OK } from './healthz-api.const'
import { HttpHealthzService, type HttpHealthzServiceType } from './http-healthz-api.service'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))

// Mock fetch globally for tests
global.fetch = jest.fn().mockResolvedValue({
  status: 200,
})

describe('HttpHealthzService', () => {
  let httpHealthzService: HttpHealthzServiceType

  beforeAll(() => {
    new ApiLoggingClass({ appName: 'TEST' })
  })

  beforeEach(() => {
    httpHealthzService = new HttpHealthzService()
  })

  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(HttpHealthzService).toBeDefined()
  })

  it('should exist when instantiated', () => {
    // arrange
    // act
    // assert
    expect(httpHealthzService).toBeDefined()
  })

  test('should return the correct response when invoked', async () => {
    // arrange
    let httpResponse: string | number = ''
    const expectedResult = HEALTHZ_STATUS_OK

    // act
    httpResponse = await httpHealthzService.healthCheck()

    // assert
    expect(httpHealthzService.healthCheck).toBeDefined()
    expect(httpResponse).toEqual(expectedResult)
  })

  test('should return HEALTHZ_STATUS_ERROR when fetch returns non-200 status', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ status: 503 })
    const result = await httpHealthzService.healthCheck()
    expect(result).not.toEqual(HEALTHZ_STATUS_OK)
  })

  test('should return error message when fetch throws', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))
    const result = await httpHealthzService.healthCheck()
    expect(result).toBe('Network error')
  })

  test('should accept a custom URL for health check', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ status: 200 })
    const result = await httpHealthzService.healthCheck('http://custom-host/health')
    expect(global.fetch).toHaveBeenCalledWith('http://custom-host/health')
    expect(result).toEqual(HEALTHZ_STATUS_OK)
  })
})
