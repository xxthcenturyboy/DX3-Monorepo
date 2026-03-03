import {
  convertpHyphensToUnderscores,
  hyphenatedToCamelCaseConcatenated,
  hyphenatedToTilteCaseConcatenated,
  obfuscateEmail,
  obfuscatePhone,
  sentenceToTitleCase,
  slugify,
  stringToTitleCase,
  stripHyphens,
  truncateString,
  uppercase,
} from './strings.util'

describe('convertpHyphensToUnderscores', () => {
  // arrange
  const stringToTransform = 'this-string-has-hyphens'
  // act
  const transformed = convertpHyphensToUnderscores(stringToTransform)
  // assert
  it('should convert a string with hyphens to underscores when called', () => {
    expect(transformed).toEqual('this_string_has_hyphens')
  })
})

describe('hyphenatedToCamelCaseConcatenated', () => {
  // arrange
  const stringToTransform = 'my-words-to-transform'
  // act
  const transformed = hyphenatedToCamelCaseConcatenated(stringToTransform)
  // assert
  it('should transform a hyphenated string to Camel case and concatenate it when called', () => {
    expect(transformed).toEqual('myWordsToTransform')
  })
})

describe('hyphenatedToTilteCaseConcatenated', () => {
  // arrange
  const stringToTransform = 'my-words-to-transform'
  // act
  const transformed = hyphenatedToTilteCaseConcatenated(stringToTransform)
  // assert
  it('should transform a hyphenated string to Title case and concatenate it when called', () => {
    expect(transformed).toEqual('MyWordsToTransform')
  })
})

describe('sentenceToTitleCase', () => {
  // arrange
  const stringToTransform = 'I am a sentence.'
  // act
  const transformed = sentenceToTitleCase(stringToTransform)
  // assert
  it('should transform a sentence to Title case when called', () => {
    expect(transformed).toEqual('I Am A Sentence.')
  })
})

describe('stringToTitleCase', () => {
  // arrange
  const stringToTransform = 'lowercase'
  // act
  const transformed = stringToTitleCase(stringToTransform)
  // assert
  it('should transform a string to Title case when called', () => {
    expect(transformed).toEqual('Lowercase')
  })
})

describe('stripHyphens', () => {
  // arrange
  const stringToTransform = 'this-string-has-hyphens'
  // act
  const transformed = stripHyphens(stringToTransform)
  // assert
  it('should strip a string of hyphens when called', () => {
    expect(transformed).toEqual('thisstringhashyphens')
  })
})

describe('uppercase', () => {
  // arrange
  const stringToTransform = 'lowercase'
  // act
  const transformed = uppercase(stringToTransform)
  // assert
  it('should transform a string to UPPER case when called', () => {
    expect(transformed).toEqual('LOWERCASE')
  })
})

describe('obfuscateEmail', () => {
  it('should obfuscate a standard email keeping first 2 chars of local part', () => {
    // arrange
    // act
    const result = obfuscateEmail('john.doe@example.com')
    // assert
    expect(result).toEqual('jo********@example.com')
  })

  it('should obfuscate an email when local part is exactly 2 characters', () => {
    // arrange
    // act
    const result = obfuscateEmail('ab@example.com')
    // assert — local length <= 2: appends masked directly after local
    expect(result).toEqual('ab********@example.com')
  })

  it('should obfuscate an email when local part is 1 character', () => {
    // arrange
    // act
    const result = obfuscateEmail('a@example.com')
    // assert — local length <= 2: appends masked directly after local
    expect(result).toEqual('a********@example.com')
  })

  it('should return the input unchanged when email has no @ symbol', () => {
    // arrange
    // act
    const result = obfuscateEmail('notanemail')
    // assert
    expect(result).toEqual('notanemail')
  })

  it('should return the input unchanged when email is an empty string', () => {
    // arrange
    // act
    const result = obfuscateEmail('')
    // assert
    expect(result).toEqual('')
  })

  it('should preserve the domain part intact after obfuscation', () => {
    // arrange
    // act
    const result = obfuscateEmail('user@sub.domain.org')
    // assert
    expect(result).toContain('@sub.domain.org')
  })
})

describe('obfuscatePhone', () => {
  it('should obfuscate a standard phone number keeping last 4 digits', () => {
    // arrange
    // act
    const result = obfuscatePhone('+14155551234')
    // assert
    expect(result).toEqual('********1234')
  })

  it('should obfuscate a 10-digit phone number', () => {
    // arrange
    // act
    const result = obfuscatePhone('5551234567')
    // assert
    expect(result).toEqual('********4567')
  })

  it('should return the input unchanged when phone is 4 characters or fewer', () => {
    // arrange
    // act
    const result = obfuscatePhone('1234')
    // assert — length <= 4 triggers early return
    expect(result).toEqual('1234')
  })

  it('should return the input unchanged when phone is an empty string', () => {
    // arrange
    // act
    const result = obfuscatePhone('')
    // assert
    expect(result).toEqual('')
  })

  it('should always end with the original last 4 characters', () => {
    // arrange
    // act
    const result = obfuscatePhone('9999999999')
    // assert
    expect(result.slice(-4)).toEqual('9999')
  })
})

describe('slugify', () => {
  it('should convert a title to a URL-safe lowercase slug', () => {
    // arrange
    // act
    const result = slugify('Hello World')
    // assert
    expect(result).toEqual('hello-world')
  })

  it('should replace multiple spaces with a single hyphen', () => {
    // arrange
    // act
    const result = slugify('hello   world')
    // assert
    expect(result).toEqual('hello-world')
  })

  it('should remove non-alphanumeric characters except hyphens', () => {
    // arrange
    // act
    const result = slugify('Hello, World! (2024)')
    // assert
    expect(result).toEqual('hello-world-2024')
  })

  it('should trim leading and trailing whitespace', () => {
    // arrange
    // act
    const result = slugify('  padded title  ')
    // assert
    expect(result).toEqual('padded-title')
  })

  it('should collapse multiple consecutive hyphens into one', () => {
    // arrange
    // act
    const result = slugify('hello---world')
    // assert
    expect(result).toEqual('hello-world')
  })

  it('should handle a title that is already a valid slug', () => {
    // arrange
    // act
    const result = slugify('already-a-slug')
    // assert
    expect(result).toEqual('already-a-slug')
  })
})

describe('truncateString', () => {
  it('should return the original string when it is shorter than the length limit', () => {
    // arrange
    // act
    const result = truncateString('short', 10)
    // assert
    expect(result).toEqual('short')
  })

  it('should return the original string when it equals the length limit exactly', () => {
    // arrange
    // act
    const result = truncateString('exactly10c', 10)
    // assert
    expect(result).toEqual('exactly10c')
  })

  it('should truncate and append "..." when string exceeds the length limit', () => {
    // arrange
    // act
    const result = truncateString('this is a very long string', 10)
    // assert
    expect(result).toEqual('this is a ...')
  })

  it('should truncate to exactly `length` characters before the ellipsis', () => {
    // arrange
    // act
    const result = truncateString('abcdefghij_overflow', 10)
    // assert
    expect(result).toEqual('abcdefghij...')
    expect(result.startsWith('abcdefghij')).toBe(true)
  })

  it('should always end with "..." when truncation occurs', () => {
    // arrange
    // act
    const result = truncateString('a'.repeat(50), 5)
    // assert
    expect(result.endsWith('...')).toBe(true)
  })
})
