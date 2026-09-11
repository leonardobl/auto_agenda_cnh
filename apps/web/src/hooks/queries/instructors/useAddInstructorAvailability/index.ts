import { useMutation, useQueryClient } from '@tanstack/react-query'
import { InstructorService, type AddAvailabilityData } from '../../../../services/InstructorService'
import { showApiErrorToast } from '../../../../Apis/handleApiError'

interface AddInstructorAvailabilityInput {
  instructorId: string
  data: AddAvailabilityData
}

export function useAddInstructorAvailability() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ instructorId, data }: AddInstructorAvailabilityInput) =>
      InstructorService.addAvailability(instructorId, data),
    onSuccess: (_result, { instructorId }) => {
      queryClient.invalidateQueries({ queryKey: ['instructors', instructorId, 'availability'] })
    },
    onError: showApiErrorToast,
  })
}
