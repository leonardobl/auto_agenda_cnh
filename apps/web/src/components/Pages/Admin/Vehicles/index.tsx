import { useLicenseCategories } from '../../../../hooks/queries/students/useLicenseCategories'
import { DEFAULT_PAGE_SIZE } from '../../../../constants/pagination'
import Button from '../../../Atoms/Button'
import Modal from '../../../Atoms/Modal'
import VehicleForm from '../../../Molecules/VehicleForm'
import { useVehiclesPage } from './useVehiclesPage'

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Ativo',
  MAINTENANCE: 'Manutenção',
  INACTIVE: 'Inativo',
}

function Vehicles() {
  const {
    vehicles,
    page,
    total,
    isLoading,
    search,
    status,
    modal,
    isSaving,
    handleSearchChange,
    handleStatusChange,
    setPage,
    openCreateModal,
    openEditModal,
    closeModal,
    handleCreateSubmit,
    handleEditSubmit,
  } = useVehiclesPage()

  const { data: categories } = useLicenseCategories()
  const categoryCodeById = new Map(categories?.map((category) => [category.id, category.code]))

  const totalPages = Math.max(1, Math.ceil(total / DEFAULT_PAGE_SIZE))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Veículos</h1>
        <Button type="button" onClick={openCreateModal}>
          Novo veículo
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          type="search"
          placeholder="Buscar por placa, marca ou modelo"
          value={search}
          onChange={(event) => handleSearchChange(event.target.value)}
          className="min-h-touch flex-1 rounded-lg border border-solid p-2"
        />
        <select
          value={status}
          onChange={(event) => handleStatusChange(event.target.value)}
          className="min-h-touch rounded-lg border border-solid p-2"
        >
          <option value="">Todos os status</option>
          <option value="ACTIVE">Ativo</option>
          <option value="MAINTENANCE">Manutenção</option>
          <option value="INACTIVE">Inativo</option>
        </select>
      </div>

      {isLoading ? (
        <p>Carregando...</p>
      ) : vehicles.length === 0 ? (
        <p>Nenhum veículo encontrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="p-2">Placa</th>
                <th className="p-2">Marca</th>
                <th className="p-2">Modelo</th>
                <th className="p-2">Ano</th>
                <th className="p-2">Categoria</th>
                <th className="p-2">Status</th>
                <th className="p-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="border-t border-solid">
                  <td className="p-2">{vehicle.plate}</td>
                  <td className="p-2">{vehicle.brand}</td>
                  <td className="p-2">{vehicle.model}</td>
                  <td className="p-2">{vehicle.year}</td>
                  <td className="p-2">{categoryCodeById.get(vehicle.category_id) ?? '—'}</td>
                  <td className="p-2">{STATUS_LABELS[vehicle.status] ?? vehicle.status}</td>
                  <td className="p-2">
                    <button type="button" onClick={() => openEditModal(vehicle)} className="text-primary">
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>
          Anterior
        </Button>
        <span>
          Página {page} de {totalPages}
        </span>
        <Button type="button" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
          Próxima
        </Button>
      </div>

      <Modal
        open={modal.mode !== 'closed'}
        onClose={closeModal}
        title={modal.mode === 'edit' ? 'Editar veículo' : 'Novo veículo'}
      >
        {modal.mode === 'create' && (
          <VehicleForm submitLabel="Cadastrar" isSubmitting={isSaving} onSubmit={handleCreateSubmit} />
        )}
        {modal.mode === 'edit' && (
          <VehicleForm
            submitLabel="Salvar"
            isSubmitting={isSaving}
            defaultValues={{
              plate: modal.vehicle.plate,
              brand: modal.vehicle.brand,
              model: modal.vehicle.model,
              year: String(modal.vehicle.year),
              categoryId: modal.vehicle.category_id,
              status: modal.vehicle.status as 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE',
            }}
            onSubmit={handleEditSubmit(modal.vehicle.id)}
          />
        )}
      </Modal>
    </div>
  )
}

export default Vehicles
