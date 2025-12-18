import {
  USER_PRIVILEGES_ENTITY_NAME,
  USER_PRIVILEGES_POSTGRES_DB_NAME,
} from './user-privilege-api.consts'

describe('USER_PRIVILEGES_ENTITY_NAME ', () => {
  // arrange
  // act
  // assert
  it('should exist when imported', () => {
    expect(USER_PRIVILEGES_ENTITY_NAME).toBeDefined()
  })

  it('should have correct value', () => {
    expect(USER_PRIVILEGES_ENTITY_NAME).toEqual('user-privileges')
  })
})

describe('USER_PRIVILEGES_POSTGRES_DB_NAME ', () => {
  // arrange
  // act
  // assert
  it('should exist when imported', () => {
    expect(USER_PRIVILEGES_POSTGRES_DB_NAME).toBeDefined()
  })

  it('should have correct value', () => {
    expect(USER_PRIVILEGES_POSTGRES_DB_NAME).toEqual('user_privileges')
  })
})
