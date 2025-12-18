import { EMAIL_LABEL } from './email-shared.consts'

describe('EMAIL_LABEL ', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(EMAIL_LABEL).toBeDefined()
  })

  it('should have correct value', () => {
    // arrange
    // act
    // assert
    expect(EMAIL_LABEL.OTHER).toEqual('Other')
    expect(EMAIL_LABEL.PERSONAL).toEqual('Personal')
    expect(EMAIL_LABEL.WORK).toEqual('Work')
  })
})
