import { DEFAULT_PAGE_SIZE } from '../../../../constants/pagination'
import Button from '../../../Atoms/Button'
import Modal from '../../../Atoms/Modal'
import InstructorRegisterForm from '../../../Molecules/InstructorRegisterForm'
import InstructorEditForm from '../../../Molecules/InstructorEditForm'
import { useInstructorsPage } from './useInstructorsPage'

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
}

function Instructors() {
  const {
    instructors,
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
  } = useInstructorsPage()

  const totalPages = Math.max(1, Math.ceil(total / DEFAULT_PAGE_SIZE))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Instrutores</h1>
        <Button type="button" onClick={openCreateModal}>
          Novo instrutor
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          type="search"
          placeholder="Buscar por nome, documento ou registro"
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
          <option value="INACTIVE">Inativo</option>
        </select>
      </div>

      {isLoading ? (
        <p>Carregando...</p>
      ) : instructors.length === 0 ? (
        <p>Nenhum instrutor encontrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="p-2">Nome</th>
                <th className="p-2">E-mail</th>
                <th className="p-2">Registro</th>
                <th className="p-2">Telefone</th>
                <th className="p-2">Status</th>
                <th className="p-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {instructors.map((instructor) => (
                <tr key={instructor.id} className="border-t border-solid">
                  <td className="p-2">{instructor.full_name}</td>
                  <td className="p-2">{instructor.email}</td>
                  <td className="p-2">{instructor.credential_number}</td>
                  <td className="p-2">{instructor.phone}</td>
                  <td className="p-2">{STATUS_LABELS[instructor.status] ?? instructor.status}</td>
                  <td className="p-2">
                    <button type="button" onClick={() => openEditModal(instructor)} className="text-primary">
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
        title={modal.mode === 'edit' ? 'Editar instrutor' : 'Novo instrutor'}
      >
        {modal.mode === 'create' && (
          <InstructorRegisterForm isSubmitting={isSaving} onSubmit={handleCreateSubmit} />
        )}
        {modal.mode === 'edit' && (
          <InstructorEditForm
            isSubmitting={isSaving}
            defaultValues={{
              fullName: modal.instructor.full_name,
              document: modal.instructor.document ?? undefined,
              credentialNumber: modal.instructor.credential_number,
              phone: modal.instructor.phone,
              status: modal.instructor.status as 'ACTIVE' | 'INACTIVE',
            }}
            onSubmit={handleEditSubmit(modal.instructor.id)}
          />
        )}
      </Modal>
    </div>
  )
}

export default Instructors
