import type { Request, Response } from 'express'

import { EmailService } from '@dx3/api-libs/email/email-api.service'
import { sendBadRequest, sendOK } from '@dx3/api-libs/http-response/http-responses'
import { logRequest } from '@dx3/api-libs/logger/log-request.util'
import type { CreateEmailPayloadType, UpdateEmailPayloadType } from '@dx3/models-shared'

export const EmailController = {
  checkAvailability: async (req: Request, res: Response) => {
    logRequest({ req, type: 'checkAvailability' })
    try {
      const service = new EmailService()
      const { email } = req.body as { email: string }
      await service.isEmailAvailableAndValid(email)
      return sendOK(req, res, { isAvailable: true })
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed checkAvailability' })
      sendBadRequest(req, res, err.message)
    }
  },

  createEmail: async (req: Request, res: Response) => {
    logRequest({ req, type: 'createEmail' })
    try {
      const service = new EmailService()
      const result = await service.createEmail(req.body as CreateEmailPayloadType)
      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed createEmail' })
      sendBadRequest(req, res, err.message)
    }
  },

  deleteEmail: async (req: Request, res: Response) => {
    logRequest({ req, type: 'deleteEmail' })
    try {
      const { id } = req.params as { id: string }
      const service = new EmailService()
      const result = await service.deleteEmail(id)
      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed deleteEmail' })
      sendBadRequest(req, res, err.message)
    }
  },

  deleteEmailUserProfile: async (req: Request, res: Response) => {
    logRequest({ req, type: 'deleteEmailUserProfile' })
    try {
      const { id } = req.params as { id: string }
      const service = new EmailService()
      const result = await service.deleteEmail(id, req.user?.id)
      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed deleteEmailUserProfile' })
      sendBadRequest(req, res, err.message)
    }
  },

  updateEmail: async (req: Request, res: Response) => {
    logRequest({ req, type: 'updateEmail' })
    try {
      const { id } = req.params as { id: string }
      const service = new EmailService()
      const result = await service.updateEmail(id, req.body as UpdateEmailPayloadType)
      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed updateEmail' })
      sendBadRequest(req, res, err.message)
    }
  },
}

export type EmailControllerType = typeof EmailController
