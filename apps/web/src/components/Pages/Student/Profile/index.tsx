import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import TextField from '../../../Atoms/InputsRHF/TextField'
import Button from '../../../Atoms/Button'
import { profileSchema, type ProfileFormValues } from './profileSchema'
import { useProfilePage } from './useProfilePage'

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
}

function Profile() {
  const { student, category, isLoading, isPending, onSubmit } = useProfilePage()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: student ? { phone: student.phone } : undefined,
  })

  if (isLoading || !student) {
    return (
      <div>
        <h1 className="mb-4 text-xl font-semibold">Perfil</h1>
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Perfil</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <TextField label="Nome completo" value={student.full_name} disabled readOnly />
        <TextField label="Documento" value={student.document ?? '—'} disabled readOnly />
        <TextField
          label="Categoria pretendida"
          value={category ? `${category.code} — ${category.name}` : '—'}
          disabled
          readOnly
        />
        <TextField
          label="Status"
          value={STATUS_LABELS[student.status] ?? student.status}
          disabled
          readOnly
        />
        <TextField label="Telefone" error={errors.phone?.message} {...register('phone')} />
        <Button type="submit" disabled={isPending}>
          Salvar
        </Button>
      </form>
    </div>
  )
}

export default Profile
