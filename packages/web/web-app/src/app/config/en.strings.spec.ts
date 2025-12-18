import { STRINGS } from './en.strings'

describe('STRINGS', () => {
  it('should exist', () => {
    // arrange
    // act
    // assert
    expect(STRINGS).toBeDefined()
  })

  it('should have correct values', () => {
    // arrange
    // act
    // assert
    expect(STRINGS.COULD_NOT_LOG_YOU_IN).toEqual('Could not log you in, sucka.')
    expect(STRINGS.LOGIN).toEqual('Login')
    expect(STRINGS.PASSWORD).toEqual('Password')
    expect(STRINGS.TRY_ANOTHER_WAY).toEqual('Try another way?')
    expect(STRINGS.USERNAME).toEqual('Username')
  })
})
