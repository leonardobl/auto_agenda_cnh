import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import TextField from '../../../Atoms/InputsRHF/TextField'
import Button from '../../../Atoms/Button'
import { forgotPasswordSchema, type ForgotPasswordFormData } from './forgotPasswordSchema'

function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({ resolver: zodResolver(forgotPasswordSchema) })

  const onSubmit = () => {
    // Real request-sending is stubbed (no backend yet) — the generic confirmation
    // message itself is real UI behavior, shown regardless of whether the email
    // exists, per SEG-005 (docs/07_Seguranca_Privacidade_Auditoria.md).
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div>
        <h1 className="mb-4 text-xl font-semibold">Esqueci minha senha</h1>
        <p>Se o e-mail informado existir, você receberá instruções para redefinir sua senha.</p>
        <p className="mt-4">
          <Link to="/login">Voltar para o login</Link>
        </p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Esqueci minha senha</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <TextField
          label="E-mail"
          type="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Button type="submit">Enviar</Button>
      </form>
      <p className="mt-4">
        <Link to="/login">Voltar para o login</Link>
      </p>
    </div>
  )
}

export default ForgotPassword
