import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import TextField from '../../../Atoms/InputsRHF/TextField'
import Button from '../../../Atoms/Button'
import { loginSchema, type LoginFormData } from './loginSchema'

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  const onSubmit = () => {
    toast.info('Autenticação ainda não está disponível.')
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Entrar</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <TextField
          label="E-mail"
          type="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          label="Senha"
          type="password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit">Entrar</Button>
      </form>
      <p className="mt-4">
        <Link to="/esqueci-senha">Esqueci minha senha</Link>
      </p>
    </div>
  )
}

export default Login
