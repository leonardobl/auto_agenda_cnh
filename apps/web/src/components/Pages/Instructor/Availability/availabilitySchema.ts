import { z } from 'zod'

export const availabilitySchema = z
  .object({
    weekday: z.string().refine((value) => {
      const weekday = Number(value)
      return Number.isInteger(weekday) && weekday >= 0 && weekday <= 6
    }, 'Selecione um dia da semana.'),
    startTime: z.string().min(1, 'Informe o horário inicial.'),
    endTime: z.string().min(1, 'Informe o horário final.'),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: 'O horário final deve ser depois do inicial.',
    path: ['endTime'],
  })

export type AvailabilityFormValues = z.infer<typeof availabilitySchema>

export const blockSchema = z
  .object({
    startAt: z.string().min(1, 'Informe o início do bloqueio.'),
    endAt: z.string().min(1, 'Informe o fim do bloqueio.'),
    reason: z.string().min(1, 'Informe o motivo do bloqueio.'),
  })
  .refine((data) => new Date(data.endAt) > new Date(data.startAt), {
    message: 'O fim deve ser depois do início.',
    path: ['endAt'],
  })

export type BlockFormValues = z.infer<typeof blockSchema>
