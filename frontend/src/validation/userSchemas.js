import { z } from 'zod'

export const userFormSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Enter a valid email address'),
  role: z.string().min(1, 'Please select a role'),
})
