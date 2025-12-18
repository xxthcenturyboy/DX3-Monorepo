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
})
