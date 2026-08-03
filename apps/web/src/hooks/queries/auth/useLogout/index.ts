import { useMutation } from '@tanstack/react-query'
import { AuthService } from '../../../../services/AuthService'
import { showApiErrorToast } from '../../../../Apis/handleApiError'

export function useLogout() {
  return useMutation({
    mutationFn: () => AuthService.logout(),
    onError: showApiErrorToast,
  })
}
