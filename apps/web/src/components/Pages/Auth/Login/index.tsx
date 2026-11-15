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
      <div
        role="note"
        className="mb-6 rounded-lg border border-warning bg-warning/10 p-4 text-sm text-warning"
      >
        <p className="font-semibold">⚠️ Projeto de testes — Cruzeiro do Sul Virtual</p>
        <p className="mt-1">
          O AutoAgenda é um projeto acadêmico (Projeto Integrador II) publicado apenas para fins
          de demonstração e avaliação. Não é um serviço real: os dados aqui são fictícios e podem
          ser apagados ou recriados a qualquer momento.
        </p>
        <p className="mt-3 font-semibold">Use uma das contas de demonstração abaixo:</p>
        <ul className="mt-1 list-disc pl-5">
          <li>
            Administrador — <strong>admin@autoagenda.local</strong> / <strong>Demo@123</strong>
          </li>
          <li>
            Instrutor — <strong>instrutor1@autoagenda.local</strong> / <strong>Demo@123</strong>
          </li>
          <li>
            Aluno — <strong>aluno1@autoagenda.local</strong> / <strong>Demo@123</strong>
          </li>
        </ul>
      </div>
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
