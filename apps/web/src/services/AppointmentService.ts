import { api } from '../Apis/api'

export interface Appointment {
  id: string
  student_id: string
  instructor_id: string
  vehicle_id: string
  category_id: string
  start_at: string
  end_at: string
  status: string
  cancellation_reason: string | null
  notes: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface AvailableSlot {
  startAt: string
  endAt: string
  instructorId: string
  instructorName: string
  vehicleId: string
  vehiclePlate: string
}

export interface AppointmentListResult {
  items: Appointment[]
  page: number
  pageSize: number
  total: number
}

export interface SearchSlotsParams {
  studentId: string
  categoryId: string
  dateFrom?: string
  dateTo?: string
  durationMinutes?: number
}

export interface ListAppointmentsParams {
  page?: number
  pageSize?: number
}

export interface BookAppointmentData {
  studentId: string
  instructorId: string
  vehicleId: string
  categoryId: string
  startAt: string
  durationMinutes?: number
}

export class AppointmentService {
  static async searchSlots(params: SearchSlotsParams): Promise<AvailableSlot[]> {
    const { data } = await api.get<{ items: AvailableSlot[] }>('/availability/slots', { params })
    return data.items
  }

  static async create(input: BookAppointmentData): Promise<Appointment> {
    const { data } = await api.post<Appointment>('/appointments', input)
    return data
  }

  static async list(params: ListAppointmentsParams): Promise<AppointmentListResult> {
    const { data } = await api.get<AppointmentListResult>('/appointments', { params })
    return data
  }
}
