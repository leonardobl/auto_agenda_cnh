import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import TextField from '../../../Atoms/InputsRHF/TextField'
import Button from '../../../Atoms/Button'
import { loginSchema, type LoginFormData } from './loginSchema'
import { useLogin } from '../../../../hooks/queries/auth/useLogin'
import { setSessionToken } from '../../../../utils/sessionToken'

const ROLE_HOME_ROUTES: Record<string, string> = {
  ADMIN: '/admin',
  INSTRUCTOR: '/instrutor',
  STUDENT: '/aluno',
}

function Login() {
  const navigate = useNavigate()
  const { mutate: login, isPending } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  const onSubmit = (data: LoginFormData) => {
    login(data, {
      onSuccess: ({ token, user }) => {
        setSessionToken(token)
        const destino = ROLE_HOME_ROUTES[user.role] ?? '/'
        navigate(destino)
      },
    })
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
        <Button type="submit" disabled={isPending}>
          Entrar
        </Button>
      </form>
      <p className="mt-4">
        <Link to="/esqueci-senha">Esqueci minha senha</Link>
      </p>
    </div>
  )
}

export default Login
