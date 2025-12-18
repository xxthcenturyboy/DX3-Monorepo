import { dxHashString, dxVerifyHash } from './hashing'

describe('dxHashString', () => {
  test('hashing a string', async () => {
    // arrange
    // act
    const hashString = await dxHashString('stringToHash')
    // assert
    expect(dxHashString).toBeDefined()
    expect(hashString).toBeDefined()
    expect(typeof hashString === 'string').toBeTruthy()
  })
})

describe('dxVerifyHash', () => {
  test('validating a hash string', async () => {
    // arrange
    const stringToHash = 'string-test-value'
    // act
    const hashString = await dxHashString(stringToHash)
    const verified = await dxVerifyHash(hashString, stringToHash)
    const notVerified = await dxVerifyHash(hashString, 'incorrect-value')
    // assert
    expect(dxVerifyHash).toBeDefined()
    expect(hashString).toBeDefined()
    expect(verified).toBeTruthy()
    expect(notVerified).toBeFalsy()
  })
})
