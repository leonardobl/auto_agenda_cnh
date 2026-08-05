import { useState } from 'react'
import { DEFAULT_PAGE_SIZE } from '../../../../constants/pagination'
import { useVehicles } from '../../../../hooks/queries/vehicles/useVehicles'
import { useCreateVehicle } from '../../../../hooks/queries/vehicles/useCreateVehicle'
import { useUpdateVehicle } from '../../../../hooks/queries/vehicles/useUpdateVehicle'
import type { Vehicle } from '../../../../services/VehicleService'
import type { VehicleFormValues } from '../../../Molecules/VehicleForm/vehicleSchema'

type ModalState = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; vehicle: Vehicle }

export function useVehiclesPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [modal, setModal] = useState<ModalState>({ mode: 'closed' })

  const { data, isLoading } = useVehicles({ page, pageSize: DEFAULT_PAGE_SIZE, search, status })
  const createVehicle = useCreateVehicle()
  const updateVehicle = useUpdateVehicle()

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleStatusChange = (value: string) => {
    setStatus(value)
    setPage(1)
  }

  const openCreateModal = () => setModal({ mode: 'create' })
  const openEditModal = (vehicle: Vehicle) => setModal({ mode: 'edit', vehicle })
  const closeModal = () => setModal({ mode: 'closed' })

  const handleCreateSubmit = (values: VehicleFormValues) => {
    createVehicle.mutate({ ...values, year: Number(values.year) }, { onSuccess: closeModal })
  }

  const handleEditSubmit = (id: string) => (values: VehicleFormValues) => {
    updateVehicle.mutate(
      { id, data: { ...values, year: Number(values.year) } },
      { onSuccess: closeModal },
    )
  }

  return {
    vehicles: data?.items ?? [],
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    total: data?.total ?? 0,
    isLoading,
    search,
    status,
    modal,
    isSaving: createVehicle.isPending || updateVehicle.isPending,
    handleSearchChange,
    handleStatusChange,
    setPage,
    openCreateModal,
    openEditModal,
    closeModal,
    handleCreateSubmit,
    handleEditSubmit,
  }
}
