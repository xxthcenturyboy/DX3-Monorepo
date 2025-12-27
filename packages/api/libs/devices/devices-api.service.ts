import { randomUUID } from 'node:crypto'

import type { DeviceAuthType, DeviceType } from '@dx3/models-shared'

import { SecurityAlertSerivice } from '../auth/alerts/security-alert.service'
import { isDev } from '../config/config-api.service'
import { ApiLoggingClass, type ApiLoggingClassType } from '../logger'
import { UserModel, type UserModelType } from '../user/user-api.postgres-model'
import { DeviceModel } from './device-api.postgres-model'
import { FACIAL_AUTH_STATE } from './devices-api.consts'

export class DevicesService {
  private LOCAL = isDev()
  logger: ApiLoggingClassType

  constructor() {
    this.logger = ApiLoggingClass.instance
  }

  private async sendNewDeviceDataMessage({
    fcmToken,
    device,
    userId,
  }: {
    fcmToken: string
    device: DeviceAuthType
    userId: string
  }): Promise<string> {
    if (!fcmToken) return ''

    const name = device.name && device.name !== 'Unknown' ? device.name : 'New Device'
    const data = {
      carrier: device.carrier || '',
      country: device.deviceCountry || '',
      deviceId: device.deviceId || '',
      name,
      type: 'NEW_DEVICE',
    }
    const _body = `Details:
    Device ID: ${data.deviceId}
    Device Name: ${data.name}
    Carrier: ${data.carrier}
    Country: ${data.country}
    If you do not recognize this device, please log into your account using this device or log into your web account to disconnect the new device.`

    // TODO: Implement from Notifications once built
    // const badgeCount = await getAppBadgeCount(userId);

    // TODO: Firebuase not installed yet
    // const message: admin.messaging.Message = {
    //   token: fcmToken,
    //   data,
    //   apns: {
    //     payload: {
    //       aps: {
    //         badge: badgeCount + 1
    //       }
    //     }
    //   }
    // };
    // // TODO: Send email notification to user's verified email
    // return await admin.messaging().send(message).then((m) => { console.log(' DEBUG send FCM DATA MESSAGE RESPONSE::', m); return m; });
    return 'OK'
  }

  private async sendNewDeviceUpdateNotification({
    fcmToken,
    device,
  }: {
    fcmToken: string
    device: DeviceAuthType
  }): Promise<boolean | null> {
    // ): Promise<admin.messaging.MessagingDevicesResponse | null> {
    if (!fcmToken) return null

    const name = device.name && device.name !== 'Unknown' ? device.name : 'New Device'
    const data = {
      carrier: device.carrier || '',
      country: device.deviceCountry || '',
      deviceId: device.deviceId || '',
      name,
      type: 'NEW_DEVICE',
    }
    const _body = `Details:
    Device ID: ${data.deviceId}
    Device Name: ${data.name}
    Carrier: ${data.carrier}
    Country: ${data.country}
    If you do not recognize this device, please log into your account using this device or log into your web account to disconnect the new device.`

    // TODO: Send email notification to user's verified email
    // TODO: Firebuase not installed yet
    // return await admin.messaging().sendToDevice(fcmToken,
    //   {
    //     notification: {
    //       title: `Login from new device: ${name}`,
    //       body
    //     },
    //     data,
    //   },
    //   {
    //     priority: 'high',
    //     badge: 1,
    //   });
    return true
  }

