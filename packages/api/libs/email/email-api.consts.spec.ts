import { EMAIL_ENTITY_NAME, EMAIL_MODEL_OPTIONS, EMAIL_POSTGRES_DB_NAME } from './email-api.consts'

describe('EMAIL_ENTITY_NAME ', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(EMAIL_ENTITY_NAME).toBeDefined()
  })

  it('should have correct value', () => {
    // arrange
    // act
    // assert
    expect(EMAIL_ENTITY_NAME).toEqual('email')
  })
})

describe('EMAIL_MODEL_OPTIONS ', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(EMAIL_MODEL_OPTIONS).toBeDefined()
  })

  it('should have correct value', () => {
    // arrange
    // act
    // assert
    expect(EMAIL_MODEL_OPTIONS.association).toEqual('emails')
    expect(EMAIL_MODEL_OPTIONS.attributes).toEqual([
      'id',
      'default',
      'isVerified',
      'label',
      'email',
      'verifiedAt',
      'deletedAt',
    ])
  })
})
describe('EMAIL_POSTGRES_DB_NAME ', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(EMAIL_POSTGRES_DB_NAME).toBeDefined()
  })

  it('should have correct value', () => {
    // arrange
    // act
    // assert
    expect(EMAIL_POSTGRES_DB_NAME).toEqual('email')
  })
})
