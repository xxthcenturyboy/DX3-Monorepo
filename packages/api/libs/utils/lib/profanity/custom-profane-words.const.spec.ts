import { CUSTOM_PROFANE_WORDS } from './custom-profane-words.const'

describe('Custom Profane Words', () => {
  it('should exist', () => {
    // arrange
    // act
    // assert
    expect(CUSTOM_PROFANE_WORDS).toBeDefined()
    expect(Array.isArray(CUSTOM_PROFANE_WORDS)).toBe(true)
  })
})
