import { toast } from 'react-toastify'
import { useMyStudentProfile } from '../../../../hooks/queries/students/useMyStudentProfile'
import { useUpdateMyStudentProfile } from '../../../../hooks/queries/students/useUpdateMyStudentProfile'
import { useLicenseCategories } from '../../../../hooks/queries/students/useLicenseCategories'
import type { ProfileFormValues } from './profileSchema'

export function useProfilePage() {
  const { data: student, isLoading } = useMyStudentProfile()
  const { data: categories } = useLicenseCategories()
  const { mutate: updatePhone, isPending } = useUpdateMyStudentProfile()

  const category = categories?.find((candidate) => candidate.id === student?.category_id)

  const onSubmit = ({ phone }: ProfileFormValues) => {
    updatePhone(phone, {
      onSuccess: () => toast.success('Perfil atualizado com sucesso.'),
    })
  }

  return { student, category, isLoading, isPending, onSubmit }
}
