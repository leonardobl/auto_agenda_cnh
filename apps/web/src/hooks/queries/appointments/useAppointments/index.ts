import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AppointmentService, type ListAppointmentsParams } from '../../../../services/AppointmentService'
import { showApiErrorToast } from '../../../../Apis/handleApiError'

export function useAppointments(params: ListAppointmentsParams) {
  const query = useQuery({
    queryKey: ['appointments', params],
    queryFn: () => AppointmentService.list(params),
  })

  useEffect(() => {
    if (query.error) {
      showApiErrorToast(query.error)
    }
  }, [query.error])

  return query
}
