import type { Request, Response } from 'express'

import { sendBadRequest, sendOK } from '@dx3/api-libs/http-response/http-responses'
import { logRequest } from '@dx3/api-libs/logger/log-request.util'
import { ShortlinkService } from '@dx3/api-libs/shortlink/shortlink-api.service'

export const ShortlinkController = {
  getTarget: async (req: Request, res: Response) => {
    logRequest({ req, type: 'getTarget' })
    try {
      const { id } = req.params as { id: string }
      const service = new ShortlinkService()
      const result = await service.getShortlinkTarget(id)
      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed getTarget' })
      sendBadRequest(req, res, err.message)
    }
  },
}

export type ShortlinkControllerType = typeof ShortlinkController
