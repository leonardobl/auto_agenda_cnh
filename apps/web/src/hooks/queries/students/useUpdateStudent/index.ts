import { useMutation, useQueryClient } from '@tanstack/react-query'
import { StudentService, type StudentFormData } from '../../../../services/StudentService'
import { showApiErrorToast } from '../../../../Apis/handleApiError'

interface UpdateStudentInput {
  id: string
  data: Partial<StudentFormData>
}

export function useUpdateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: UpdateStudentInput) => StudentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
    onError: showApiErrorToast,
  })
}
