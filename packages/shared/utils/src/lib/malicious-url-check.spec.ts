import { maliciousUrlCheck } from './malicious-url-check'

const WEB_DOMAIN = 'test.com'
const WEB_URL = `https://${WEB_DOMAIN}`

describe('maliciousUrlCheck', () => {
  it('should throw on a potentially maliciouls url', () => {
    // arrange
    const urlToCheck = `https://${WEB_DOMAIN}.com`
    // act & assert
    expect(() => {
      maliciousUrlCheck(WEB_DOMAIN, WEB_URL, urlToCheck)
    }).toThrow(`Possible malicious attack - check URL: ${urlToCheck}`)
  })

  it('should run without error on a url that is the main domain', () => {
    // arrange
    // act
    maliciousUrlCheck(WEB_DOMAIN, WEB_URL, WEB_URL)
    // assert
    expect(true).toBeTruthy()
  })

  it('should run without error on a benign url', () => {
    // arrange
    const urlToCheck = `${WEB_URL}/this-url-should-still-point-to-our-site`
    // act
    maliciousUrlCheck(WEB_DOMAIN, WEB_URL, urlToCheck)
    // assert
    expect(true).toBeTruthy()
  })

  it('should run without error on a benign url', () => {
    // arrange
    const urlToCheck = `/in-app-route`
    // act
    maliciousUrlCheck(WEB_DOMAIN, WEB_URL, urlToCheck)
    // assert
    expect(true).toBeTruthy()
  })
})
