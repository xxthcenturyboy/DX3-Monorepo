import dayjs from 'dayjs'

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

  it('should return a future timestamp when ADD operator is used', () => {
    // arrange
    const base = DxDateUtilClass.getTimestamp()
    // act
    const future = DxDateUtilClass.getTimestamp(1, 'hour', 'ADD')
    // assert
    expect(future).toBeGreaterThan(base)
  })

  it('should return a past timestamp when SUB operator is used', () => {
    // arrange
    const base = DxDateUtilClass.getTimestamp()
    // act
    const past = DxDateUtilClass.getTimestamp(1, 'hour', 'SUB')
    // assert
    expect(past).toBeLessThan(base)
  })

  it('should return current UTC timestamp when duration and unit are omitted', () => {
    // arrange
    const before = dayjs.utc().unix()
    // act
    const result = DxDateUtilClass.getTimestamp()
    const after = dayjs.utc().unix()
    // assert
    expect(result).toBeGreaterThanOrEqual(before)
    expect(result).toBeLessThanOrEqual(after)
  })

  it('should return current UTC timestamp when operator is undefined (duration + unit only)', () => {
    // arrange — when operator is omitted the fallthrough returns the plain current timestamp
    const before = dayjs.utc().unix()
    // act
    const result = DxDateUtilClass.getTimestamp(1, 'hour')
    const after = dayjs.utc().unix()
    // assert
    expect(result).toBeGreaterThanOrEqual(before)
    expect(result).toBeLessThanOrEqual(after)
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

  it('should return current UTC timestamp when date is null', () => {
    // arrange
    const before = dayjs.utc().unix()
    // act
    const result = DxDateUtilClass.getTimestampFromDate(null)
    const after = dayjs.utc().unix()
    // assert
    expect(result).toBeGreaterThanOrEqual(before)
    expect(result).toBeLessThanOrEqual(after)
  })

  it('should return current UTC timestamp when date is "now"', () => {
    // arrange
    const before = dayjs.utc().unix()
    // act
    const result = DxDateUtilClass.getTimestampFromDate('now')
    const after = dayjs.utc().unix()
    // assert
    expect(result).toBeGreaterThanOrEqual(before)
    expect(result).toBeLessThanOrEqual(after)
  })

  it('should return a future timestamp from a given date when ADD operator is used', () => {
    // arrange
    const base = DxDateUtilClass.getTimestampFromDate('2020-01-01T00:00:00Z')
    // act
    const future = DxDateUtilClass.getTimestampFromDate('2020-01-01T00:00:00Z', 1, 'day', 'ADD')
    // assert
    expect(future).toBeGreaterThan(base)
  })

  it('should return a past timestamp from a given date when SUB operator is used', () => {
    // arrange
    const base = DxDateUtilClass.getTimestampFromDate('2020-01-01T00:00:00Z')
    // act
    const past = DxDateUtilClass.getTimestampFromDate('2020-01-01T00:00:00Z', 1, 'day', 'SUB')
    // assert
    expect(past).toBeLessThan(base)
  })
})

describe('getMilisecondsDays', () => {
  it('should exist as a static method when imported', () => {
    // arrange
    // act
    // assert
    expect(DxDateUtilClass.getMilisecondsDays).toBeDefined()
  })

  it('should return 86400000 for 1 day', () => {
    // arrange
    // act
    const result = DxDateUtilClass.getMilisecondsDays(1)
    // assert
    expect(result).toEqual(86_400_000)
  })

  it('should return 604800000 for 7 days', () => {
    // arrange
    // act
    const result = DxDateUtilClass.getMilisecondsDays(7)
    // assert
    expect(result).toEqual(604_800_000)
  })

  it('should return 0 for 0 days', () => {
    // arrange
    // act
    const result = DxDateUtilClass.getMilisecondsDays(0)
    // assert
    expect(result).toEqual(0)
  })

  it('should scale linearly with the number of days', () => {
    // arrange
    const oneDayMs = DxDateUtilClass.getMilisecondsDays(1)
    // act
    const tenDaysMs = DxDateUtilClass.getMilisecondsDays(10)
    // assert
    expect(tenDaysMs).toEqual(oneDayMs * 10)
  })
})

