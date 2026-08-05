import { z } from 'zod'

const CURRENT_YEAR = new Date().getFullYear()

export const vehicleSchema = z.object({
  plate: z.string().min(1, 'Informe a placa.'),
  brand: z.string().min(1, 'Informe a marca.'),
  model: z.string().min(1, 'Informe o modelo.'),
  year: z
    .string()
    .min(1, 'Informe o ano.')
    .refine((value) => {
      const year = Number(value)
      return Number.isInteger(year) && year >= 1950 && year <= CURRENT_YEAR + 1
    }, 'Ano inválido.'),
  categoryId: z.string().min(1, 'Selecione uma categoria.'),
  status: z.enum(['ACTIVE', 'MAINTENANCE', 'INACTIVE']),
})

export type VehicleFormValues = z.infer<typeof vehicleSchema>
