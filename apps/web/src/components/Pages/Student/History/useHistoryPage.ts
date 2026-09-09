import { useState } from 'react'
import { useAppointments } from '../../../../hooks/queries/appointments/useAppointments'

const PAGE_SIZE = 50

export function useHistoryPage() {
  const { data, isLoading } = useAppointments({ page: 1, pageSize: PAGE_SIZE })

  const [now] = useState(() => Date.now())
  const pastAppointments = (data?.items ?? [])
    .filter((appointment) => new Date(appointment.start_at).getTime() <= now)
    .reverse()

  return { appointments: pastAppointments, isLoading }
}
