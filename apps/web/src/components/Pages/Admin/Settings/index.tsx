import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-toastify'
import TextField from '../../../Atoms/InputsRHF/TextField'
import Button from '../../../Atoms/Button'
import {
  BUSINESS_HOURS_START_HOUR,
  BUSINESS_HOURS_END_HOUR,
  DEFAULT_DURATION_MINUTES,
  MIN_ADVANCE_MINUTES,
} from '../../../../constants/schedulingDefaults'
import { settingsSchema, type SettingsFormValues } from './settingsSchema'

const DEFAULT_VALUES: SettingsFormValues = {
  businessHoursStartHour: String(BUSINESS_HOURS_START_HOUR),
  businessHoursEndHour: String(BUSINESS_HOURS_END_HOUR),
  defaultDurationMinutes: String(DEFAULT_DURATION_MINUTES),
  minAdvanceMinutes: String(MIN_ADVANCE_MINUTES),
}

function Settings() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const onSubmit = (data: SettingsFormValues) => {
    // mocked: no backend, see "O que é real vs. simulado" in README.md — updates
    // only this form's own state for the rest of the session, nothing is persisted.
    reset(data)
    toast.success('Configurações salvas.')
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Configurações</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <TextField
          label="Início do expediente (hora)"
          error={errors.businessHoursStartHour?.message}
          {...register('businessHoursStartHour')}
        />
        <TextField
          label="Fim do expediente (hora)"
          error={errors.businessHoursEndHour?.message}
          {...register('businessHoursEndHour')}
        />
        <TextField
          label="Duração padrão da aula (minutos)"
          error={errors.defaultDurationMinutes?.message}
          {...register('defaultDurationMinutes')}
        />
        <TextField
          label="Antecedência mínima para agendar (minutos)"
          error={errors.minAdvanceMinutes?.message}
          {...register('minAdvanceMinutes')}
        />
        <Button type="submit">Salvar</Button>
      </form>
    </div>
  )
}

export default Settings
