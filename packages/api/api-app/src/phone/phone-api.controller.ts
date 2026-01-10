import type { Request, Response } from 'express'

import { sendBadRequest, sendOK } from '@dx3/api-libs/http-response/http-responses'
import { logRequest } from '@dx3/api-libs/logger/log-request.util'
import { PhoneService } from '@dx3/api-libs/phone/phone-api.service'
import type { CreatePhonePayloadType, UpdatePhonePayloadType } from '@dx3/models-shared'

export const PhoneController = {
  checkAvailability: async (req: Request, res: Response) => {
    logRequest({ req, type: 'checkAvailability' })
    try {
      const service = new PhoneService()
      const { phone, regionCode } = req.body as { phone: string; regionCode: string }
      await service.isPhoneAvailableAndValid(phone, regionCode)
      return sendOK(req, res, { isAvailable: true })
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed checkAvailability' })
      sendBadRequest(req, res, err.message)
    }
  },

  createPhone: async (req: Request, res: Response) => {
    logRequest({ req, type: 'createPhone' })
    try {
      const service = new PhoneService()
      const result = await service.createPhone(req.body as CreatePhonePayloadType)
      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed createPhone' })
      sendBadRequest(req, res, err.message)
    }
  },

  deletePhone: async (req: Request, res: Response) => {
    logRequest({ req, type: 'deletePhone' })
    try {
      const { id } = req.params as { id: string }
      const service = new PhoneService()
      const result = await service.deletePhone(id)
      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed deletePhone' })
      sendBadRequest(req, res, err.message)
    }
  },

  deletePhoneUserProfile: async (req: Request, res: Response) => {
    logRequest({ req, type: 'deletePhoneUserProfile' })
    try {
      const { id } = req.params as { id: string }
      const service = new PhoneService()
      const result = await service.deletePhone(id, req.user?.id)
      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed deletePhoneUserProfile' })
      sendBadRequest(req, res, err.message)
    }
  },

  updatePhone: async (req: Request, res: Response) => {
    logRequest({ req, type: 'updatePhone' })
    try {
      const { id } = req.params as { id: string }
      const service = new PhoneService()
      const result = await service.updatePhone(id, req.body as UpdatePhonePayloadType)
      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed updatePhone' })
      sendBadRequest(req, res, err.message)
    }
  },
}

export type PhoneControllerType = typeof PhoneController
