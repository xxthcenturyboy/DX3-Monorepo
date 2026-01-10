import type { Request, Response } from 'express'

import { sendBadRequest, sendOK } from '@dx3/api-libs/http-response/http-responses'
import { logRequest } from '@dx3/api-libs/logger/log-request.util'
import { UserPrivilegeService } from '@dx3/api-libs/user-privilege/user-privilege-api.service'
import type { UpdatePrivilegeSetPayloadType } from '@dx3/models-shared'

export const PrivilegeSetController = {
  getAllPrivilegeSets: async (req: Request, res: Response) => {
    try {
      const service = new UserPrivilegeService()
      const result = await service.getAllPrivilegeSets()
      if (Array.isArray(result)) {
        return sendOK(req, res, result)
      }

      sendBadRequest(req, res, `No privilege sets found.`)
    } catch (err) {
      sendBadRequest(req, res, err.message)
    }
  },

  updatePrivilegeSet: async (req: Request, res: Response) => {
    logRequest({ req, type: 'updatePrivilegeSet' })
    try {
      const { id } = req.params as { id: string }
      const service = new UserPrivilegeService()
      const result = await service.updatePrivilegeSet(id, req.body as UpdatePrivilegeSetPayloadType)
      if (result.id) {
        return sendOK(req, res, result)
      }

      logRequest({
        message: 'Privilege set could not be updated.',
        req,
        type: 'Failed updatePrivilegeSet',
      })
      sendBadRequest(req, res, `Privilege set could not be updated.`)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed updatePrivilegeSet' })
      sendBadRequest(req, res, err.message)
    }
  },
}

export type PrivilegeSetControllerType = typeof PrivilegeSetController
