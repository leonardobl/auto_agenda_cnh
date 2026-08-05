import type { Request, Response } from 'express'
import type { VehicleService } from '../../modules/vehicles/vehicleService.ts'
import { ApiError } from '../../shared/ApiError.ts'

interface VehicleControllerDeps {
  vehicleService: VehicleService
}

function requireIdParam(req: Request): string {
  const { id } = req.params
  if (typeof id !== 'string' || !id) {
    throw new ApiError(404, 'VEHICLE_NOT_FOUND', 'Veículo não encontrado.')
  }
  return id
}

export function createVehicleController({ vehicleService }: VehicleControllerDeps) {
  return {
    list(req: Request, res: Response) {
      const result = vehicleService.list(req.query)
      res.status(200).json(result)
    },

    register(req: Request, res: Response) {
      const vehicle = vehicleService.register(req.body ?? {})
      res.status(201).json(vehicle)
    },

    getById(req: Request, res: Response) {
      const vehicle = vehicleService.getById(requireIdParam(req))
      res.status(200).json(vehicle)
    },

    update(req: Request, res: Response) {
      const vehicle = vehicleService.update(requireIdParam(req), req.body ?? {})
      res.status(200).json(vehicle)
    },
  }
}
