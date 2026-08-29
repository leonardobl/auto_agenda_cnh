import { useMutation } from '@tanstack/react-query'
import { AuthService } from '../../../../services/AuthService'
import { showApiErrorToast } from '../../../../Apis/handleApiError'

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      AuthService.resetPassword(token, password),
    onError: showApiErrorToast,
  })
}
