import { api } from '../Apis/api'

export interface Student {
  id: string
  user_id: string | null
  full_name: string
  document: string | null
  phone: string
  birth_date: string | null
  category_id: string
  status: string
  created_at: string
  updated_at: string
}

export interface LicenseCategory {
  id: string
  code: string
  name: string
}

export interface StudentListResult {
  items: Student[]
  page: number
  pageSize: number
  total: number
}

export interface ListStudentsParams {
  page?: number
  pageSize?: number
  search?: string
  status?: string
}

export interface StudentFormData {
  fullName: string
  document?: string
  phone: string
  birthDate?: string
  categoryId: string
}

export class StudentService {
  static async list(params: ListStudentsParams): Promise<StudentListResult> {
    const { data } = await api.get<StudentListResult>('/students', { params })
    return data
  }

  static async create(input: StudentFormData): Promise<Student> {
    const { data } = await api.post<Student>('/students', input)
    return data
  }

  static async getById(id: string): Promise<Student> {
    const { data } = await api.get<Student>(`/students/${id}`)
    return data
  }

  static async update(id: string, input: Partial<StudentFormData>): Promise<Student> {
    const { data } = await api.patch<Student>(`/students/${id}`, input)
    return data
  }

  static async deactivate(id: string): Promise<Student> {
    const { data } = await api.post<Student>(`/students/${id}/deactivate`)
    return data
  }

  static async listCategories(): Promise<LicenseCategory[]> {
    const { data } = await api.get<LicenseCategory[]>('/license-categories')
    return data
  }
}
