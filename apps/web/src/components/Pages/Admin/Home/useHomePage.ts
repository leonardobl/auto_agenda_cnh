import { useState } from 'react'
import { useStudents } from '../../../../hooks/queries/students/useStudents'
import { useInstructors } from '../../../../hooks/queries/instructors/useInstructors'
import { useVehicles } from '../../../../hooks/queries/vehicles/useVehicles'
import { useAppointments } from '../../../../hooks/queries/appointments/useAppointments'

const COUNT_PAGE_SIZE = 1
const UPCOMING_APPOINTMENTS_PAGE_SIZE = 5

export function useHomePage() {
  const students = useStudents({ page: 1, pageSize: COUNT_PAGE_SIZE })
  const instructors = useInstructors({ page: 1, pageSize: COUNT_PAGE_SIZE })
  const vehicles = useVehicles({ page: 1, pageSize: COUNT_PAGE_SIZE })
  const appointments = useAppointments({ page: 1, pageSize: UPCOMING_APPOINTMENTS_PAGE_SIZE })

  // Captured once per mount (not recomputed every render) — a page-load snapshot is
  // enough for a screen a reviewer loads once per session, see design.md Non-Goals.
  const [now] = useState(() => Date.now())
  const upcomingAppointments = (appointments.data?.items ?? []).filter(
    (appointment) => new Date(appointment.start_at).getTime() > now,
  )

  return {
    studentCount: students.data?.total ?? 0,
    instructorCount: instructors.data?.total ?? 0,
    vehicleCount: vehicles.data?.total ?? 0,
    appointmentCount: appointments.data?.total ?? 0,
    upcomingAppointments,
    isLoading: students.isLoading || instructors.isLoading || vehicles.isLoading || appointments.isLoading,
  }
}
