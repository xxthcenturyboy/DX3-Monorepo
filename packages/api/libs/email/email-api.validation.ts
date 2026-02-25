import { z } from 'zod'

export const checkEmailAvailabilityBodySchema = z.object({
  email: z.string().email(),
})

export const createEmailBodySchema = z.object({
  code: z.string().optional(),
  def: z.boolean(),
  email: z.string().email(),
  label: z.string().min(1),
  signature: z.string().optional(),
  userId: z.string().min(1),
})

export const updateEmailBodySchema = z.object({
  def: z.boolean().optional(),
  label: z.string().optional(),
})

export const emailParamsSchema = z.object({
  id: z.string().min(1),
})
