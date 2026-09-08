import { z } from 'zod'

export const profileSchema = z.object({
  phone: z.string().min(1, 'Informe o telefone.'),
})

export type ProfileFormValues = z.infer<typeof profileSchema>
