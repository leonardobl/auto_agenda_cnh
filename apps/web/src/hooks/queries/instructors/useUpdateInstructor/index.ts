import { useMutation, useQueryClient } from '@tanstack/react-query'
import { InstructorService, type InstructorProfileData } from '../../../../services/InstructorService'
import { showApiErrorToast } from '../../../../Apis/handleApiError'

interface UpdateInstructorInput {
  id: string
  data: Partial<InstructorProfileData>
}

export function useUpdateInstructor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: UpdateInstructorInput) => InstructorService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] })
    },
    onError: showApiErrorToast,
  })
}
