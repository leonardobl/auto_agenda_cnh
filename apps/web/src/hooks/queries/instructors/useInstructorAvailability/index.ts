import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { InstructorService } from '../../../../services/InstructorService'
import { showApiErrorToast } from '../../../../Apis/handleApiError'

export function useInstructorAvailability(instructorId: string | undefined) {
  const query = useQuery({
    queryKey: ['instructors', instructorId, 'availability'],
    queryFn: () => InstructorService.listAvailability(instructorId!),
    enabled: Boolean(instructorId),
  })

  useEffect(() => {
    if (query.error) {
      showApiErrorToast(query.error)
    }
  }, [query.error])

  return query
}
