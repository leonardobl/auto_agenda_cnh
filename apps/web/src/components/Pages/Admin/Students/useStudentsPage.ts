import { useState } from 'react'
import { DEFAULT_PAGE_SIZE } from '../../../../constants/pagination'
import { useStudents } from '../../../../hooks/queries/students/useStudents'
import { useCreateStudent } from '../../../../hooks/queries/students/useCreateStudent'
import { useUpdateStudent } from '../../../../hooks/queries/students/useUpdateStudent'
import { useDeactivateStudent } from '../../../../hooks/queries/students/useDeactivateStudent'
import { useCreateStudentAccount } from '../../../../hooks/queries/students/useCreateStudentAccount'
import type { Student } from '../../../../services/StudentService'
import type { StudentFormValues } from '../../../Molecules/StudentForm/studentSchema'

type ModalState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; student: Student }
  | { mode: 'create-account'; student: Student }

export interface CreateAccountFormValues {
  email: string
  password: string
}

export function useStudentsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [modal, setModal] = useState<ModalState>({ mode: 'closed' })

  const { data, isLoading } = useStudents({ page, pageSize: DEFAULT_PAGE_SIZE, search, status })
  const createStudent = useCreateStudent()
  const updateStudent = useUpdateStudent()
  const deactivateStudent = useDeactivateStudent()
  const createStudentAccount = useCreateStudentAccount()

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleStatusChange = (value: string) => {
    setStatus(value)
    setPage(1)
  }

  const openCreateModal = () => setModal({ mode: 'create' })
  const openEditModal = (student: Student) => setModal({ mode: 'edit', student })
  const openCreateAccountModal = (student: Student) => setModal({ mode: 'create-account', student })
  const closeModal = () => setModal({ mode: 'closed' })

  const handleCreateSubmit = (values: StudentFormValues) => {
    createStudent.mutate(values, { onSuccess: closeModal })
  }

  const handleEditSubmit = (id: string) => (values: StudentFormValues) => {
    updateStudent.mutate({ id, data: values }, { onSuccess: closeModal })
  }

  const handleDeactivate = (id: string) => {
    if (!window.confirm('Tem certeza que deseja inativar este aluno?')) return
    deactivateStudent.mutate(id)
  }

  const handleCreateAccountSubmit = (id: string) => (values: CreateAccountFormValues) => {
    createStudentAccount.mutate({ id, ...values }, { onSuccess: closeModal })
  }

  return {
    students: data?.items ?? [],
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    total: data?.total ?? 0,
    isLoading,
    search,
    status,
    modal,
    isSaving: createStudent.isPending || updateStudent.isPending,
    isCreatingAccount: createStudentAccount.isPending,
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
  }
}
