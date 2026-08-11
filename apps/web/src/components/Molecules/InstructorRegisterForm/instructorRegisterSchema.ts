import { z } from 'zod'

export const instructorRegisterSchema = z.object({
  email: z.string().min(1, 'Informe o e-mail.').email('Informe um e-mail válido.'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.'),
  fullName: z.string().min(1, 'Informe o nome completo.'),
  document: z.string().optional(),
  credentialNumber: z.string().min(1, 'Informe o registro profissional.'),
  phone: z.string().min(1, 'Informe o telefone.'),
})

export type InstructorRegisterFormValues = z.infer<typeof instructorRegisterSchema>
