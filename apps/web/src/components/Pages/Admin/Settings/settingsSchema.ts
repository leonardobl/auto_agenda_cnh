import { z } from 'zod'

function positiveInteger(message: string) {
  return z.string().refine((value) => {
    const parsed = Number(value)
    return Number.isInteger(parsed) && parsed > 0
  }, message)
}

export const settingsSchema = z
  .object({
    businessHoursStartHour: z.string().refine((value) => {
      const hour = Number(value)
      return Number.isInteger(hour) && hour >= 0 && hour <= 23
    }, 'Informe uma hora entre 0 e 23.'),
    businessHoursEndHour: z.string().refine((value) => {
      const hour = Number(value)
      return Number.isInteger(hour) && hour >= 0 && hour <= 23
    }, 'Informe uma hora entre 0 e 23.'),
    defaultDurationMinutes: positiveInteger('Informe uma duração válida em minutos.'),
    minAdvanceMinutes: positiveInteger('Informe uma antecedência válida em minutos.'),
  })
  .refine((data) => Number(data.businessHoursEndHour) > Number(data.businessHoursStartHour), {
    message: 'O horário final deve ser depois do horário inicial.',
    path: ['businessHoursEndHour'],
  })

export type SettingsFormValues = z.infer<typeof settingsSchema>
