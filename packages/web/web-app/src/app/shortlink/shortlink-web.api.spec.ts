import { apiWebShortlink } from './shortlink-web.api'

jest.mock('../data/rtk-query')

describe('apiWebShortlink', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(apiWebShortlink).toBeDefined()
  })

  it('should should have added specific properties to the main api object when imported', () => {
    // arrange
    // act
    // assert
    expect(apiWebShortlink.endpoints.getShortlinkTarget).toBeDefined()
    expect(apiWebShortlink.useLazyGetShortlinkTargetQuery).toBeDefined()
  })
})
