import { useMutation, useQueryClient } from '@tanstack/react-query'
import { InstructorService } from '../../../../services/InstructorService'
import { showApiErrorToast } from '../../../../Apis/handleApiError'

export function useCreateInstructor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: InstructorService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] })
    },
    onError: showApiErrorToast,
  })
}
