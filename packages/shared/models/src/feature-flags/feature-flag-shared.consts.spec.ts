import {
  FEATURE_FLAG_NAMES,
  FEATURE_FLAG_NAMES_ARRAY,
  FEATURE_FLAG_SOCKET_NS,
  FEATURE_FLAG_STATUS,
  FEATURE_FLAG_STATUS_ARRAY,
  FEATURE_FLAG_TARGET,
  FEATURE_FLAG_TARGET_ARRAY,
} from './feature-flag-shared.consts'

describe('FEATURE_FLAG_SOCKET_NS', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(FEATURE_FLAG_SOCKET_NS).toBeDefined()
  })

  it('should have the correct value', () => {
    // arrange
    // act
    // assert
    expect(FEATURE_FLAG_SOCKET_NS).toEqual('/feature-flags')
  })
})

describe('FEATURE_FLAG_NAMES', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(FEATURE_FLAG_NAMES).toBeDefined()
  })

  it('should have correct values for all flag names', () => {
    // arrange
    // act
    // assert
    expect(FEATURE_FLAG_NAMES.BLOG).toEqual('BLOG')
    expect(FEATURE_FLAG_NAMES.FAQ_APP).toEqual('FAQ_APP')
    expect(FEATURE_FLAG_NAMES.FAQ_MARKETING).toEqual('FAQ_MARKETING')
  })

  it('should have exactly 3 flag names', () => {
    // arrange
    // act
    // assert
    expect(Object.keys(FEATURE_FLAG_NAMES).length).toEqual(3)
  })
})

describe('FEATURE_FLAG_NAMES_ARRAY', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(FEATURE_FLAG_NAMES_ARRAY).toBeDefined()
  })

  it('should contain all flag name values', () => {
    // arrange
    // act
    // assert
    expect(FEATURE_FLAG_NAMES_ARRAY).toContain('BLOG')
    expect(FEATURE_FLAG_NAMES_ARRAY).toContain('FAQ_APP')
    expect(FEATURE_FLAG_NAMES_ARRAY).toContain('FAQ_MARKETING')
  })

  it('should have length equal to number of FEATURE_FLAG_NAMES entries', () => {
    // arrange
    // act
    // assert
    expect(FEATURE_FLAG_NAMES_ARRAY.length).toEqual(Object.values(FEATURE_FLAG_NAMES).length)
  })
})

describe('FEATURE_FLAG_STATUS', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(FEATURE_FLAG_STATUS).toBeDefined()
  })

  it('should have correct values for all statuses', () => {
    // arrange
    // act
    // assert
    expect(FEATURE_FLAG_STATUS.ACTIVE).toEqual('ACTIVE')
    expect(FEATURE_FLAG_STATUS.DISABLED).toEqual('DISABLED')
    expect(FEATURE_FLAG_STATUS.ROLLOUT).toEqual('ROLLOUT')
  })

  it('should have exactly 3 statuses', () => {
    // arrange
    // act
    // assert
    expect(Object.keys(FEATURE_FLAG_STATUS).length).toEqual(3)
  })
})

describe('FEATURE_FLAG_STATUS_ARRAY', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(FEATURE_FLAG_STATUS_ARRAY).toBeDefined()
  })

  it('should contain all status values', () => {
    // arrange
    // act
    // assert
    expect(FEATURE_FLAG_STATUS_ARRAY).toContain('ACTIVE')
    expect(FEATURE_FLAG_STATUS_ARRAY).toContain('DISABLED')
    expect(FEATURE_FLAG_STATUS_ARRAY).toContain('ROLLOUT')
  })

  it('should have length equal to number of FEATURE_FLAG_STATUS entries', () => {
    // arrange
    // act
    // assert
    expect(FEATURE_FLAG_STATUS_ARRAY.length).toEqual(Object.values(FEATURE_FLAG_STATUS).length)
  })
})

describe('FEATURE_FLAG_TARGET', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(FEATURE_FLAG_TARGET).toBeDefined()
  })

  it('should have correct values for all targets', () => {
    // arrange
    // act
    // assert
    expect(FEATURE_FLAG_TARGET.ADMIN).toEqual('ADMIN')
    expect(FEATURE_FLAG_TARGET.ALL).toEqual('ALL')
    expect(FEATURE_FLAG_TARGET.BETA_USERS).toEqual('BETA_USERS')
    expect(FEATURE_FLAG_TARGET.PERCENTAGE).toEqual('PERCENTAGE')
    expect(FEATURE_FLAG_TARGET.SUPER_ADMIN).toEqual('SUPER_ADMIN')
  })

  it('should have exactly 5 targets', () => {
    // arrange
    // act
    // assert
    expect(Object.keys(FEATURE_FLAG_TARGET).length).toEqual(5)
  })
})

describe('FEATURE_FLAG_TARGET_ARRAY', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(FEATURE_FLAG_TARGET_ARRAY).toBeDefined()
  })

  it('should contain all target values', () => {
    // arrange
    // act
    // assert
    expect(FEATURE_FLAG_TARGET_ARRAY).toContain('ADMIN')
    expect(FEATURE_FLAG_TARGET_ARRAY).toContain('ALL')
    expect(FEATURE_FLAG_TARGET_ARRAY).toContain('BETA_USERS')
    expect(FEATURE_FLAG_TARGET_ARRAY).toContain('PERCENTAGE')
    expect(FEATURE_FLAG_TARGET_ARRAY).toContain('SUPER_ADMIN')
  })

  it('should have length equal to number of FEATURE_FLAG_TARGET entries', () => {
    // arrange
    // act
    // assert
    expect(FEATURE_FLAG_TARGET_ARRAY.length).toEqual(Object.values(FEATURE_FLAG_TARGET).length)
  })
})
