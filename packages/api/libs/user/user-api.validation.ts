import { z } from 'zod'

import { ACCOUNT_RESTRICTIONS, USER_ROLE_ARRAY } from '@dx3/models-shared'

const ACCOUNT_RESTRICTIONS_ARRAY = Object.values(ACCOUNT_RESTRICTIONS)

export const createUserBodySchema = z.object({
  countryCode: z.string().optional(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  regionCode: z.string().optional(),
  roles: z.array(z.enum(USER_ROLE_ARRAY as unknown as [string, ...string[]])).min(1),
  shouldValidate: z.boolean().optional(),
  username: z.string().min(1),
})

export const updatePasswordBodySchema = z.object({
  id: z.string().min(1),
  otp: z
    .object({
      code: z.string(),
      id: z.string(),
      method: z.enum(['PHONE', 'EMAIL']),
    })
    .optional(),
  password: z.string().min(1),
  passwordConfirm: z.string().min(1),
  signature: z.string().optional(),
})

export const updateUserBodySchema = z.object({
  firstName: z.string().optional(),
  id: z.string().min(1),
  lastName: z.string().optional(),
  restrictions: z.array(z.enum(ACCOUNT_RESTRICTIONS_ARRAY as unknown as [string, ...string[]])).optional(),
  roles: z.array(z.enum(USER_ROLE_ARRAY as unknown as [string, ...string[]])).optional(),
  timezone: z.string().optional(),
})

export const updateUsernameBodySchema = z.object({
  otpCode: z.string().optional(),
  signature: z.string().optional(),
  username: z.string().min(1),
})

export const getUserParamsSchema = z.object({
  id: z.string().min(1),
})

export const checkUsernameAvailabilityQuerySchema = z.object({
  username: z.string().min(1),
})

export const getUsersListQuerySchema = z.object({
  filterValue: z.string().optional(),
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional(),
  orderBy: z.string().optional(),
  sortDir: z.string().optional(),
})
