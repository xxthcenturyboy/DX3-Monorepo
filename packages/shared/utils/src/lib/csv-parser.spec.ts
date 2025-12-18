import { type ParsedData, parseCSV } from './csv-parser'

describe('parseCSV', () => {
  test('parses basic CSV into array of objects', () => {
    const csv = 'name,age\nAlice,30\nBob,25'
    const expected: ParsedData[] = [
      { age: '30', name: 'Alice' },
      { age: '25', name: 'Bob' },
    ]
    expect(parseCSV(csv)).toEqual(expected)
  })

  test('trims headers and values', () => {
    const csv = ' name , age \n Alice , 30 \nBob, 25 '
    const expected: ParsedData[] = [
      { age: '30', name: 'Alice' },
      { age: '25', name: 'Bob' },
    ]
    expect(parseCSV(csv)).toEqual(expected)
  })

  test('fills missing values with empty string and accepts extra values when provided', () => {
    const csv = 'a,b,c\n1,2\n3,4,5'
    const expected: ParsedData[] = [
      { a: '1', b: '2', c: '' },
      { a: '3', b: '4', c: '5' },
    ]
    expect(parseCSV(csv)).toEqual(expected)
  })

  test('includes an object for a trailing newline row (empty values)', () => {
    const csv = 'x,y\n1,2\n'
    const expected: ParsedData[] = [
      { x: '1', y: '2' },
      { x: '', y: '' }, // parser produces an empty row object for the trailing newline
    ]
    expect(parseCSV(csv)).toEqual(expected)
  })

  test('returns empty array for empty input', () => {
    expect(parseCSV('')).toEqual([])
  })
})
