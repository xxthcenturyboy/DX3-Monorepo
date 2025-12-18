import {
  USER_ENTITY_NAME,
  USER_ENTITY_POSTGRES_DB_NAME,
  USER_FIND_ATTRIBUTES,
  USER_SORT_FIELDS,
} from './user-api.consts'

describe('USER_ENTITY_NAME ', () => {
  // arrange
  // act
  // assert
  it('should exist when imported', () => {
    expect(USER_ENTITY_NAME).toBeDefined()
  })

  it('should have correct value', () => {
    expect(USER_ENTITY_NAME).toEqual('user')
  })
})

describe('USER_ENTITY_POSTGRES_DB_NAME ', () => {
  // arrange
  // act
  // assert
  it('should exist when imported', () => {
    expect(USER_ENTITY_POSTGRES_DB_NAME).toBeDefined()
  })

  it('should have correct value', () => {
    expect(USER_ENTITY_POSTGRES_DB_NAME).toEqual('user')
  })
})

describe('USER_FIND_ATTRIBUTES ', () => {
  // arrange
  // act
  // assert
  it('should exist when imported', () => {
    expect(USER_FIND_ATTRIBUTES).toBeDefined()
  })

  it('should have correct value', () => {
    expect(USER_FIND_ATTRIBUTES).toEqual([
      'id',
      'firstName',
      'lastName',
      'fullName',
      'isAdmin',
      'isSuperAdmin',
      'optInBeta',
      'roles',
      'username',
      'restrictions',
    ])
  })
})

describe('USER_SORT_FIELDS ', () => {
  // arrange
  // act
  // assert
  it('should exist when imported', () => {
    expect(USER_SORT_FIELDS).toBeDefined()
  })

  it('should have correct value', () => {
    expect(USER_SORT_FIELDS).toEqual(['firstName', 'lastName', 'optInBeta'])
  })
})
