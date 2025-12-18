import { propertiesToArray } from './properties-to-array'

describe('propertiesToArray', () => {
  test('returns empty array for empty object', () => {
    expect(propertiesToArray({})).toEqual([])
  })

  test('flattens nested objects into dot notation', () => {
    const input = {
      a: {
        b: {
          c: 1,
        },
        d: 2,
      },
      e: 3,
    }

    expect(propertiesToArray(input)).toEqual(['a.b.c', 'a.d', 'e'])
  })

  test('treats arrays as leaf values (does not expand their indices)', () => {
    const input = {
      arr: [1, 2, 3],
      nested: {
        list: [{ x: 1 }],
      },
    }

    // arrays are not recursed into, so keys for arrays appear as the property name only
    expect(propertiesToArray(input)).toEqual(['arr', 'nested.list'])
  })

  test('works with mixed primitive values', () => {
    const input = {
      b: true,
      n: 0,
      obj: {
        inner: 'value',
      },
      s: 'str',
    }

    expect(propertiesToArray(input)).toEqual(['b', 'n', 'obj.inner', 's'])
  })

  test('throws when encountering null (current implementation treats null as object and will error)', () => {
    expect(() => propertiesToArray({ a: null as any })).toThrow()
  })
})
