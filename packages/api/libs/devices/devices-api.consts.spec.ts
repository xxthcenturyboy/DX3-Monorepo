import {
  DEVICES_ENTITY_NAME,
  DEVICES_POSTGRES_DB_NAME,
  FACIAL_AUTH_STATE,
} from './devices-api.consts'

describe('DEVICES_ENTITY_NAME ', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(DEVICES_ENTITY_NAME).toBeDefined()
  })

  it('should have correct value', () => {
    // arrange
    // act
    // assert
    expect(DEVICES_ENTITY_NAME).toEqual('devices')
  })
})

describe('DEVICES_POSTGRES_DB_NAME ', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(DEVICES_POSTGRES_DB_NAME).toBeDefined()
  })

  it('should have correct value', () => {
    // arrange
    // act
    // assert
    expect(DEVICES_POSTGRES_DB_NAME).toEqual('devices')
  })
})

describe('FACIAL_AUTH_STATE ', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(FACIAL_AUTH_STATE).toBeDefined()
  })

  it('should have correct values', () => {
    // arrange
    // act
    // assert
    expect(FACIAL_AUTH_STATE.CHALLENGE).toEqual('CHALLENGE')
    expect(FACIAL_AUTH_STATE.NOT_APPLICABLE).toEqual('NOT_APPLICABLE')
    expect(FACIAL_AUTH_STATE.SUCCESS).toEqual('SUCCESS')
  })
})
