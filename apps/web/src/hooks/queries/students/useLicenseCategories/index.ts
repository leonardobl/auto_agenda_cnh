import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { StudentService } from '../../../../services/StudentService'
import { showApiErrorToast } from '../../../../Apis/handleApiError'

export function useLicenseCategories() {
  const query = useQuery({
    queryKey: ['license-categories'],
    queryFn: () => StudentService.listCategories(),
  })

  useEffect(() => {
    if (query.error) {
      showApiErrorToast(query.error)
    }
  }, [query.error])

  return query
}
