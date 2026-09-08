import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { InstructorService } from '../../../../services/InstructorService'
import { showApiErrorToast } from '../../../../Apis/handleApiError'

export function useMyInstructorProfile() {
  const query = useQuery({
    queryKey: ['instructors', 'me'],
    queryFn: () => InstructorService.getMe(),
  })

  useEffect(() => {
    if (query.error) {
      showApiErrorToast(query.error)
    }
  }, [query.error])

  return query
}
