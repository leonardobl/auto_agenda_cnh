import { useMutation } from '@tanstack/react-query'
import { AuthService } from '../../../../services/AuthService'
import { showApiErrorToast } from '../../../../Apis/handleApiError'

export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      AuthService.login(email, password),
    onError: showApiErrorToast,
  })
}
