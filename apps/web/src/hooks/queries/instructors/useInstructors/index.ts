import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { InstructorService, type ListInstructorsParams } from '../../../../services/InstructorService'
import { showApiErrorToast } from '../../../../Apis/handleApiError'

export function useInstructors(params: ListInstructorsParams) {
  const query = useQuery({
    queryKey: ['instructors', params],
    queryFn: () => InstructorService.list(params),
  })

  useEffect(() => {
    if (query.error) {
      showApiErrorToast(query.error)
    }
  }, [query.error])

  return query
}
