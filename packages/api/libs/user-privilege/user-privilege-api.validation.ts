import { z } from 'zod'

import { USER_ROLE_ARRAY } from '@dx3/models-shared'

export const updatePrivilegeSetBodySchema = z.object({
  description: z.string().optional(),
  id: z.string().optional(),
  name: z.enum(USER_ROLE_ARRAY as unknown as [string, ...string[]]).optional(),
  order: z.number().optional(),
})

export const privilegeSetParamsSchema = z.object({
  id: z.string().min(1),
})
