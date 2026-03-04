import {
  useCheckPasswordStrengthMutation,
  useCreateAccountMutation,
  useLoginMutation,
  useLogoutMutation,
  useOtpRequestEmailMutation,
  useOtpRequestIdMutation,
  useOtpRequestPhoneMutation,
} from './auth-web.api'

describe('auth-web.api exported hooks', () => {
  it('should export useCheckPasswordStrengthMutation', () => {
    expect(useCheckPasswordStrengthMutation).toBeDefined()
    expect(typeof useCheckPasswordStrengthMutation).toBe('function')
  })

  it('should export useCreateAccountMutation', () => {
    expect(useCreateAccountMutation).toBeDefined()
    expect(typeof useCreateAccountMutation).toBe('function')
  })

  it('should export useLoginMutation', () => {
    expect(useLoginMutation).toBeDefined()
    expect(typeof useLoginMutation).toBe('function')
  })

  it('should export useLogoutMutation', () => {
    expect(useLogoutMutation).toBeDefined()
    expect(typeof useLogoutMutation).toBe('function')
  })

  it('should export useOtpRequestEmailMutation', () => {
    expect(useOtpRequestEmailMutation).toBeDefined()
    expect(typeof useOtpRequestEmailMutation).toBe('function')
  })

  it('should export useOtpRequestIdMutation', () => {
    expect(useOtpRequestIdMutation).toBeDefined()
    expect(typeof useOtpRequestIdMutation).toBe('function')
  })

  it('should export useOtpRequestPhoneMutation', () => {
    expect(useOtpRequestPhoneMutation).toBeDefined()
    expect(typeof useOtpRequestPhoneMutation).toBe('function')
  })
})
