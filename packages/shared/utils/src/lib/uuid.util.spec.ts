import { getTimeFromUuid } from './uuid.util'

describe('getTimeFromUuid', () => {
  test('parses a UUID v1 generated for 2020-01-01T00:00:00.000Z', () => {
    const target = new Date('2020-01-01T00:00:00.000Z')

    // Build a UUID v1 whose timestamp corresponds to `target`.
    // UUID timestamp = (unix_ms * 10000) + UUID_EPOCH_OFFSET (100-ns intervals since 1582-10-15)
    const UUID_EPOCH_OFFSET = 122192928000000000n
    const time100ns = BigInt(target.getTime()) * 10000n + UUID_EPOCH_OFFSET

    // Timestamp occupies 60 bits -> 15 hex chars. Split into (3,4,8) to form c.substring(1) + b + a
    const hex = time100ns.toString(16).padStart(15, '0')
    const cPart = hex.slice(0, 3) // will become c.substring(1)
    const b = hex.slice(3, 7)
    const a = hex.slice(7, 15)

    const uuid = `${a}-${b}-1${cPart}-0000-000000000000` // rest can be zeros
    const result = getTimeFromUuid(uuid)

    expect(result).toBeInstanceOf(Date)
    expect(result.getTime()).toBe(target.getTime())
  })

  test('parses zero timestamp UUID (all timestamp fields zero) to the UUID epoch-relative date', () => {
    const uuid = '00000000-0000-1000-0000-000000000000'
    const result = getTimeFromUuid(uuid)

    // When the parsed 60-bit timestamp is 0 the computed ms should be:
    // Math.floor((0 - UUID_EPOCH_OFFSET) / 10000)
    const UUID_EPOCH_OFFSET = 122192928000000000
    const expectedMs = Math.floor((0 - UUID_EPOCH_OFFSET) / 10000)
    expect(result.getTime()).toBe(expectedMs)
  })

  test('returns consistent Date for the same UUID', () => {
    const uuid = 'f47ac10b-58cc-11cf-9a0c-0305e82c3301' // arbitrary v1-like format
    const d1 = getTimeFromUuid(uuid)
    const d2 = getTimeFromUuid(uuid)
    expect(d1.getTime()).toBe(d2.getTime())
    expect(d1).toBeInstanceOf(Date)
  })
})
