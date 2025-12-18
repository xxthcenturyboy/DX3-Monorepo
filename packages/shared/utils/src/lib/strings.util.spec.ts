import {
  convertpHyphensToUnderscores,
  hyphenatedToCamelCaseConcatenated,
  hyphenatedToTilteCaseConcatenated,
  sentenceToTitleCase,
  stringToTitleCase,
  stripHyphens,
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
