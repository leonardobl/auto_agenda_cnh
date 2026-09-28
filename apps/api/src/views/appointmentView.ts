import type { AppointmentRecord } from '../models/appointmentModel.ts'
import type { AvailableSlot } from '../models/appointmentService.ts'

// Includes the joined display names (student/instructor/vehicle): neither an
// Instructor nor a Student may call /students, /instructors or /vehicles, so the
// listing has to carry them.
export function presentAppointment(appointment: AppointmentRecord) {
  return {
    id: appointment.id,
    student_id: appointment.student_id,
    instructor_id: appointment.instructor_id,
    vehicle_id: appointment.vehicle_id,
    category_id: appointment.category_id,
    start_at: appointment.start_at,
    end_at: appointment.end_at,
    status: appointment.status,
    cancellation_reason: appointment.cancellation_reason,
    notes: appointment.notes,
    created_by: appointment.created_by,
    created_at: appointment.created_at,
    updated_at: appointment.updated_at,
    student_full_name: appointment.student_full_name,
    instructor_full_name: appointment.instructor_full_name,
    vehicle_plate: appointment.vehicle_plate,
  }
}

export function presentSlot(slot: AvailableSlot) {
  return {
    startAt: slot.startAt,
    endAt: slot.endAt,
    instructorId: slot.instructorId,
    instructorName: slot.instructorName,
    vehicleId: slot.vehicleId,
    vehiclePlate: slot.vehiclePlate,
  }
}
