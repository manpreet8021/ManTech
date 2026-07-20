import { z } from 'zod'

// Mirrors PASSWORD_REGEX in backend/controller/authController.js — keep these in sync.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

export const passwordSchema = z
  .string()
  .regex(
    PASSWORD_REGEX,
    'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.',
  )

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const acceptInviteSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  password: passwordSchema,
})

export const resetPasswordSchema = z.object({
  password: passwordSchema,
})
