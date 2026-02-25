import { z } from 'zod'

import {
  SUPPORT_CATEGORY_ARRAY,
  SUPPORT_STATUS_ARRAY,
  SUPPORT_VALIDATION,
} from '@dx3/models-shared'

export const createSupportRequestBodySchema = z.object({
  category: z.enum(SUPPORT_CATEGORY_ARRAY as unknown as [string, ...string[]]),
  message: z.string().min(1).max(SUPPORT_VALIDATION.MESSAGE_MAX_LENGTH),
  subject: z.string().min(1).max(SUPPORT_VALIDATION.SUBJECT_MAX_LENGTH),
})

export const updateSupportRequestStatusBodySchema = z.object({
  assignedTo: z.string().optional(),
  status: z.enum(SUPPORT_STATUS_ARRAY as unknown as [string, ...string[]]),
})

export const bulkUpdateSupportStatusBodySchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
  status: z.enum(SUPPORT_STATUS_ARRAY as unknown as [string, ...string[]]),
})

export const getSupportRequestsListQuerySchema = z.object({
  category: z.enum(SUPPORT_CATEGORY_ARRAY as [string, ...string[]]).optional(),
  filterValue: z.string().optional(),
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional(),
  openOnly: z
    .string()
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  orderBy: z.string().optional(),
  sortDir: z.enum(['ASC', 'DESC']).optional(),
  status: z.enum(SUPPORT_STATUS_ARRAY as unknown as [string, ...string[]]).optional(),
  userId: z.string().optional(),
})

export const supportRequestParamsSchema = z.object({
  id: z.string().uuid(),
})

export const userSupportRequestsParamsSchema = z.object({
  userId: z.string().uuid(),
})
