import { z } from 'zod'

import {
  FEATURE_FLAG_NAMES_ARRAY,
  FEATURE_FLAG_STATUS_ARRAY,
  FEATURE_FLAG_TARGET_ARRAY,
} from '@dx3/models-shared'

export const createFeatureFlagBodySchema = z.object({
  description: z.string(),
  name: z.enum(FEATURE_FLAG_NAMES_ARRAY as unknown as [string, ...string[]]),
  percentage: z.number().nullable().optional(),
  status: z.enum(FEATURE_FLAG_STATUS_ARRAY as unknown as [string, ...string[]]),
  target: z.enum(FEATURE_FLAG_TARGET_ARRAY as unknown as [string, ...string[]]),
})

export const updateFeatureFlagBodySchema = z.object({
  description: z.string().optional(),
  id: z.string().min(1),
  name: z.enum(FEATURE_FLAG_NAMES_ARRAY as unknown as [string, ...string[]]).optional(),
  percentage: z.number().nullable().optional(),
  status: z.enum(FEATURE_FLAG_STATUS_ARRAY as unknown as [string, ...string[]]).optional(),
  target: z.enum(FEATURE_FLAG_TARGET_ARRAY as unknown as [string, ...string[]]).optional(),
})

export const getFeatureFlagsListQuerySchema = z.object({
  filterValue: z.string().optional(),
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional(),
  orderBy: z.string().optional(),
  sortDir: z.string().optional(),
})
