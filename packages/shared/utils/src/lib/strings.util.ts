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

export function obfuscateEmail(email: string): string {
  if (!email || !email.includes('@')) {
    return email
  }
  const masked = '*'.repeat(8)
  const [local, domain] = email.split('@')
  if (local.length <= 2) {
    return `${local}${masked}@${domain}`
  }
  const start = local.slice(0, 2)
  return `${start}${masked}@${domain}`
}

export function obfuscatePhone(phone: string): string {
  if (!phone || phone.length <= 4) {
    return phone
  }
  const masked = '*'.repeat(8)
  const last4 = phone.slice(-4)
  return `${masked}${last4}`
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

export function truncateString (subject: string, length: number): string {
  if (subject.length <= length) {
    return subject
  }
  return `${subject.substring(0, length)}...`
}
