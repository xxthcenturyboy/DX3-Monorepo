import type { Request, Response } from 'express'

import { sendOK } from '../http-response/http-responses'

export const LivesController = {
  getLives: (req: Request, res: Response) => {
    sendOK(req, res, 'OK')
  },
}
