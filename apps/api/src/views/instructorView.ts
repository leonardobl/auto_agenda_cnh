import type { InstructorRecord } from '../models/instructorModel.ts'
import type { InstructorAvailabilityRecord } from '../models/instructorAvailabilityModel.ts'
import type { InstructorBlockRecord } from '../models/instructorBlockModel.ts'

export function presentInstructor(instructor: InstructorRecord) {
  return {
    id: instructor.id,
    user_id: instructor.user_id,
    full_name: instructor.full_name,
    document: instructor.document,
    credential_number: instructor.credential_number,
    phone: instructor.phone,
    status: instructor.status,
    created_at: instructor.created_at,
    updated_at: instructor.updated_at,
    email: instructor.email,
  }
}

export function presentInstructorAvailability(availability: InstructorAvailabilityRecord) {
  return {
    id: availability.id,
    instructor_id: availability.instructor_id,
    weekday: availability.weekday,
    start_time: availability.start_time,
    end_time: availability.end_time,
    active: availability.active,
    created_at: availability.created_at,
  }
}

export function presentInstructorBlock(block: InstructorBlockRecord) {
  return {
    id: block.id,
    instructor_id: block.instructor_id,
    start_at: block.start_at,
    end_at: block.end_at,
    reason: block.reason,
    created_by: block.created_by,
    created_at: block.created_at,
  }
}
