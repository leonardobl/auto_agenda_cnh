import { z } from 'zod'

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Informe o e-mail.').email('Informe um e-mail válido.'),
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
