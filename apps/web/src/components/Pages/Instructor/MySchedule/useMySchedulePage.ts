import { useState } from 'react'
import { DEFAULT_PAGE_SIZE } from '../../../../constants/pagination'
import { useAppointments } from '../../../../hooks/queries/appointments/useAppointments'

export function useMySchedulePage() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useAppointments({ page, pageSize: DEFAULT_PAGE_SIZE })

  return {
    appointments: data?.items ?? [],
    isLoading,
    page,
    setPage,
    total: data?.total ?? 0,
  }
}
