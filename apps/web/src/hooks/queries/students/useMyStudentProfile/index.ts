import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { StudentService } from '../../../../services/StudentService'
import { showApiErrorToast } from '../../../../Apis/handleApiError'

export function useMyStudentProfile() {
  const query = useQuery({
    queryKey: ['students', 'me'],
    queryFn: () => StudentService.getMe(),
  })

  useEffect(() => {
    if (query.error) {
      showApiErrorToast(query.error)
    }
  }, [query.error])

  return query
}
