import { z } from 'zod'

export const createAccountSchema = z.object({
  email: z.string().min(1, 'Informe o e-mail.').email('Informe um e-mail válido.'),
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres.'),
})

export type CreateAccountSchemaValues = z.infer<typeof createAccountSchema>
