export function convertpHyphensToUnderscores(str: string): string {
  return str.replace(/-/g, '_')
}

export function hyphenatedToCamelCaseConcatenated(str: string): string {
  return str
    .toLowerCase()
    .split('-')
    .map((word, index) => (index === 0 ? word : stringToTitleCase(word)))
    .join('')
}

export function hyphenatedToTilteCaseConcatenated(str: string): string {
  return str
    .toLowerCase()
    .split('-')
    .map((word) => stringToTitleCase(word))
    .join('')
}

export function sentenceToTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => stringToTitleCase(word))
    .join(' ')
}

export function stringToTitleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase(),
  )
}

export function stripHyphens(str: string): string {
  return str.replace(/-/g, '')
}

export function uppercase(val: string) {
  return val.toUpperCase()
}