describe('formatRelativeTime', () => {
  it('should exist as a static method when imported', () => {
    // arrange
    // act
    // assert
    expect(DxDateUtilClass.formatRelativeTime).toBeDefined()
  })

  it('should return "Just now" for a date less than 1 minute ago', () => {
    // arrange
    const thirtySecondsAgo = dayjs().subtract(30, 'second').toDate()
    // act
    const result = DxDateUtilClass.formatRelativeTime(thirtySecondsAgo)
    // assert
    expect(result).toEqual('Just now')
  })

  it('should return "Xm ago" for a date between 1 and 59 minutes ago', () => {
    // arrange
    const fiveMinutesAgo = dayjs().subtract(5, 'minute').toDate()
    // act
    const result = DxDateUtilClass.formatRelativeTime(fiveMinutesAgo)
    // assert
    expect(result).toMatch(/^\d+m ago$/)
    expect(result).toEqual('5m ago')
  })

  it('should return "Xh ago" for a date between 1 and 23 hours ago', () => {
    // arrange
    const threeHoursAgo = dayjs().subtract(3, 'hour').toDate()
    // act
    const result = DxDateUtilClass.formatRelativeTime(threeHoursAgo)
    // assert
    expect(result).toMatch(/^\d+h ago$/)
    expect(result).toEqual('3h ago')
  })

  it('should return "Xd ago" for a date between 1 and 6 days ago', () => {
    // arrange
    const twoDaysAgo = dayjs().subtract(2, 'day').toDate()
    // act
    const result = DxDateUtilClass.formatRelativeTime(twoDaysAgo)
    // assert
    expect(result).toMatch(/^\d+d ago$/)
    expect(result).toEqual('2d ago')
  })

  it('should return a formatted date string for a date 7 or more days ago', () => {
    // arrange
    const twoWeeksAgo = dayjs().subtract(14, 'day').toDate()
    // act
    const result = DxDateUtilClass.formatRelativeTime(twoWeeksAgo)
    // assert — dayjs format('L') returns a locale date string (e.g. "02/17/2026")
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
    expect(result).not.toMatch(/ago$/)
    expect(result).not.toEqual('Just now')
  })

  it('should accept a date string as input', () => {
    // arrange
    const dateString = dayjs().subtract(10, 'minute').toISOString()
    // act
    const result = DxDateUtilClass.formatRelativeTime(dateString)
    // assert
    expect(result).toMatch(/^\d+m ago$/)
  })
})

describe('formatAbsoluteTime', () => {
  it('should exist as a static method when imported', () => {
    // arrange
    // act
    // assert
    expect(DxDateUtilClass.formatAbsoluteTime).toBeDefined()
  })

  it('should return a non-empty string for a known date', () => {
    // arrange
    const knownDate = new Date('2020-06-15T10:30:00Z')
    // act
    const result = DxDateUtilClass.formatAbsoluteTime(knownDate)
    // assert
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('should return a non-empty string for a date string input', () => {
    // arrange
    const dateString = '2023-01-01T12:00:00Z'
    // act
    const result = DxDateUtilClass.formatAbsoluteTime(dateString)
    // assert
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('should produce different output for different input dates', () => {
    // arrange
    const date1 = new Date('2020-01-01T00:00:00Z')
    const date2 = new Date('2024-12-31T23:59:59Z')
    // act
    const result1 = DxDateUtilClass.formatAbsoluteTime(date1)
    const result2 = DxDateUtilClass.formatAbsoluteTime(date2)
    // assert
    expect(result1).not.toEqual(result2)
  })
})
