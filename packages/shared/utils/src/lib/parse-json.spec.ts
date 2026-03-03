import { parseJson } from './parse-json'

describe('parseJson', () => {
  it('should transform a string to JSON when called', () => {
    // arrange
    type ParsedDataType = { test: string }
    const data: ParsedDataType = { test: 'test' }
    // act
    const transformed = parseJson<ParsedDataType>(JSON.stringify(data))
    // assert
    expect(transformed).toBeDefined()
    expect(transformed).toEqual(data)
  })

  it('should parse a JSON array string into an array', () => {
    // arrange
    const data = [1, 2, 3]
    // act
    const result = parseJson<number[]>(JSON.stringify(data))
    // assert
    expect(result).toEqual(data)
  })

  it('should parse a JSON primitive number string', () => {
    // arrange
    // act
    const result = parseJson<number>('42')
    // assert
    expect(result).toEqual(42)
  })

  it('should return the original string when input is invalid JSON', () => {
    // arrange
    const invalidJson = '{not: valid json}'
    // act
    const result = parseJson<string>(invalidJson)
    // assert — fallback: invalid JSON returns the input as-is
    expect(result).toEqual(invalidJson)
  })

  it('should return the original string for a plain non-JSON string', () => {
    // arrange
    const plainString = 'hello world'
    // act
    const result = parseJson<string>(plainString)
    // assert
    expect(result).toEqual(plainString)
  })

  it('should return an empty string when given an empty string', () => {
    // arrange
    // act
    const result = parseJson<string>('')
    // assert — empty string is falsy, so the guard short-circuits and returns it as-is
    expect(result).toEqual('')
  })

  it('should handle a deeply nested JSON object', () => {
    // arrange
    type DeepType = { a: { b: { c: number } } }
    const nested: DeepType = { a: { b: { c: 99 } } }
    // act
    const result = parseJson<DeepType>(JSON.stringify(nested))
    // assert
    expect(result).toEqual(nested)
    expect((result as DeepType).a.b.c).toEqual(99)
  })
})
