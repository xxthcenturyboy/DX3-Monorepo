import { SHORTLINK_ENTITY_NAME, SHORTLINK_POSTGRES_DB_NAME } from './shortlink-api.consts'

describe('SHORTLINK_ENTITY_NAME ', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(SHORTLINK_ENTITY_NAME).toBeDefined()
  })

  it('should have correct value', () => {
    // arrange
    // act
    // assert
    expect(SHORTLINK_ENTITY_NAME).toEqual('shortlink')
  })
})

describe('SHORTLINK_POSTGRES_DB_NAME ', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(SHORTLINK_POSTGRES_DB_NAME).toBeDefined()
  })

  it('should have correct value', () => {
    // arrange
    // act
    // assert
    expect(SHORTLINK_POSTGRES_DB_NAME).toEqual('shortlink')
  })
})
