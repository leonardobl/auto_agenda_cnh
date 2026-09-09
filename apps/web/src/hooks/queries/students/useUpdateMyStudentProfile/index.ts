import { useMutation, useQueryClient } from '@tanstack/react-query'
import { StudentService } from '../../../../services/StudentService'
import { showApiErrorToast } from '../../../../Apis/handleApiError'

export function useUpdateMyStudentProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (phone: string) => StudentService.updateMe(phone),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', 'me'] })
    },
    onError: showApiErrorToast,
  })
}
