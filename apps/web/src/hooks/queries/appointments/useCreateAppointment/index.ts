import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AppointmentService } from '../../../../services/AppointmentService'
import { showApiErrorToast } from '../../../../Apis/handleApiError'

export function useCreateAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: AppointmentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['availability-slots'] })
    },
    onError: showApiErrorToast,
  })
}
