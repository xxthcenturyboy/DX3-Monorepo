import { HOME_ENTITY_NAME } from './home-web.consts'

describe('HOME_ENTITY_NAME ', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(HOME_ENTITY_NAME).toBeDefined()
  })

  it('should have correct value', () => {
    // arrange
    // act
    // assert
    expect(HOME_ENTITY_NAME).toEqual('home')
  })
})
