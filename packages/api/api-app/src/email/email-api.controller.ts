import type { Request, Response } from 'express'

import { EmailService } from '@dx3/api-libs/email/email-api.service'
import { sendBadRequest, sendOK } from '@dx3/api-libs/http-response/http-responses'
import type { CreateEmailPayloadType, UpdateEmailPayloadType } from '@dx3/models-shared'

export const EmailController = {
  checkAvailability: async (req: Request, res: Response) => {
    try {
      const service = new EmailService()
      const { email } = req.body as { email: string }
      await service.isEmailAvailableAndValid(email)
      return sendOK(req, res, { isAvailable: true })
    } catch (err) {
      sendBadRequest(req, res, err.message)
    }
  },

  createEmail: async (req: Request, res: Response) => {
    try {
      const service = new EmailService()
      const result = await service.createEmail(req.body as CreateEmailPayloadType)
      if (result.id) {
        return sendOK(req, res, result)
      }

      sendBadRequest(req, res, `Email could not be created.`)
    } catch (err) {
      sendBadRequest(req, res, err.message)
    }
  },

  deleteEmail: async (req: Request, res: Response) => {
    try {
      const { id } = req.params as { id: string }
      const service = new EmailService()
      const result = await service.deleteEmail(id)
      if (result.id) {
        return sendOK(req, res, result)
      }

      sendBadRequest(req, res, `Email could not be deleted.`)
    } catch (err) {
      sendBadRequest(req, res, err.message)
    }
  },

  deleteEmailTest: async (req: Request, res: Response) => {
    try {
      const { id } = req.params as { id: string }
      const service = new EmailService()
      const result = await service.deleteTestEmail(id)
      return sendOK(req, res, result)
    } catch (err) {
      sendBadRequest(req, res, err.message)
    }
  },

  deleteEmailUserProfile: async (req: Request, res: Response) => {
    try {
      const { id } = req.params as { id: string }
      const service = new EmailService()
      const result = await service.deleteEmail(id, req.user?.id)
      if (result.id) {
        return sendOK(req, res, result)
      }

      sendBadRequest(req, res, `Email could not be deleted.`)
    } catch (err) {
      sendBadRequest(req, res, err.message)
    }
  },

  updateEmail: async (req: Request, res: Response) => {
    try {
      const { id } = req.params as { id: string }
      const service = new EmailService()
      const result = await service.updateEmail(id, req.body as UpdateEmailPayloadType)
      if (result.id) {
        return sendOK(req, res, result)
      }

      sendBadRequest(req, res, `Email could not be updated.`)
    } catch (err) {
      sendBadRequest(req, res, err.message)
    }
  },

  validateTestEmail: async (req: Request, res: Response) => {
    try {
      const { email } = req.body as { email: string }
      const service = new EmailService()
      await service.validateTestEmail(email)
      return sendOK(req, res, {})
    } catch (err) {
      sendBadRequest(req, res, err.message)
    }
  },
}

export type EmailControllerType = typeof EmailController
