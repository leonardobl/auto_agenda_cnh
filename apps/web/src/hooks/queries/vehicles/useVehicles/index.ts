import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { VehicleService, type ListVehiclesParams } from '../../../../services/VehicleService'
import { showApiErrorToast } from '../../../../Apis/handleApiError'

export function useVehicles(params: ListVehiclesParams) {
  const query = useQuery({
    queryKey: ['vehicles', params],
    queryFn: () => VehicleService.list(params),
  })

  useEffect(() => {
    if (query.error) {
      showApiErrorToast(query.error)
    }
  }, [query.error])

  return query
}
