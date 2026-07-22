import { z } from 'zod'

// Email is set once at invite time and can't be changed afterwards, so create
// and edit intentionally use different schemas rather than one with an
// optional email.
export const userCreateSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Enter a valid email address'),
  roles: z.array(z.string()).min(1, 'Select at least one role'),
  managerId: z.string(),
})

export const userEditSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  roles: z.array(z.string()).min(1, 'Select at least one role'),
  managerId: z.string(),
})
