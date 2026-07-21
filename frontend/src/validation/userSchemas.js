import { z } from 'zod'

// Email is set once at invite time and can't be changed afterwards, so create
// and edit intentionally use different schemas rather than one with an
// optional email.
export const userCreateSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Enter a valid email address'),
  role: z.string().min(1, 'Please select a role'),
})

export const userEditSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  role: z.string().min(1, 'Please select a role'),
})
