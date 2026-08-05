import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import TextField from '../../Atoms/InputsRHF/TextField'
import SelectField from '../../Atoms/InputsRHF/SelectField'
import Button from '../../Atoms/Button'
import { useLicenseCategories } from '../../../hooks/queries/students/useLicenseCategories'
import { vehicleSchema, type VehicleFormValues } from './vehicleSchema'

interface VehicleFormProps {
  defaultValues?: Partial<VehicleFormValues>
  onSubmit: (data: VehicleFormValues) => void
  isSubmitting?: boolean
  submitLabel: string
}

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Ativo' },
  { value: 'MAINTENANCE', label: 'Manutenção' },
  { value: 'INACTIVE', label: 'Inativo' },
]

function VehicleForm({ defaultValues, onSubmit, isSubmitting, submitLabel }: VehicleFormProps) {
  const { data: categories } = useLicenseCategories()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: { status: 'ACTIVE', ...defaultValues },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <TextField label="Placa" error={errors.plate?.message} {...register('plate')} />
      <TextField label="Marca" error={errors.brand?.message} {...register('brand')} />
      <TextField label="Modelo" error={errors.model?.message} {...register('model')} />
      <TextField label="Ano" type="number" error={errors.year?.message} {...register('year')} />
      <SelectField label="Categoria" error={errors.categoryId?.message} {...register('categoryId')}>
        <option value="">Selecione...</option>
        {categories?.map((category) => (
          <option key={category.id} value={category.id}>
            {category.code} — {category.name}
          </option>
        ))}
      </SelectField>
      <SelectField label="Status" error={errors.status?.message} {...register('status')}>
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectField>
      <Button type="submit" disabled={isSubmitting}>
        {submitLabel}
      </Button>
    </form>
  )
}

export default VehicleForm
