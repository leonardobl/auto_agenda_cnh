import { useMutation, useQueryClient } from '@tanstack/react-query'
import { StudentService } from '../../../../services/StudentService'
import { showApiErrorToast } from '../../../../Apis/handleApiError'

export function useDeactivateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => StudentService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
    onError: showApiErrorToast,
  })
}
