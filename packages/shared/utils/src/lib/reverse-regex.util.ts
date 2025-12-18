export type RegexTypes = {
  chars: string[]
  count: number
  type: string
}

export const STRING_INDEX_TYPES = {
  ALPHA: 'ALPHA',
  NUMERIC: 'NUMERIC',
  SYMBOL: 'SYMBOL',
}

const ALPHA_GROUP = '[a-zA-Z]'
const NUMERIC_GROUP = '[0-9]'
const SYMBOL_GROUP = '[.-_]'

// eslint-disable-next-line no-useless-escape
const SYMBOL_PATTERN = /[.\-_]/g

function determineType(char: string, n: number) {
  const symbolMatch = char.match(SYMBOL_PATTERN)
  if (Array.isArray(symbolMatch) && symbolMatch.length > 0) {
    return STRING_INDEX_TYPES.SYMBOL
  }
  return Number.isNaN(n) ? STRING_INDEX_TYPES.ALPHA : STRING_INDEX_TYPES.NUMERIC
}

export function makeRegex(data: RegexTypes[]): string {
  let result = ''

  if (Array.isArray(data)) {
    for (const segment of data) {
      if (segment.type === STRING_INDEX_TYPES.ALPHA) {
        result = `${result}${ALPHA_GROUP}{${segment.count}}`
        continue
      }
      if (segment.type === STRING_INDEX_TYPES.NUMERIC) {
        result = `${result}${NUMERIC_GROUP}{${segment.count}}`
        continue
      }
      if (segment.type === STRING_INDEX_TYPES.SYMBOL) {
        result = `${result}${SYMBOL_GROUP}{${segment.count}}`
      }
    }
  }

  return `^${result}$`
}

export function getRegexTypesFromString(str: string): RegexTypes[] {
  const strArray = str.split('')
  const data: RegexTypes[] = []
  let currentIndex = 0
  let currentIndexType = ''

  for (const char of strArray) {
    const n = Number(char)

    if (!currentIndex && !currentIndexType) {
      currentIndexType = determineType(char, n)
      data.push({
        chars: [char],
        count: 1,
        type: currentIndexType,
      })
      continue
    }

    const nextIndexType = determineType(char, n)

    if (Number.isNaN(n)) {
      if (
        (currentIndexType === STRING_INDEX_TYPES.ALPHA &&
          nextIndexType === STRING_INDEX_TYPES.ALPHA) ||
        (currentIndexType === STRING_INDEX_TYPES.SYMBOL &&
          nextIndexType === STRING_INDEX_TYPES.SYMBOL)
      ) {
        data[currentIndex].count = data[currentIndex].count += 1
        data[currentIndex].chars.push(char)
        continue
      }

      currentIndex = currentIndex += 1
      currentIndexType = nextIndexType
      data.push({
        chars: [char],
        count: 1,
        type: nextIndexType,
      })
      continue
    }

    if (!Number.isNaN(n)) {
      if (currentIndexType === STRING_INDEX_TYPES.NUMERIC) {
        data[currentIndex].count = data[currentIndex].count += 1
        data[currentIndex].chars.push(char)
        continue
      }

      currentIndex = currentIndex += 1
      currentIndexType = STRING_INDEX_TYPES.NUMERIC
      data.push({
        chars: [char],
        count: 1,
        type: currentIndexType,
      })
    }
  }

  return data
}

/**
 * Takes a string and returns a generic regex for it
 * Used for matching predicate emails
 * @param str strging to compute
 */
export function computeRegex(str: string): string {
  const regexTypesArr = getRegexTypesFromString(str)
  const regex = makeRegex(regexTypesArr)
  return regex
}
