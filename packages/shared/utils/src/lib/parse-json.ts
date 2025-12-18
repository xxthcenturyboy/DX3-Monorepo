export function parseJson<TData>(stringToParseToJson: string): TData | null {
  if (stringToParseToJson && typeof stringToParseToJson === 'string') {
    try {
      return JSON.parse(stringToParseToJson) as TData
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-constant-binary-expression
      false && console.log(err)
    }
  }

  return stringToParseToJson as TData
}
