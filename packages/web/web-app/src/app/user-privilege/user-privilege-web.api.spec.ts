import { apiWebPrivilegeSets } from './user-privilege-web.api'

jest.mock('../data/rtk-query')

describe('apiWebPrivilegeSets', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(apiWebPrivilegeSets).toBeDefined()
  })

  it('should should have added specific properties to the main api object when imported', () => {
    // arrange
    // act
    // assert
    expect(apiWebPrivilegeSets.endpoints.getPrivilegeSets).toBeDefined()
    expect(apiWebPrivilegeSets.useLazyGetPrivilegeSetsQuery).toBeDefined()
  })
})
