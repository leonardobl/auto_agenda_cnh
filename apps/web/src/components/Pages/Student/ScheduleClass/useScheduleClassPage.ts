import { useState } from 'react'
import { useAvailableSlots } from '../../../../hooks/queries/appointments/useAvailableSlots'
import { useCreateAppointment } from '../../../../hooks/queries/appointments/useCreateAppointment'
import type { AvailableSlot } from '../../../../services/AppointmentService'

const DEFAULT_DURATION_MINUTES = 50
const SEARCH_RANGE_DAYS = 7

export interface ScheduleClassFilters {
  dateFrom: string
  dateTo: string
  durationMinutes: number
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function useScheduleClassPage() {
  const [filters, setFilters] = useState<ScheduleClassFilters>(() => {
    const today = new Date()
    const nextWeek = new Date(today.getTime() + SEARCH_RANGE_DAYS * 24 * 60 * 60 * 1000)
    return {
      dateFrom: toIsoDate(today),
      dateTo: toIsoDate(nextWeek),
      durationMinutes: DEFAULT_DURATION_MINUTES,
    }
  })
  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const { searchSlots } = useAvailableSlots()
  const createAppointment = useCreateAppointment()

  const handleSearch = () => {
    setIsSearching(true)
    setHasSearched(true)

    // No studentId/categoryId sent — the API resolves both from the caller's own
    // linked student record for a STUDENT requester (see appointmentService.ts).
    searchSlots({
      dateFrom: new Date(filters.dateFrom).toISOString(),
      dateTo: new Date(filters.dateTo).toISOString(),
      durationMinutes: filters.durationMinutes,
    })
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setIsSearching(false))
  }

  const handleBook = (slot: AvailableSlot) => {
    createAppointment.mutate(
      {
        instructorId: slot.instructorId,
        vehicleId: slot.vehicleId,
        startAt: slot.startAt,
        durationMinutes: filters.durationMinutes,
      },
      {
        onSuccess: () => {
          setSlots((current) => current.filter((candidate) => candidate.startAt !== slot.startAt))
        },
      },
    )
  }

  return {
    filters,
    setFilters,
    slots,
    hasSearched,
    isSearching,
    handleSearch,
    handleBook,
    isBooking: createAppointment.isPending,
  }
}
