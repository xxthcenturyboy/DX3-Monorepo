import { PHONE_LABEL } from './phone-shared.consts'

describe('PHONE_LABEL ', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(PHONE_LABEL).toBeDefined()
  })

  it('should have correct value', () => {
    // arrange
    // act
    // assert
    expect(PHONE_LABEL.CELL).toEqual('Cell')
    expect(PHONE_LABEL.HOME).toEqual('Home')
    expect(PHONE_LABEL.OTHER).toEqual('Other')
    expect(PHONE_LABEL.WORK).toEqual('Work')
  })
})
