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
}
