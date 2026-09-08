import { toast } from 'react-toastify'
import { useMyInstructorProfile } from '../../../../hooks/queries/instructors/useMyInstructorProfile'
import { useUpdateMyInstructorProfile } from '../../../../hooks/queries/instructors/useUpdateMyInstructorProfile'
import type { ProfileFormValues } from './profileSchema'

export function useProfilePage() {
  const { data: instructor, isLoading } = useMyInstructorProfile()
  const { mutate: updatePhone, isPending } = useUpdateMyInstructorProfile()

  const onSubmit = ({ phone }: ProfileFormValues) => {
    updatePhone(phone, {
      onSuccess: () => toast.success('Perfil atualizado com sucesso.'),
    })
  }

  return { instructor, isLoading, isPending, onSubmit }
}
