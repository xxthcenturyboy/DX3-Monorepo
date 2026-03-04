jest.mock('react-toastify', () => ({
  toast: { info: jest.fn() },
}))

jest.mock('../config/config-web.service', () => ({
  WebConfigService: {
    isDev: jest.fn().mockReturnValue(true),
  },
}))

import { toast } from 'react-toastify'

import { WebConfigService } from '../config/config-web.service'
import { showDevOtpCode } from './ui-web-otp-dev.toast'

describe('showDevOtpCode', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should show a toast in dev mode when code is provided', () => {
    ;(WebConfigService.isDev as jest.Mock).mockReturnValue(true)
    showDevOtpCode('123456')
    expect(toast.info).toHaveBeenCalledWith(expect.stringContaining('123456'), expect.any(Object))
  })

  it('should not show a toast when not in dev mode', () => {
    ;(WebConfigService.isDev as jest.Mock).mockReturnValue(false)
    showDevOtpCode('123456')
    expect(toast.info).not.toHaveBeenCalled()
  })

  it('should not show a toast when code is undefined', () => {
    ;(WebConfigService.isDev as jest.Mock).mockReturnValue(true)
    showDevOtpCode(undefined)
    expect(toast.info).not.toHaveBeenCalled()
  })

  it('should include DEV MODE label in toast message', () => {
    ;(WebConfigService.isDev as jest.Mock).mockReturnValue(true)
    showDevOtpCode('999888')
    expect(toast.info).toHaveBeenCalledWith(expect.stringContaining('DEV MODE'), expect.any(Object))
  })
})
