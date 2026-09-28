import type { Request, Response } from 'express'
import type { VehicleService } from '../models/vehicleService.ts'
import { ApiError } from '../shared/ApiError.ts'
import { presentVehicle } from '../views/vehicleView.ts'
import { presentPage } from '../views/pageView.ts'

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
    async list(req: Request, res: Response) {
      const result = await vehicleService.list(req.query)
      res.status(200).json(presentPage(result, presentVehicle))
    },

    async register(req: Request, res: Response) {
      const vehicle = await vehicleService.register(req.body ?? {})
      res.status(201).json(presentVehicle(vehicle))
    },

    async getById(req: Request, res: Response) {
      const vehicle = await vehicleService.getById(requireIdParam(req))
      res.status(200).json(presentVehicle(vehicle))
    },

    async update(req: Request, res: Response) {
      const vehicle = await vehicleService.update(requireIdParam(req), req.body ?? {})
      res.status(200).json(presentVehicle(vehicle))
    },
  }
}
