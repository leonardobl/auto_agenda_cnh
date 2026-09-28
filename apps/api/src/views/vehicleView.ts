import type { VehicleRecord } from '../models/vehicleModel.ts'

export function presentVehicle(vehicle: VehicleRecord) {
  return {
    id: vehicle.id,
    plate: vehicle.plate,
    brand: vehicle.brand,
    model: vehicle.model,
    year: vehicle.year,
    category_id: vehicle.category_id,
    status: vehicle.status,
    created_at: vehicle.created_at,
    updated_at: vehicle.updated_at,
  }
}
