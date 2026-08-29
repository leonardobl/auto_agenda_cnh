import { useMutation } from '@tanstack/react-query'
import { AuthService } from '../../../../services/AuthService'
import { showApiErrorToast } from '../../../../Apis/handleApiError'

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => AuthService.forgotPassword(email),
    onError: showApiErrorToast,
  })
}
