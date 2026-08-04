import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import TextField from '../../Atoms/InputsRHF/TextField'
import SelectField from '../../Atoms/InputsRHF/SelectField'
import Button from '../../Atoms/Button'
import { useLicenseCategories } from '../../../hooks/queries/students/useLicenseCategories'
import { studentSchema, type StudentFormValues } from './studentSchema'

interface StudentFormProps {
  defaultValues?: Partial<StudentFormValues>
  onSubmit: (data: StudentFormValues) => void
  isSubmitting?: boolean
  submitLabel: string
}

function StudentForm({ defaultValues, onSubmit, isSubmitting, submitLabel }: StudentFormProps) {
  const { data: categories } = useLicenseCategories()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <TextField label="Nome completo" error={errors.fullName?.message} {...register('fullName')} />
      <TextField label="Documento" error={errors.document?.message} {...register('document')} />
      <TextField label="Telefone" error={errors.phone?.message} {...register('phone')} />
      <TextField
        label="Data de nascimento"
        type="date"
        error={errors.birthDate?.message}
        {...register('birthDate')}
      />
      <SelectField label="Categoria pretendida" error={errors.categoryId?.message} {...register('categoryId')}>
        <option value="">Selecione...</option>
        {categories?.map((category) => (
          <option key={category.id} value={category.id}>
            {category.code} — {category.name}
          </option>
        ))}
      </SelectField>
      <Button type="submit" disabled={isSubmitting}>
        {submitLabel}
      </Button>
    </form>
  )
}

export default StudentForm
