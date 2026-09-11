import { useMyInstructorProfile } from '../../../../hooks/queries/instructors/useMyInstructorProfile'
import { useInstructorAvailability } from '../../../../hooks/queries/instructors/useInstructorAvailability'
import { useAddInstructorAvailability } from '../../../../hooks/queries/instructors/useAddInstructorAvailability'
import { useInstructorBlocks } from '../../../../hooks/queries/instructors/useInstructorBlocks'
import { useAddInstructorBlock } from '../../../../hooks/queries/instructors/useAddInstructorBlock'
import type { AvailabilityFormValues, BlockFormValues } from './availabilitySchema'

export function useAvailabilityPage() {
  const { data: instructor, isLoading: isLoadingProfile } = useMyInstructorProfile()
  const instructorId = instructor?.id

  const { data: availability, isLoading: isLoadingAvailability } = useInstructorAvailability(instructorId)
  const { data: blocks, isLoading: isLoadingBlocks } = useInstructorBlocks(instructorId)
  const addAvailability = useAddInstructorAvailability()
  const addBlock = useAddInstructorBlock()

  const handleAddAvailability = (values: AvailabilityFormValues) => {
    if (!instructorId) return
    addAvailability.mutate({
      instructorId,
      data: { weekday: Number(values.weekday), startTime: values.startTime, endTime: values.endTime },
    })
  }

  const handleAddBlock = (values: BlockFormValues) => {
    if (!instructorId) return
    addBlock.mutate({
      instructorId,
      data: {
        startAt: new Date(values.startAt).toISOString(),
        endAt: new Date(values.endAt).toISOString(),
        reason: values.reason,
      },
    })
  }

  return {
    availability: availability ?? [],
    blocks: blocks ?? [],
    isLoading: isLoadingProfile || isLoadingAvailability || isLoadingBlocks,
    handleAddAvailability,
    handleAddBlock,
    isAddingAvailability: addAvailability.isPending,
    isAddingBlock: addBlock.isPending,
  }
}
