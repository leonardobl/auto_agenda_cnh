import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { InstructorService } from '../../../../services/InstructorService'
import { showApiErrorToast } from '../../../../Apis/handleApiError'

export function useInstructorBlocks(instructorId: string | undefined) {
  const query = useQuery({
    queryKey: ['instructors', instructorId, 'blocks'],
    queryFn: () => InstructorService.listBlocks(instructorId!),
    enabled: Boolean(instructorId),
  })

  useEffect(() => {
    if (query.error) {
      showApiErrorToast(query.error)
    }
  }, [query.error])

  return query
}
