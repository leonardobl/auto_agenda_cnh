import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AuthService } from '../../../../services/AuthService'
import { showApiErrorToast } from '../../../../Apis/handleApiError'

interface UseMeOptions {
  enabled?: boolean
}

export function useMe(options?: UseMeOptions) {
  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => AuthService.me(),
    enabled: options?.enabled,
  })

  useEffect(() => {
    if (query.error) {
      showApiErrorToast(query.error)
    }
  }, [query.error])

  return query
}
