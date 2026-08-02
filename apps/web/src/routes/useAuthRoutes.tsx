import { Route } from 'react-router-dom'
import AuthLayoutTemplate from '../components/Templates/AuthLayoutTemplate'
import Login from '../components/Pages/Auth/Login'
import ForgotPassword from '../components/Pages/Auth/ForgotPassword'
import ResetPassword from '../components/Pages/Auth/ResetPassword'

export function useAuthRoutes() {
  return (
    <Route element={<AuthLayoutTemplate />}>
      <Route path="/login" element={<Login />} />
      <Route path="/esqueci-senha" element={<ForgotPassword />} />
      <Route path="/redefinir-senha" element={<ResetPassword />} />
    </Route>
  )
}
