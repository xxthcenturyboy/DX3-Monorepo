import { z } from 'zod'

export const checkPhoneAvailabilityBodySchema = z.object({
  phone: z.string().min(1),
  regionCode: z.string().min(1),
})

export const createPhoneBodySchema = z.object({
  code: z.string().optional(),
  countryCode: z.string().optional(),
  def: z.boolean(),
  label: z.string().min(1),
  phone: z.string().min(1),
  regionCode: z.string().optional(),
  signature: z.string().optional(),
  userId: z.string().min(1),
})

export const updatePhoneBodySchema = z.object({
  def: z.boolean().optional(),
  label: z.string().optional(),
})

export const phoneParamsSchema = z.object({
  id: z.string().min(1),
})
