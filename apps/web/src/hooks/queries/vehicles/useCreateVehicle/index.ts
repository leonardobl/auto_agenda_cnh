import { useMutation, useQueryClient } from '@tanstack/react-query'
import { VehicleService } from '../../../../services/VehicleService'
import { showApiErrorToast } from '../../../../Apis/handleApiError'

export function useCreateVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: VehicleService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
    },
    onError: showApiErrorToast,
  })
}
