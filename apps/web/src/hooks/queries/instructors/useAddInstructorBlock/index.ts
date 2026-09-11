import { useMutation, useQueryClient } from '@tanstack/react-query'
import { InstructorService, type AddBlockData } from '../../../../services/InstructorService'
import { showApiErrorToast } from '../../../../Apis/handleApiError'

interface AddInstructorBlockInput {
  instructorId: string
  data: AddBlockData
}

export function useAddInstructorBlock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ instructorId, data }: AddInstructorBlockInput) =>
      InstructorService.addBlock(instructorId, data),
    onSuccess: (_result, { instructorId }) => {
      queryClient.invalidateQueries({ queryKey: ['instructors', instructorId, 'blocks'] })
    },
    onError: showApiErrorToast,
  })
}
