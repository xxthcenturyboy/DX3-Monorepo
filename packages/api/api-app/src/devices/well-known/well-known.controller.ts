import type { Request, Response } from 'express'

import { WellKnownSourcesService } from '@dx3/api-libs/devices/well-known/well-known.dx-mobile.service'
import { sendOK } from '@dx3/api-libs/http-response/http-responses'

export const WellKnownController = {
  getAndroidData: (req: Request, res: Response) => {
    res.set('Content-Type', 'application/pkcs7-mime')
    const data = WellKnownSourcesService.getAndroidData()
    sendOK(req, res, data)
  },
  getAppleData: (req: Request, res: Response) => {
    res.set('Content-Type', 'application/pkcs7-mime')
    const data = WellKnownSourcesService.getAppleData()
    sendOK(req, res, data)
  },
}

export type WellKnownControllerType = typeof WellKnownController
