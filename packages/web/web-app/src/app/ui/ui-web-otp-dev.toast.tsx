import { toast } from 'react-toastify'

import { WebConfigService } from '../config/config-web.service'

export function showDevOtpCode(code?: string): void {
  if (WebConfigService.isDev() && code) {
    toast.info(`DEV MODE: OTP Code: ${code}`, {
      autoClose: 5000,
      closeButton: true,
      closeOnClick: false,
      draggable: true,
      hideProgressBar: true,
      position: 'bottom-center',
      theme: 'colored',
    })
  }
}
