import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import TextField from '../../../Atoms/InputsRHF/TextField'
import Button from '../../../Atoms/Button'
import { resetPasswordSchema, type ResetPasswordFormData } from './resetPasswordSchema'

function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({ resolver: zodResolver(resetPasswordSchema) })

  const onSubmit = () => {
    toast.info('Redefinição de senha ainda não está disponível.')
  }

  if (!token) {
    return (
      <div>
        <h1 className="mb-4 text-xl font-semibold">Redefinir senha</h1>
        <p>Link inválido ou expirado.</p>
        <p className="mt-4">
          <Link to="/esqueci-senha">Solicitar novo link</Link>
        </p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Redefinir senha</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <TextField
          label="Nova senha"
          type="password"
          error={errors.password?.message}
          {...register('password')}
        />
        <TextField
          label="Confirmar nova senha"
          type="password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button type="submit">Redefinir senha</Button>
      </form>
    </div>
  )
}

export default ResetPassword
