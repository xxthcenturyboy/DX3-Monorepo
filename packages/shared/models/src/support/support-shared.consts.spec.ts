import {
  SUPPORT_CATEGORY,
  SUPPORT_CATEGORY_ARRAY,
  SUPPORT_OPEN_STATUSES,
  SUPPORT_STATUS,
  SUPPORT_STATUS_ARRAY,
  SUPPORT_STATUS_COLORS,
  SUPPORT_VALIDATION,
  SUPPORT_WEB_SOCKET_NS,
} from './support-shared.consts'

describe('SUPPORT_CATEGORY', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(SUPPORT_CATEGORY).toBeDefined()
  })

  it('should have correct values for all categories', () => {
    // arrange
    // act
    // assert
    expect(SUPPORT_CATEGORY.ISSUE).toEqual('issue')
    expect(SUPPORT_CATEGORY.NEW_FEATURE).toEqual('new_feature')
    expect(SUPPORT_CATEGORY.OTHER).toEqual('other')
    expect(SUPPORT_CATEGORY.QUESTION).toEqual('question')
  })

  it('should have exactly 4 categories', () => {
    // arrange
    // act
    // assert
    expect(Object.keys(SUPPORT_CATEGORY).length).toEqual(4)
  })
})

describe('SUPPORT_CATEGORY_ARRAY', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(SUPPORT_CATEGORY_ARRAY).toBeDefined()
  })

  it('should contain all category values', () => {
    // arrange
    // act
    // assert
    expect(SUPPORT_CATEGORY_ARRAY).toContain('issue')
    expect(SUPPORT_CATEGORY_ARRAY).toContain('new_feature')
    expect(SUPPORT_CATEGORY_ARRAY).toContain('other')
    expect(SUPPORT_CATEGORY_ARRAY).toContain('question')
  })

  it('should have length equal to number of SUPPORT_CATEGORY entries', () => {
    // arrange
    // act
    // assert
    expect(SUPPORT_CATEGORY_ARRAY.length).toEqual(Object.values(SUPPORT_CATEGORY).length)
  })
})

describe('SUPPORT_STATUS', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(SUPPORT_STATUS).toBeDefined()
  })

  it('should have correct values for all statuses', () => {
    // arrange
    // act
    // assert
    expect(SUPPORT_STATUS.CLOSED).toEqual('closed')
    expect(SUPPORT_STATUS.IN_PROGRESS).toEqual('in_progress')
    expect(SUPPORT_STATUS.OPEN).toEqual('open')
    expect(SUPPORT_STATUS.RESOLVED).toEqual('resolved')
  })

  it('should have exactly 4 statuses', () => {
    // arrange
    // act
    // assert
    expect(Object.keys(SUPPORT_STATUS).length).toEqual(4)
  })
})

describe('SUPPORT_STATUS_ARRAY', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(SUPPORT_STATUS_ARRAY).toBeDefined()
  })

  it('should have the correct display order: OPEN → IN_PROGRESS → RESOLVED → CLOSED', () => {
    // arrange
    // act
    // assert
    expect(SUPPORT_STATUS_ARRAY[0]).toEqual('open')
    expect(SUPPORT_STATUS_ARRAY[1]).toEqual('in_progress')
    expect(SUPPORT_STATUS_ARRAY[2]).toEqual('resolved')
    expect(SUPPORT_STATUS_ARRAY[3]).toEqual('closed')
  })

  it('should have exactly 4 entries', () => {
    // arrange
    // act
    // assert
    expect(SUPPORT_STATUS_ARRAY.length).toEqual(4)
  })
})

describe('SUPPORT_OPEN_STATUSES', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(SUPPORT_OPEN_STATUSES).toBeDefined()
  })

  it('should contain OPEN and IN_PROGRESS statuses only', () => {
    // arrange
    // act
    // assert
    expect(SUPPORT_OPEN_STATUSES).toContain('open')
    expect(SUPPORT_OPEN_STATUSES).toContain('in_progress')
  })

  it('should have exactly 2 entries', () => {
    // arrange
    // act
    // assert
    expect(SUPPORT_OPEN_STATUSES.length).toEqual(2)
  })

  it('should NOT contain RESOLVED or CLOSED statuses', () => {
    // arrange
    // act
    // assert
    expect(SUPPORT_OPEN_STATUSES).not.toContain('resolved')
    expect(SUPPORT_OPEN_STATUSES).not.toContain('closed')
  })
})

describe('SUPPORT_WEB_SOCKET_NS', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(SUPPORT_WEB_SOCKET_NS).toBeDefined()
  })

  it('should have the correct namespace value', () => {
    // arrange
    // act
    // assert
    expect(SUPPORT_WEB_SOCKET_NS).toEqual('/support-web')
  })
})

describe('SUPPORT_VALIDATION', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(SUPPORT_VALIDATION).toBeDefined()
  })

  it('should have correct max open requests per day limit', () => {
    // arrange
    // act
    // assert
    expect(SUPPORT_VALIDATION.MAX_OPEN_REQUESTS_PER_DAY).toEqual(3)
  })

  it('should have correct message max length', () => {
    // arrange
    // act
    // assert
    expect(SUPPORT_VALIDATION.MESSAGE_MAX_LENGTH).toEqual(2000)
  })

  it('should have correct subject max length', () => {
    // arrange
    // act
    // assert
    expect(SUPPORT_VALIDATION.SUBJECT_MAX_LENGTH).toEqual(255)
  })

  it('should have correct subject truncate length', () => {
    // arrange
    // act
    // assert
    expect(SUPPORT_VALIDATION.SUBJECT_TRUNCATE_LENGTH).toEqual(50)
  })

  it('should have SUBJECT_TRUNCATE_LENGTH less than SUBJECT_MAX_LENGTH', () => {
    // arrange
    // act
    // assert
    expect(SUPPORT_VALIDATION.SUBJECT_TRUNCATE_LENGTH).toBeLessThan(
      SUPPORT_VALIDATION.SUBJECT_MAX_LENGTH,
    )
  })
})

describe('SUPPORT_STATUS_COLORS', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(SUPPORT_STATUS_COLORS).toBeDefined()
  })

  it('should map CLOSED status to default color', () => {
    // arrange
    // act
    // assert
    expect(SUPPORT_STATUS_COLORS[SUPPORT_STATUS.CLOSED]).toEqual('default')
  })

  it('should map IN_PROGRESS status to warning color', () => {
    // arrange
    // act
    // assert
    expect(SUPPORT_STATUS_COLORS[SUPPORT_STATUS.IN_PROGRESS]).toEqual('warning')
  })

  it('should map OPEN status to info color', () => {
    // arrange
    // act
    // assert
    expect(SUPPORT_STATUS_COLORS[SUPPORT_STATUS.OPEN]).toEqual('info')
  })

  it('should map RESOLVED status to success color', () => {
    // arrange
    // act
    // assert
    expect(SUPPORT_STATUS_COLORS[SUPPORT_STATUS.RESOLVED]).toEqual('success')
  })

  it('should have an entry for every SUPPORT_STATUS value', () => {
    // arrange
    const statusValues = Object.values(SUPPORT_STATUS)
    // act
    // assert
    for (const status of statusValues) {
      expect(SUPPORT_STATUS_COLORS[status]).toBeDefined()
    }
  })
})
