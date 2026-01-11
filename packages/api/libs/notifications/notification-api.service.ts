import { NIL as NIL_UUID } from 'uuid'

import { ERROR_CODES, NOTIFICATION_LEVELS } from '@dx3/models-shared'
import { sleep } from '@dx3/utils-shared'

import { ApiLoggingClass, type ApiLoggingClassType } from '../logger'
import { UserModel } from '../user/user-api.postgres-model'
import { createApiErrorMessage } from '../utils'
import { NotificationModel } from './notification-api.postgres-model'
import { NotificationSocketApiService } from './notification-api.socket'
// import admin from 'firebase-admin';

export class NotificationService {
  logger: ApiLoggingClassType
  systemId: string

  constructor() {
    this.logger = ApiLoggingClass.instance
    this.systemId = NIL_UUID
  }

  public async getNotificationsByUserId(
    userId: string,
  ): Promise<{ system: NotificationModel[]; user: NotificationModel[] }> {
    if (!userId && typeof userId !== 'string') {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.GENERIC_VALIDATION_FAILED, 'Missing userId'),
      )
    }

    try {
      const userNotifications = await NotificationModel.getByUserId(userId)
      const systemNotifications = await NotificationModel.getSystemNotifications()
      return {
        system: systemNotifications,
        user: userNotifications,
      }
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }

  public async getAppBadgeCount(userId: string) {
    try {
      const user = await UserModel.findByPk(userId)
      if (!user) return 0

      const notifications = await this.getNotificationsByUserId(userId)
      const notificationsCount = notifications.system.length + notifications.user.length

      return {
        system: notifications.system.length,
        total: notificationsCount,
        user: notifications.user.length,
      }
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }

  private async sendDeviceNotification(
    userId: string,
    _message: string,
    _title?: string,
    _route?: string,
  ): Promise<void> {
    try {
      const user = await UserModel.findByPk(userId)
      if (!user) {
        throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_VALIDATION_FAILED, 'No user'))
      }

      const _badge = await this.getAppBadgeCount(userId)

      // TODO: Implement Device Push
      const _device = await user.fetchConnectedDevice()
      // if (device && device.fcmToken) {
      // const tileMessage = title ? title : message;
      // const body = title ? message : '';
      // const routeString = route ? route : '';
      //   await admin.messaging().send({
      //     token: device.fcmToken,
      //     notification: {
      //       title: tileMessage,
      //       body
      //     },
      //     data: {
      //       type: 'DEFAULT_NOTIFICATION',
      //       title: tileMessage,
      //       body,
      //       route: routeString,
      //       badgeCount: badge.toString()
      //     },
      //     apns: {
      //       payload: {
      //         aps: { badge }
      //       }
      //     }
      //   });
      // }
    } catch (err) {
      this.logger.logError(err)
      throw err
    }
  }

  public async createAndSend(
    userId: string,
    message: string,
    level: string,
    title?: string,
    route?: string,
    suppressPush?: boolean,
  ): Promise<NotificationModel> {
    try {
      if (!userId && !message) {
        throw new Error(
          createApiErrorMessage(ERROR_CODES.GENERIC_VALIDATION_FAILED, 'Missing params'),
        )
      }

      const notification = await NotificationModel.createNew({
        level,
        message,
        route,
        title,
        userId,
      })

      NotificationSocketApiService.instance.sendNotificationToUser(notification)

      if (!suppressPush) {
        this.sendDeviceNotification(userId, message, title, route)
      }
      return notification
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.NOTIFICATION_CREATE_FAILED, msg))
    }
  }

  public async createAndSendToAll(
    message: string,
    level: string,
    title?: string,
    route?: string,
    suppressPush?: boolean,
  ): Promise<NotificationModel> {
    try {
      if (!message) {
        throw new Error(
          createApiErrorMessage(ERROR_CODES.GENERIC_VALIDATION_FAILED, 'Missing params'),
        )
      }

      const notification = await NotificationModel.createNew({
        level,
        message,
        route,
        title,
        userId: this.systemId,
      })

      NotificationSocketApiService.instance.sendNotificationToAll(notification)

      if (!suppressPush) {
        this.sendDeviceNotification(this.systemId, message, title, route)
      }
      return notification
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.NOTIFICATION_CREATE_FAILED, msg))
    }
  }

  public async createAndSendAppUpdate(): Promise<void> {
    try {
      NotificationSocketApiService.instance.sendAppUpdateNotification(
        'The applicaiton has been updated. Refresh your browser to get the latest update.',
      )
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.NOTIFICATION_CREATE_FAILED, msg))
    }
  }

  public async markAllAsRead(userId: string): Promise<[number]> {
    if (!userId && typeof userId !== 'string') {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.GENERIC_VALIDATION_FAILED, 'Missing params'),
      )
    }

    try {
      const notif = await NotificationModel.markAllAsRead(userId)
      return notif
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }

  public async markViewed(userId: string): Promise<[number]> {
    if (!userId && typeof userId !== 'string') {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.GENERIC_VALIDATION_FAILED, 'Missing params'),
      )
    }

    try {
      return NotificationModel.markAsViewed(userId)
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }

  public async markAsRead(id: string): Promise<[number]> {
    if (!id && typeof id !== 'string') {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.GENERIC_VALIDATION_FAILED, 'Missing params'),
      )
    }

    try {
      return NotificationModel.markAsRead(id)
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }

  public async markAllDismissed(userId: string): Promise<[number]> {
    if (!userId && typeof userId !== 'string') {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.GENERIC_VALIDATION_FAILED, 'Missing params'),
      )
    }

    try {
      const notif = await NotificationModel.markAllDismissed(userId)
      return notif
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }

  public async markAsDismissed(id: string): Promise<[number]> {
    if (!id && typeof id !== 'string') {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.GENERIC_VALIDATION_FAILED, 'Missing params'),
      )
    }

    try {
      return NotificationModel.markAsDismissed(id)
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }

  public async testSockets(userId: string): Promise<void> {
    for (const level of Object.keys(NOTIFICATION_LEVELS)) {
      await this.createAndSend(userId, `Test Message for: ${level}`, level, `${level} Notificaion`)
      await sleep(1000)
    }

    NotificationSocketApiService.instance.sendAppUpdateNotification(
      'The applicaiton has been updated. Refresh your browser to get the latest update.',
    )
  }
}

export type NotificationServiceType = typeof NotificationService.prototype
