import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import TextField from '../../../Atoms/InputsRHF/TextField'
import SelectField from '../../../Atoms/InputsRHF/SelectField'
import Button from '../../../Atoms/Button'
import {
  availabilitySchema,
  blockSchema,
  type AvailabilityFormValues,
  type BlockFormValues,
} from './availabilitySchema'
import { useAvailabilityPage } from './useAvailabilityPage'

const WEEKDAY_LABELS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

interface AvailabilityFormProps {
  isSubmitting: boolean
  onSubmit: (values: AvailabilityFormValues) => void
}

function AvailabilityForm({ isSubmitting, onSubmit }: AvailabilityFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AvailabilityFormValues>({ resolver: zodResolver(availabilitySchema) })

  const submit = handleSubmit((values) => {
    onSubmit(values)
    reset()
  })

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 sm:flex-row sm:items-end" noValidate>
      <SelectField label="Dia da semana" error={errors.weekday?.message} {...register('weekday')}>
        <option value="">Selecione...</option>
        {WEEKDAY_LABELS.map((label, index) => (
          <option key={label} value={index}>
            {label}
          </option>
        ))}
      </SelectField>
      <TextField
        label="Início"
        type="time"
        error={errors.startTime?.message}
        {...register('startTime')}
      />
      <TextField label="Fim" type="time" error={errors.endTime?.message} {...register('endTime')} />
      <Button type="submit" disabled={isSubmitting}>
        Adicionar
      </Button>
    </form>
  )
}

interface BlockFormProps {
  isSubmitting: boolean
  onSubmit: (values: BlockFormValues) => void
}

function BlockForm({ isSubmitting, onSubmit }: BlockFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BlockFormValues>({ resolver: zodResolver(blockSchema) })

  const submit = handleSubmit((values) => {
    onSubmit(values)
    reset()
  })

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 sm:flex-row sm:items-end" noValidate>
      <TextField
        label="Início"
        type="datetime-local"
        error={errors.startAt?.message}
        {...register('startAt')}
      />
      <TextField label="Fim" type="datetime-local" error={errors.endAt?.message} {...register('endAt')} />
      <TextField label="Motivo" error={errors.reason?.message} {...register('reason')} />
      <Button type="submit" disabled={isSubmitting}>
        Adicionar
      </Button>
    </form>
  )
}

function Availability() {
  const {
    availability,
    blocks,
    isLoading,
    handleAddAvailability,
    handleAddBlock,
    isAddingAvailability,
    isAddingBlock,
  } = useAvailabilityPage()

  if (isLoading) {
    return (
      <div>
        <h1 className="mb-4 text-xl font-semibold">Disponibilidade</h1>
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold">Disponibilidade</h1>

      <section className="flex flex-col gap-4">
        <h2 className="font-medium">Janelas semanais</h2>
        <AvailabilityForm isSubmitting={isAddingAvailability} onSubmit={handleAddAvailability} />

        {availability.length === 0 ? (
          <p>Nenhuma janela de disponibilidade cadastrada.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {availability.map((window) => (
              <li key={window.id} className="rounded-lg border border-solid p-3">
                {WEEKDAY_LABELS[window.weekday]}, {window.start_time} às {window.end_time}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-medium">Bloqueios</h2>
        <BlockForm isSubmitting={isAddingBlock} onSubmit={handleAddBlock} />

        {blocks.length === 0 ? (
          <p>Nenhum bloqueio cadastrado.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {blocks.map((block) => (
              <li key={block.id} className="rounded-lg border border-solid p-3">
                {formatDateTime(block.start_at)} até {formatDateTime(block.end_at)} — {block.reason}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default Availability
