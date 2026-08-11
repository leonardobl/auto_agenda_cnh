import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import TextField from '../../Atoms/InputsRHF/TextField'
import Button from '../../Atoms/Button'
import { instructorRegisterSchema, type InstructorRegisterFormValues } from './instructorRegisterSchema'

interface InstructorRegisterFormProps {
  onSubmit: (data: InstructorRegisterFormValues) => void
  isSubmitting?: boolean
}

function InstructorRegisterForm({ onSubmit, isSubmitting }: InstructorRegisterFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InstructorRegisterFormValues>({ resolver: zodResolver(instructorRegisterSchema) })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <TextField label="E-mail" type="email" error={errors.email?.message} {...register('email')} />
      <TextField label="Senha" type="password" error={errors.password?.message} {...register('password')} />
      <TextField label="Nome completo" error={errors.fullName?.message} {...register('fullName')} />
      <TextField label="Documento" error={errors.document?.message} {...register('document')} />
      <TextField
        label="Registro profissional"
        error={errors.credentialNumber?.message}
        {...register('credentialNumber')}
      />
      <TextField label="Telefone" error={errors.phone?.message} {...register('phone')} />
      <Button type="submit" disabled={isSubmitting}>
        Cadastrar
      </Button>
    </form>
  )
}

export default InstructorRegisterForm
