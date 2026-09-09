import { useState } from 'react'
import { useAppointments } from '../../../../hooks/queries/appointments/useAppointments'

const PAGE_SIZE = 50

export function useMySchedulePage() {
  const { data, isLoading } = useAppointments({ page: 1, pageSize: PAGE_SIZE })

  // Captured once per mount — see admin-dashboard's useHomePage.ts for the same
  // reasoning (react-hooks/purity forbids calling Date.now() directly in render).
  const [now] = useState(() => Date.now())
  const upcomingAppointments = (data?.items ?? []).filter(
    (appointment) => new Date(appointment.start_at).getTime() > now,
  )

  return { appointments: upcomingAppointments, isLoading }
}
