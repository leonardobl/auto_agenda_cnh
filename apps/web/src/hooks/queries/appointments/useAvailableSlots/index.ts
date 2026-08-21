import { useQueryClient } from '@tanstack/react-query'
import { AppointmentService, type SearchSlotsParams } from '../../../../services/AppointmentService'
import { showApiErrorToast } from '../../../../Apis/handleApiError'

export function useAvailableSlots() {
  const queryClient = useQueryClient()

  function searchSlots(params: SearchSlotsParams) {
    return queryClient
      .fetchQuery({
        queryKey: ['availability-slots', params],
        queryFn: () => AppointmentService.searchSlots(params),
      })
      .catch((error: unknown) => {
        showApiErrorToast(error)
        throw error
      })
  }

  return { searchSlots }
}
