import type { Request, Response } from 'express'

import { DevicesService } from '@dx3/api-libs/devices/devices-api.service'
import { sendBadRequest, sendOK } from '@dx3/api-libs/http-response/http-responses'
import { logRequest } from '@dx3/api-libs/logger/log-request.util'

export const DevicesController = {
  disconnectDevice: async (req: Request, res: Response) => {
    logRequest({ req, type: 'disconnectDevice' })
    try {
      const service = new DevicesService()
      const { id } = req.params as { id: string }
      const result = await service.disconnectDevice(id)
      sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed disconnectDevice' })
      sendBadRequest(req, res, err.message)
    }
  },

  updateFcmToken: async (req: Request, res: Response) => {
    logRequest({ req, type: 'updateFcmToken' })
    try {
      const service = new DevicesService()
      const { fcmToken } = req.body as {
        fcmToken: string
      }
      const userId = req.user?.id || ''
      const result = await service.updateFcmToken(userId, fcmToken)
      sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed updateFcmToken' })
      sendBadRequest(req, res, err.message)
    }
  },

  updatePublicKey: async (req: Request, res: Response) => {
    logRequest({ req, type: 'updatePublicKey' })
    try {
      const service = new DevicesService()
      const { uniqueDeviceId, biometricPublicKey } = req.body as {
        uniqueDeviceId: string
        biometricPublicKey: string
      }
      const result = await service.updatePublicKey(uniqueDeviceId, biometricPublicKey)
      sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed updatePublicKey' })
      sendBadRequest(req, res, err.message)
    }
  },
}

export type DevicesControllerType = typeof DevicesController
