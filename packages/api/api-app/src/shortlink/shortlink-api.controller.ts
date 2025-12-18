import type { Request, Response } from 'express'

import { sendBadRequest, sendOK } from '@dx3/api-libs/http-response/http-responses'
import { ShortlinkService } from '@dx3/api-libs/shortlink/shortlink-api.service'

export const ShortlinkController = {
  getTarget: async (req: Request, res: Response) => {
    try {
      const { id } = req.params as { id: string }
      const service = new ShortlinkService()
      const result = await service.getShortlinkTarget(id)
      if (result) {
        return sendOK(req, res, result)
      }

      sendBadRequest(req, res, 'No target for this url.')
    } catch (err) {
      sendBadRequest(req, res, err.message)
    }
  },
}

export type ShortlinkControllerType = typeof ShortlinkController
