import { useState } from 'react'
import { DEFAULT_PAGE_SIZE } from '../../../../constants/pagination'
import { useStudents } from '../../../../hooks/queries/students/useStudents'
import { useLicenseCategories } from '../../../../hooks/queries/students/useLicenseCategories'
import { useAppointments } from '../../../../hooks/queries/appointments/useAppointments'
import { useAvailableSlots } from '../../../../hooks/queries/appointments/useAvailableSlots'
import { useCreateAppointment } from '../../../../hooks/queries/appointments/useCreateAppointment'
import type { SlotFilters } from '../../../Molecules/SlotSearchForm'
import type { AvailableSlot } from '../../../../services/AppointmentService'

const DEFAULT_DURATION_MINUTES = 50
const SEARCH_RANGE_DAYS = 7

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function useSchedulePage() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<SlotFilters>(() => {
    const today = new Date()
    const nextWeek = new Date(today.getTime() + SEARCH_RANGE_DAYS * 24 * 60 * 60 * 1000)
    return {
      studentId: '',
      categoryId: '',
      dateFrom: toIsoDate(today),
      dateTo: toIsoDate(nextWeek),
      durationMinutes: DEFAULT_DURATION_MINUTES,
    }
  })
  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const { data: studentsResult } = useStudents({ page: 1, pageSize: 100, status: 'ACTIVE' })
  const { data: categories } = useLicenseCategories()
  const { data: appointmentsResult, isLoading: isLoadingAppointments } = useAppointments({
    page,
    pageSize: DEFAULT_PAGE_SIZE,
  })
  const { searchSlots } = useAvailableSlots()
  const createAppointment = useCreateAppointment()

  const handleSearch = () => {
    if (!filters.studentId || !filters.categoryId) return

    setIsSearching(true)
    setHasSearched(true)

    searchSlots({
      studentId: filters.studentId,
      categoryId: filters.categoryId,
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
        studentId: filters.studentId,
        instructorId: slot.instructorId,
        vehicleId: slot.vehicleId,
        categoryId: filters.categoryId,
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
    students: studentsResult?.items ?? [],
    categories: categories ?? [],
    filters,
    setFilters,
    slots,
    hasSearched,
    isSearching,
    handleSearch,
    handleBook,
    isBooking: createAppointment.isPending,
    appointments: appointmentsResult?.items ?? [],
    isLoadingAppointments,
    page,
    setPage,
    total: appointmentsResult?.total ?? 0,
  }
}
