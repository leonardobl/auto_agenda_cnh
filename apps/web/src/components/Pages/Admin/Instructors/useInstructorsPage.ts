import { useState } from 'react'
import { DEFAULT_PAGE_SIZE } from '../../../../constants/pagination'
import { useInstructors } from '../../../../hooks/queries/instructors/useInstructors'
import { useCreateInstructor } from '../../../../hooks/queries/instructors/useCreateInstructor'
import { useUpdateInstructor } from '../../../../hooks/queries/instructors/useUpdateInstructor'
import type { Instructor } from '../../../../services/InstructorService'
import type { InstructorRegisterFormValues } from '../../../Molecules/InstructorRegisterForm/instructorRegisterSchema'
import type { InstructorEditFormValues } from '../../../Molecules/InstructorEditForm/instructorEditSchema'

type ModalState = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; instructor: Instructor }

export function useInstructorsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [modal, setModal] = useState<ModalState>({ mode: 'closed' })

  const { data, isLoading } = useInstructors({ page, pageSize: DEFAULT_PAGE_SIZE, search, status })
  const createInstructor = useCreateInstructor()
  const updateInstructor = useUpdateInstructor()

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleStatusChange = (value: string) => {
    setStatus(value)
    setPage(1)
  }

  const openCreateModal = () => setModal({ mode: 'create' })
  const openEditModal = (instructor: Instructor) => setModal({ mode: 'edit', instructor })
  const closeModal = () => setModal({ mode: 'closed' })

  const handleCreateSubmit = (values: InstructorRegisterFormValues) => {
    createInstructor.mutate(values, { onSuccess: closeModal })
  }

  const handleEditSubmit = (id: string) => (values: InstructorEditFormValues) => {
    updateInstructor.mutate({ id, data: values }, { onSuccess: closeModal })
  }

  return {
    instructors: data?.items ?? [],
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    total: data?.total ?? 0,
    isLoading,
    search,
    status,
    modal,
    isSaving: createInstructor.isPending || updateInstructor.isPending,
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
