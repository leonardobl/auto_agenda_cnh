import { isAxiosError } from 'axios'
import { toast } from 'react-toastify'
import type { ApiErrorResponse } from './apiError'

export function showApiErrorToast(error: unknown): void {
  if (isAxiosError<ApiErrorResponse>(error) && error.response) {
    const { message } = error.response.data
    toast.error(message)
    return
  }
  toast.error('Erro inesperado. Tente novamente.')
}
