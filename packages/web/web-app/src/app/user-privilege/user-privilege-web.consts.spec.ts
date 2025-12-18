import { USER_ROLE, USER_ROLE_ARRAY } from './user-privilege-web.consts'

describe('USER_ROLE', () => {
  // arrange
  // act
  // assert
  it('should exist when imported', () => {
    expect(USER_ROLE).toBeDefined()
  })

  it('should have correct value', () => {
    expect(USER_ROLE.ADMIN).toEqual('ADMIN')
    expect(USER_ROLE.SUPER_ADMIN).toEqual('SUPER_ADMIN')
    expect(USER_ROLE.USER).toEqual('USER')
  })
})

describe('USER_ROLE_ARRAY', () => {
  // arrange
  // act
  // assert
  it('should exist when imported', () => {
    expect(USER_ROLE_ARRAY).toBeDefined()
  })

  it('should have correct value', () => {
    expect(USER_ROLE_ARRAY).toEqual(['ADMIN', 'SUPER_ADMIN', 'USER'])
  })
})
