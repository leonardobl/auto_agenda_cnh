import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { StudentService, type ListStudentsParams } from '../../../../services/StudentService'
import { showApiErrorToast } from '../../../../Apis/handleApiError'

export function useStudents(params: ListStudentsParams) {
  const query = useQuery({
    queryKey: ['students', params],
    queryFn: () => StudentService.list(params),
  })

  useEffect(() => {
    if (query.error) {
      showApiErrorToast(query.error)
    }
  }, [query.error])

  return query
}
