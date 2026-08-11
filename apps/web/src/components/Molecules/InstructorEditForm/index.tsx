import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import TextField from '../../Atoms/InputsRHF/TextField'
import SelectField from '../../Atoms/InputsRHF/SelectField'
import Button from '../../Atoms/Button'
import { instructorEditSchema, type InstructorEditFormValues } from './instructorEditSchema'

interface InstructorEditFormProps {
  defaultValues: InstructorEditFormValues
  onSubmit: (data: InstructorEditFormValues) => void
  isSubmitting?: boolean
}

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Ativo' },
  { value: 'INACTIVE', label: 'Inativo' },
]

function InstructorEditForm({ defaultValues, onSubmit, isSubmitting }: InstructorEditFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InstructorEditFormValues>({
    resolver: zodResolver(instructorEditSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <TextField label="Nome completo" error={errors.fullName?.message} {...register('fullName')} />
      <TextField label="Documento" error={errors.document?.message} {...register('document')} />
      <TextField
        label="Registro profissional"
        error={errors.credentialNumber?.message}
        {...register('credentialNumber')}
      />
      <TextField label="Telefone" error={errors.phone?.message} {...register('phone')} />
      <SelectField label="Status" error={errors.status?.message} {...register('status')}>
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectField>
      <Button type="submit" disabled={isSubmitting}>
        Salvar
      </Button>
    </form>
  )
}

export default InstructorEditForm
