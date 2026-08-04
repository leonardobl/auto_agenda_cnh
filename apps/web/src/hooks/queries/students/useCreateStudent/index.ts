import { useMutation, useQueryClient } from '@tanstack/react-query'
import { StudentService } from '../../../../services/StudentService'
import { showApiErrorToast } from '../../../../Apis/handleApiError'

export function useCreateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: StudentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
    onError: showApiErrorToast,
  })
}
