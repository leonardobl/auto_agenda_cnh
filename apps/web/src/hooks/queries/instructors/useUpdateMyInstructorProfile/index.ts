import { useMutation, useQueryClient } from '@tanstack/react-query'
import { InstructorService } from '../../../../services/InstructorService'
import { showApiErrorToast } from '../../../../Apis/handleApiError'

export function useUpdateMyInstructorProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (phone: string) => InstructorService.updateMe(phone),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors', 'me'] })
    },
    onError: showApiErrorToast,
  })
}
