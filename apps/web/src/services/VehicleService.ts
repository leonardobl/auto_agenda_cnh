import { api } from '../Apis/api'

export interface Vehicle {
  id: string
  plate: string
  brand: string
  model: string
  year: number
  category_id: string
  status: string
  created_at: string
  updated_at: string
}

export interface VehicleListResult {
  items: Vehicle[]
  page: number
  pageSize: number
  total: number
}

export interface ListVehiclesParams {
  page?: number
  pageSize?: number
  search?: string
  status?: string
}

export interface VehicleFormData {
  plate: string
  brand: string
  model: string
  year: number
  categoryId: string
  status?: string
}

export class VehicleService {
  static async list(params: ListVehiclesParams): Promise<VehicleListResult> {
    const { data } = await api.get<VehicleListResult>('/vehicles', { params })
    return data
  }

  static async create(input: VehicleFormData): Promise<Vehicle> {
    const { data } = await api.post<Vehicle>('/vehicles', input)
    return data
  }

  static async getById(id: string): Promise<Vehicle> {
    const { data } = await api.get<Vehicle>(`/vehicles/${id}`)
    return data
  }

  static async update(id: string, input: Partial<VehicleFormData>): Promise<Vehicle> {
    const { data } = await api.patch<Vehicle>(`/vehicles/${id}`, input)
    return data
  }
}
