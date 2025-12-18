import { DxDateUtilClass } from './dx-dates.util'

describe('getTimestamp', () => {
  // arrange
  // act
  const ts = DxDateUtilClass.getTimestamp()
  // assert
  it('should exist as a static method when imported', () => {
    expect(DxDateUtilClass.getTimestamp).toBeDefined()
  })

  it('should return a timestamp when invoked', () => {
    expect(ts).toBeDefined()
    expect(typeof ts === 'number').toBeTruthy()
  })
})

describe('getTimestampFromDate', () => {
  // arrange
  // act
  const ts = DxDateUtilClass.getTimestampFromDate(
    'Thu Jun 20 2012 11:36:43 GMT-0700 (Pacific Daylight Time)',
  )
  // assert
  it('should exist as a static method when imported', () => {
    expect(DxDateUtilClass.getTimestampFromDate).toBeDefined()
  })

  it('should return a timestamp when invoked', () => {
    expect(ts).toBeDefined()
    expect(typeof ts === 'number').toBeTruthy()
    expect(ts).toEqual(1340217403)
  })
})