  public async handleDevice(
    device: DeviceAuthType,
    user: UserModelType,
    bypass = false,
  ): Promise<DeviceType | undefined> {
    try {
      // check if facial auth is possible
      const facialAuthState = (await user.getVerifiedPhone())
        ? FACIAL_AUTH_STATE.CHALLENGE
        : FACIAL_AUTH_STATE.NOT_APPLICABLE
      const existingDevice = await DeviceModel.findOne({
        where: {
          deletedAt: null,
          uniqueDeviceId: device.uniqueDeviceId,
        },
      })

      const existingUserDevice = await user.fetchConnectedDevice()
      // const isSameDevice = existingDevice && existingDevice.userId === user.id && existingUserDevice;

      // Unused device, none on user => connect
      // DeviceModel previously used by this user => treat as new connection
      if (!existingDevice && !existingUserDevice) {
        // console.log('Unused device, none on user => connect');

        return await DeviceModel.create({
          ...device,
          userId: user.id,
          verificationToken: randomUUID(),
          verifiedAt: new Date(),
        })
      }

      // Unused device, user has another connected
      if (
        !existingDevice &&
        existingUserDevice &&
        existingUserDevice.uniqueDeviceId !== device.uniqueDeviceId
      ) {
        // console.log('Unused device, user has another connected: send notif');
        existingUserDevice.deletedAt = new Date()
        await existingUserDevice.save()
        void this.sendNewDeviceDataMessage({
          device,
          fcmToken: existingUserDevice.fcmToken,
          userId: user.id,
        })
        void this.sendNewDeviceUpdateNotification({
          device,
          fcmToken: existingUserDevice.fcmToken,
        })

        const addedDevice = await DeviceModel.create({
          ...device,
          facialAuthState,
          userId: user.id,
          verificationToken: randomUUID(),
        })
        if (bypass) {
          addedDevice.verifiedAt = new Date()
          addedDevice.facialAuthState = FACIAL_AUTH_STATE.NOT_APPLICABLE
          await addedDevice.save()
          return addedDevice
        }

        await SecurityAlertSerivice.newDeviceNotification(
          user,
          device,
          addedDevice.verificationToken,
        )
        return addedDevice
      }

      // DeviceModel is used but connected to another user => transfer over
      if (existingDevice && existingDevice.userId !== user.id) {
        // console.log('DeviceModel is used but connected to another user => transfer over- send notif');
        existingDevice.deletedAt = new Date()
        await existingDevice.save()

        // delete any existing devices for user
        const existingUserDevices = await DeviceModel.findAll({
          where: {
            deletedAt: null,
            userId: user.id,
          },
        })
        for (const userDevice of existingUserDevices) {
          userDevice.deletedAt = new Date()
          await userDevice.save()
        }

        const addedDevice = await DeviceModel.create({
          ...device,
          facialAuthState,
          userId: user.id,
          verificationToken: randomUUID(),
          verifiedAt: new Date(),
        })

        await SecurityAlertSerivice.newDeviceNotification(
          user,
          device,
          addedDevice.verificationToken,
        )
        return addedDevice
      }
    } catch (err) {
      this.logger.logError((err as Error).message)
      throw new Error((err as Error).message)
    }
  }

  public async disconnectDevice(deviceId: string) {
    if (!deviceId) {
      throw new Error('DisconnectDevice: Not enough data to execute.')
    }

    try {
      const discoed = await DeviceModel.markDeleted(deviceId)
      if (!discoed) {
        throw new Error('Device not found.')
      }
      return { message: 'Device disconnected.' }
    } catch (err) {
      this.logger.logError((err as Error).message)
      throw new Error((err as Error).message)
    }
  }

  public async rejectDevice(token: string) {
    if (!token) {
      throw new Error('Reject Device: Token is required')
    }

    try {
      const device = await DeviceModel.findByVerificationToken(token)
      if (!device) {
        throw new Error('Reject Device: Invalid Token.')
      }

      if (!device.user?.id) {
        throw new Error('Reject Device: User not attached to device.')
      }

      const previousDevice = await device.user.fetchConnectedDeviceBeforeToken(token)
      if (!previousDevice) {
        throw new Error('Reject Device: No previous device exists.')
      }

      // delete the offending device
      await device.destroy()

      // re-animate the previous device
      previousDevice.deletedAt = null
      await previousDevice.save()

      // TODO - Lock user account for a period of time?
      // TODO - send notification ?

      return previousDevice
    } catch (err) {
      this.logger.logError((err as Error).message)
      throw new Error((err as Error).message)
    }
  }

  public async updateFcmToken(userId: string, fcmToken: string) {
    if (!fcmToken) {
      throw new Error('Update FCM Token: Insufficient data to complete request.')
    }

    try {
      const user = await UserModel.findByPk(userId)
      if (!user) {
        throw new Error('Update FCM Token: User not found')
      }

      const connectedDevice = await user.fetchConnectedDevice()
      if (!connectedDevice) {
        throw new Error('Update FCM Token: No device connected.')
      }

      if (fcmToken) {
        const isDifferent = fcmToken !== connectedDevice.fcmToken

        if (isDifferent) {
          // Ensure this token isnt used by another device already
          const existing = await DeviceModel.findByFcmTokenNotCurrentUser(fcmToken, userId)
          if (existing) {
            throw new Error('Update FCM Token: Token in use by another user.')
          }

          connectedDevice.fcmToken = fcmToken
          await connectedDevice.save()
        }
      }

      return connectedDevice
    } catch (err) {
      this.logger.logError((err as Error).message)
      throw new Error((err as Error).message)
    }
  }

  public async updatePublicKey(uniqueDeviceId: string, biometricPublicKey: string) {
    if (!uniqueDeviceId || !biometricPublicKey) {
      throw new Error('Update Public Key: Insufficient data to complete request.')
    }

    try {
      const existingDevice = await DeviceModel.findOne({
        where: {
          deletedAt: null,
          uniqueDeviceId,
        },
      })

      if (!existingDevice) {
        throw new Error('Update Public Key: Could not find the device to update.')
      }

      existingDevice.biomAuthPubKey = biometricPublicKey
      await existingDevice.save()

      return existingDevice
    } catch (err) {
      this.logger.logError((err as Error).message)
      throw new Error((err as Error).message)
    }
  }

}

export type DevicesServiceType = typeof DevicesService.prototype
