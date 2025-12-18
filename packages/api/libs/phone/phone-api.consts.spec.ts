import { PHONE_ENTITY_NAME, PHONE_MODEL_OPTIONS, PHONE_POSTGRES_DB_NAME } from './phone-api.consts'

describe('PHONE_ENTITY_NAME ', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(PHONE_ENTITY_NAME).toBeDefined()
  })

  it('should have correct value', () => {
    // arrange
    // act
    // assert
    expect(PHONE_ENTITY_NAME).toEqual('phone')
  })
})

describe('PHONE_MODEL_OPTIONS ', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(PHONE_MODEL_OPTIONS).toBeDefined()
  })

  it('should have correct value', () => {
    // arrange
    // act
    // assert
    expect(PHONE_MODEL_OPTIONS.association).toEqual('phones')
    expect(PHONE_MODEL_OPTIONS.attributes).toEqual([
      'id',
      'countryCode',
      'default',
      'isVerified',
      'label',
      'phone',
      'phoneFormatted',
      'verifiedAt',
      'deletedAt',
    ])
  })
})
describe('PHONE_POSTGRES_DB_NAME ', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(PHONE_POSTGRES_DB_NAME).toBeDefined()
  })

  it('should have correct value', () => {
    // arrange
    // act
    // assert
    expect(PHONE_POSTGRES_DB_NAME).toEqual('phone')
  })
})
