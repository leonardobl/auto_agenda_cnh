import { api } from '../Apis/api'

export interface Instructor {
  id: string
  user_id: string
  full_name: string
  document: string | null
  credential_number: string
  phone: string
  status: string
  created_at: string
  updated_at: string
  email: string
}

export interface InstructorListResult {
  items: Instructor[]
  page: number
  pageSize: number
  total: number
}

export interface ListInstructorsParams {
  page?: number
  pageSize?: number
  search?: string
  status?: string
}

export interface InstructorRegisterData {
  email: string
  password: string
  fullName: string
  document?: string
  credentialNumber: string
  phone: string
}

export interface InstructorProfileData {
  fullName: string
  document?: string
  credentialNumber: string
  phone: string
  status?: string
}

export interface InstructorAvailability {
  id: string
  instructor_id: string
  weekday: number
  start_time: string
  end_time: string
  active: number
  created_at: string
}

export interface AddAvailabilityData {
  weekday: number
  startTime: string
  endTime: string
}

export interface InstructorBlock {
  id: string
  instructor_id: string
  start_at: string
  end_at: string
  reason: string
  created_by: string
  created_at: string
}

export interface AddBlockData {
  startAt: string
  endAt: string
  reason: string
}

export class InstructorService {
  static async list(params: ListInstructorsParams): Promise<InstructorListResult> {
    const { data } = await api.get<InstructorListResult>('/instructors', { params })
    return data
  }

  static async create(input: InstructorRegisterData): Promise<Instructor> {
    const { data } = await api.post<Instructor>('/instructors', input)
    return data
  }

  static async getById(id: string): Promise<Instructor> {
    const { data } = await api.get<Instructor>(`/instructors/${id}`)
    return data
  }

  static async update(id: string, input: Partial<InstructorProfileData>): Promise<Instructor> {
    const { data } = await api.patch<Instructor>(`/instructors/${id}`, input)
    return data
  }

  static async getMe(): Promise<Instructor> {
    const { data } = await api.get<Instructor>('/instructors/me')
    return data
  }

  static async updateMe(phone: string): Promise<Instructor> {
    const { data } = await api.patch<Instructor>('/instructors/me', { phone })
    return data
  }

  static async listAvailability(instructorId: string): Promise<InstructorAvailability[]> {
    const { data } = await api.get<{ items: InstructorAvailability[] }>(
      `/instructors/${instructorId}/availability`,
    )
    return data.items
  }

  static async addAvailability(
    instructorId: string,
    input: AddAvailabilityData,
  ): Promise<InstructorAvailability> {
    const { data } = await api.post<InstructorAvailability>(
      `/instructors/${instructorId}/availability`,
      input,
    )
    return data
  }

  static async listBlocks(instructorId: string): Promise<InstructorBlock[]> {
    const { data } = await api.get<{ items: InstructorBlock[] }>(`/instructors/${instructorId}/blocks`)
    return data.items
  }

  static async addBlock(instructorId: string, input: AddBlockData): Promise<InstructorBlock> {
    const { data } = await api.post<InstructorBlock>(`/instructors/${instructorId}/blocks`, input)
    return data
  }
}
