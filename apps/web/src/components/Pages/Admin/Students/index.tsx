import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLicenseCategories } from '../../../../hooks/queries/students/useLicenseCategories'
import { DEFAULT_PAGE_SIZE } from '../../../../constants/pagination'
import Button from '../../../Atoms/Button'
import Modal from '../../../Atoms/Modal'
import TextField from '../../../Atoms/InputsRHF/TextField'
import StudentForm from '../../../Molecules/StudentForm'
import { useStudentsPage } from './useStudentsPage'
import { createAccountSchema, type CreateAccountSchemaValues } from './createAccountSchema'

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
}

interface CreateAccountFormProps {
  isSubmitting: boolean
  onSubmit: (values: CreateAccountSchemaValues) => void
}

function CreateAccountForm({ isSubmitting, onSubmit }: CreateAccountFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAccountSchemaValues>({ resolver: zodResolver(createAccountSchema) })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <TextField label="E-mail" type="email" error={errors.email?.message} {...register('email')} />
      <TextField
        label="Senha"
        type="password"
        error={errors.password?.message}
        {...register('password')}
      />
      <Button type="submit" disabled={isSubmitting}>
        Criar acesso
      </Button>
    </form>
  )
}

function Students() {
  const {
    students,
    page,
    total,
    isLoading,
    search,
    status,
    modal,
    isSaving,
    isCreatingAccount,
    handleSearchChange,
    handleStatusChange,
    setPage,
    openCreateModal,
    openEditModal,
    openCreateAccountModal,
    closeModal,
    handleCreateSubmit,
    handleEditSubmit,
    handleCreateAccountSubmit,
    handleDeactivate,
  } = useStudentsPage()

  const { data: categories } = useLicenseCategories()
  const categoryCodeById = new Map(categories?.map((category) => [category.id, category.code]))

  const totalPages = Math.max(1, Math.ceil(total / DEFAULT_PAGE_SIZE))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Alunos</h1>
        <Button type="button" onClick={openCreateModal}>
          Novo aluno
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          type="search"
          placeholder="Buscar por nome ou documento"
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
      ) : students.length === 0 ? (
        <p>Nenhum aluno encontrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="p-2">Nome</th>
                <th className="p-2">Documento</th>
                <th className="p-2">Telefone</th>
                <th className="p-2">Categoria</th>
                <th className="p-2">Status</th>
                <th className="p-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-t border-solid">
                  <td className="p-2">{student.full_name}</td>
                  <td className="p-2">{student.document ?? '—'}</td>
                  <td className="p-2">{student.phone}</td>
                  <td className="p-2">{categoryCodeById.get(student.category_id) ?? '—'}</td>
                  <td className="p-2">{STATUS_LABELS[student.status] ?? student.status}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => openEditModal(student)} className="text-primary">
                        Editar
                      </button>
                      {!student.user_id && (
                        <button
                          type="button"
                          onClick={() => openCreateAccountModal(student)}
                          className="text-primary"
                        >
                          Criar acesso
                        </button>
                      )}
                      {student.status === 'ACTIVE' && (
                        <button
                          type="button"
                          onClick={() => handleDeactivate(student.id)}
                          className="text-error"
                        >
                          Inativar
                        </button>
                      )}
                    </div>
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
        title={
          modal.mode === 'edit'
            ? 'Editar aluno'
            : modal.mode === 'create-account'
              ? 'Criar acesso'
              : 'Novo aluno'
        }
      >
        {modal.mode === 'create' && (
          <StudentForm submitLabel="Cadastrar" isSubmitting={isSaving} onSubmit={handleCreateSubmit} />
        )}
        {modal.mode === 'edit' && (
          <StudentForm
            submitLabel="Salvar"
            isSubmitting={isSaving}
            defaultValues={{
              fullName: modal.student.full_name,
              document: modal.student.document ?? undefined,
              phone: modal.student.phone,
              birthDate: modal.student.birth_date ?? undefined,
              categoryId: modal.student.category_id,
            }}
            onSubmit={handleEditSubmit(modal.student.id)}
          />
        )}
        {modal.mode === 'create-account' && (
          <CreateAccountForm
            isSubmitting={isCreatingAccount}
            onSubmit={handleCreateAccountSubmit(modal.student.id)}
          />
        )}
      </Modal>
    </div>
  )
}

export default Students
