import { useMutation, useQueryClient } from '@tanstack/react-query'
import { StudentService } from '../../../../services/StudentService'
import { showApiErrorToast } from '../../../../Apis/handleApiError'

interface CreateStudentAccountInput {
  id: string
  email: string
  password: string
}

export function useCreateStudentAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, email, password }: CreateStudentAccountInput) =>
      StudentService.createAccount(id, { email, password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
    onError: showApiErrorToast,
  })
}
