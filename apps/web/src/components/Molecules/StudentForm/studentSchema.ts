import { z } from 'zod'

export const studentSchema = z.object({
  fullName: z.string().min(1, 'Informe o nome completo.'),
  document: z.string().optional(),
  phone: z.string().min(1, 'Informe o telefone.'),
  birthDate: z.string().optional(),
  categoryId: z.string().min(1, 'Selecione uma categoria.'),
})

export type StudentFormValues = z.infer<typeof studentSchema>
