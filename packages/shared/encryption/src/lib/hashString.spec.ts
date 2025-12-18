import { dxHashAnyToString } from './hashString'

describe('dxHashAnyToString', () => {
  // arrange
  const valueToHash = {
    testNum: 123,
    testString: 'value',
  }
  // act
  const hashedValue = dxHashAnyToString(valueToHash)
  // assert
  it('should exist when imported', () => {
    expect(dxHashAnyToString).toBeDefined()
  })

  it('should hash a string when invoked', () => {
    expect(hashedValue).toBeDefined()
    expect(typeof hashedValue === 'string').toBeTruthy()
  })
})
