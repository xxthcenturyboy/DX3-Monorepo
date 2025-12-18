import dayjs from 'dayjs'

import type { DeviceAuthType } from '@dx3/models-shared'

import { webUrl } from '../../config/config-api.service'
import { MailSendgrid } from '../../mail/mail-api-sendgrid'
import { IP_POOL_NAME, UNSUBSCRIBE_GROUPS } from '../../mail/mail-api-sendgrid.const'
import type { SendgridSendOptionsType } from '../../mail/mail-api-sendgrid.types'
import type { UserModelType } from '../../user/user-api.postgres-model'

export class SecurityAlertSerivice {
  /**
   * when a new device is connected to a user that already had one connected,
   * notify them via email and text.
   */
  public static async newDeviceNotification(
    user: UserModelType,
    device: DeviceAuthType,
    token: string,
  ) {
    const time = dayjs().format('dddd, MMMM D YYYY, h:mm:ss a')
    const email = (await user.getVerifiedEmail()) || (await user.getDefaultEmail())
    const phone = (await user.getVerifiedPhone()) || (await user.getDefaultPhone())
    const currentDevice = await user.fetchConnectedDeviceBeforeToken(token)
    const rejectionUrl = `${webUrl()}/confirm-device-rejection?token=${token}&dn=${encodeURIComponent(currentDevice?.name || '')}`

    if (email) {
      const sgOptions: SendgridSendOptionsType = {
        body: `
          A new device connection was initiated to your account on ${time}.
          <br /><br />
          Details of the device are as follows:
          <br /><br />
          Device Name: ${device.name || 'N/A'}<br/>
          Country: ${device.deviceCountry || 'N/A'}<br/>
          Carrier: ${device.carrier || 'N/A'}<br/>
          <br /><br />
          If this was you, no action is required on your part. You can safely disregard this email.

          If this wasn't you, please click the button below to reject / disallow the new device:

          <br /><br />
        `,
        cta: 'Reject Device',
        ctaUrl: rejectionUrl,
        ipPoolName: IP_POOL_NAME.TRANSACTIONAL,
        subject: `Device Connection Request [${dayjs().format('YYYY-MM-DD HH:mm:ss')}]`,
        to: email,
        unsubscribeGroup: UNSUBSCRIBE_GROUPS.TRANSACTIONAL,
      }
      const mail = new MailSendgrid()
      await mail.sendAccountAlert(sgOptions)
    }

    if (phone) {
      const _message = `
        A new device connection was initiated to your account on ${time}.

        Details of the device are as follows:

        Device Name: ${device.name || 'N/A'}
        Country: ${device.deviceCountry || 'N/A'}
        Carrier: ${device.carrier || 'N/A'}

        If this was you, no action is required on your part. You can safely disregard this message.

        If this wasn't you, click here to reject / disallow the new device: ${rejectionUrl}.
      `
      // TODO: integrate SMS Service method
      // sendSMS(phone, message);
    }
  }
}

export type SecurityAlertSeriviceType = typeof SecurityAlertSerivice.prototype
