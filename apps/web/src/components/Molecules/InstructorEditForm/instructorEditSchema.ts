import { z } from 'zod'

export const instructorEditSchema = z.object({
  fullName: z.string().min(1, 'Informe o nome completo.'),
  document: z.string().optional(),
  credentialNumber: z.string().min(1, 'Informe o registro profissional.'),
  phone: z.string().min(1, 'Informe o telefone.'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
})

export type InstructorEditFormValues = z.infer<typeof instructorEditSchema>
