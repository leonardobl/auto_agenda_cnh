import { useMutation, useQueryClient } from '@tanstack/react-query'
import { VehicleService, type VehicleFormData } from '../../../../services/VehicleService'
import { showApiErrorToast } from '../../../../Apis/handleApiError'

interface UpdateVehicleInput {
  id: string
  data: Partial<VehicleFormData>
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: UpdateVehicleInput) => VehicleService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
    },
    onError: showApiErrorToast,
  })
}
