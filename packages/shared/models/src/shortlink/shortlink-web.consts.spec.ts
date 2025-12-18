import { SHORTLINK_ROUTES, SHORTLINK_WEB_ENTITY_NAME } from './shortlink-web.consts'

describe('SHORTLINK_WEB_ENTITY_NAME', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(SHORTLINK_WEB_ENTITY_NAME).toBeDefined()
  })

  it('should have correct value', () => {
    // arrange
    // act
    // assert
    expect(SHORTLINK_WEB_ENTITY_NAME).toEqual('shortlink')
  })
})

describe('SHORTLINK_ROUTES', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(SHORTLINK_ROUTES).toBeDefined()
  })

  it('should have correct value', () => {
    // arrange
    // act
    // assert
    expect(SHORTLINK_ROUTES.MAIN).toEqual('/l')
  })

  it('should be an object with expected properties', () => {
    // arrange
    // act
    // assert
    expect(typeof SHORTLINK_ROUTES).toBe('object')
    expect(Object.keys(SHORTLINK_ROUTES)).toContain('MAIN')
  })
})
