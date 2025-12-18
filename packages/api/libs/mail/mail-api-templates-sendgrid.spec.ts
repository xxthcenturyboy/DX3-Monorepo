import { SG_TEMPLATES } from './mail-api-templates-sendgrid'

describe('SG_TEMPLATES', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(SG_TEMPLATES).toBeDefined()
  })

  it('should have correct properties', () => {
    // arrange
    // act
    // assert
    expect(SG_TEMPLATES.CONFIRM).toBeDefined()
    expect(SG_TEMPLATES.INVITE).toBeDefined()
    expect(SG_TEMPLATES.OTP).toBeDefined()
    expect(SG_TEMPLATES.ACCOUNT_ALERT).toBeDefined()
  })
})
