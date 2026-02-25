import { z } from 'zod'

import { USER_LOOKUPS } from '@dx3/models-shared'

const deviceAuthSchema = z.object({
  carrier: z.string().optional(),
  deviceCountry: z.string().optional(),
  deviceId: z.string().optional(),
  name: z.string().optional(),
  uniqueDeviceId: z.string().min(1),
})

export const accountCreationBodySchema = z.object({
  code: z.string().min(1),
  device: deviceAuthSchema.optional(),
  region: z.string().optional(),
  value: z.string().min(1),
})

export const checkPasswordStrengthBodySchema = z.object({
  password: z.string().min(1),
})

const biometricLoginParamSchema = z.object({
  device: deviceAuthSchema.nullable(),
  signature: z.string(),
  userId: z.string().min(1),
})

export const loginBodySchema = z.object({
  biometric: biometricLoginParamSchema.optional(),
  code: z.string().optional(),
  password: z.string().optional(),
  region: z.string().optional(),
  value: z.string().min(1),
})

export const userLookupQuerySchema = z.object({
  code: z.string().optional(),
  region: z.string().optional(),
  type: z.enum([USER_LOOKUPS.EMAIL, USER_LOOKUPS.PHONE]),
  value: z.string().min(1),
})

export const sendOtpToEmailBodySchema = z.object({
  email: z.string().email(),
  strict: z.boolean().optional(),
})

export const sendOtpToPhoneBodySchema = z.object({
  phone: z.string().min(1),
  regionCode: z.string().optional(),
  strict: z.boolean().optional(),
})

export const rejectDeviceParamsSchema = z.object({
  id: z.string().min(1),
})

export const sendOtpByIdBodySchema = z.object({
  id: z.string().min(1),
  type: z.enum(['EMAIL', 'PHONE']),
})

export const validateEmailParamsSchema = z.object({
  token: z.string().min(1),
})
