import { randomUUID } from 'node:crypto'
import { ApiError } from '../../shared/ApiError.ts'
import type { VehicleRepository, VehicleRecord } from '../../repositories/vehicleRepository.ts'
import type { LicenseCategoryRepository } from '../../repositories/licenseCategoryRepository.ts'

const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 50
const MIN_YEAR = 1950
const MAX_YEAR = new Date().getFullYear() + 1
const VALID_STATUSES = ['ACTIVE', 'MAINTENANCE', 'INACTIVE']

export interface VehicleListResult {
  items: VehicleRecord[]
  page: number
  pageSize: number
  total: number
}

export interface ListVehiclesParams {
  page?: unknown
  pageSize?: unknown
  search?: unknown
  status?: unknown
}

export interface CreateVehicleParams {
  plate?: unknown
  brand?: unknown
  model?: unknown
  year?: unknown
  categoryId?: unknown
}

export interface UpdateVehicleParams {
  plate?: unknown
  brand?: unknown
  model?: unknown
  year?: unknown
  categoryId?: unknown
  status?: unknown
}

export interface VehicleService {
  list(params: ListVehiclesParams): VehicleListResult
  register(params: CreateVehicleParams): VehicleRecord
  getById(id: string): VehicleRecord
  update(id: string, params: UpdateVehicleParams): VehicleRecord
}

interface VehicleServiceDeps {
  vehicleRepository: VehicleRepository
  licenseCategoryRepository: LicenseCategoryRepository
}

function parsePage(value: unknown): number {
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : 1
}

function parsePageSize(value: unknown): number {
  const pageSize = Number(value)
  if (!Number.isInteger(pageSize) || pageSize <= 0) return DEFAULT_PAGE_SIZE
  return Math.min(pageSize, MAX_PAGE_SIZE)
}

function parseOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function normalizePlate(value: string): string {
  return value.trim().toUpperCase()
}

function isPlausibleYear(value: number): boolean {
  return Number.isInteger(value) && value >= MIN_YEAR && value <= MAX_YEAR
}

function isUniqueConstraintError(error: unknown, column: string): boolean {
  return (
    error instanceof Error &&
    'code' in error &&
    (error as { code?: string }).code === 'ERR_SQLITE_ERROR' &&
    error.message.includes(`UNIQUE constraint failed: vehicle.${column}`)
  )
}

export function createVehicleService({
  vehicleRepository,
  licenseCategoryRepository,
}: VehicleServiceDeps): VehicleService {
  function assertCategoryExists(categoryId: string): void {
    const categories = licenseCategoryRepository.findAll()
    if (!categories.some((category) => category.id === categoryId)) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Categoria de CNH inválida.')
    }
  }

  return {
    list({ page, pageSize, search, status }) {
      const parsedPage = parsePage(page)
      const parsedPageSize = parsePageSize(pageSize)
      const filters = { search: parseOptionalString(search), status: parseOptionalString(status) }

      const items = vehicleRepository.findMany({ page: parsedPage, pageSize: parsedPageSize, ...filters })
      const total = vehicleRepository.count(filters)

      return { items, page: parsedPage, pageSize: parsedPageSize, total }
    },

    register({ plate, brand, model, year, categoryId }) {
      if (
        typeof plate !== 'string' ||
        !plate.trim() ||
        typeof brand !== 'string' ||
        !brand.trim() ||
        typeof model !== 'string' ||
        !model.trim() ||
        typeof categoryId !== 'string' ||
        !categoryId
      ) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Placa, marca, modelo, ano e categoria são obrigatórios.')
      }

      const parsedYear = Number(year)
      if (!isPlausibleYear(parsedYear)) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Ano do veículo inválido.')
      }

      assertCategoryExists(categoryId)

      try {
        return vehicleRepository.create({
          id: randomUUID(),
          plate: normalizePlate(plate),
          brand: brand.trim(),
          model: model.trim(),
          year: parsedYear,
          categoryId,
        })
      } catch (error) {
        if (isUniqueConstraintError(error, 'plate')) {
          throw new ApiError(409, 'VEHICLE_PLATE_CONFLICT', 'Já existe um veículo com esta placa.')
        }
        throw error
      }
    },

    getById(id) {
      const vehicle = vehicleRepository.findById(id)
      if (!vehicle) {
        throw new ApiError(404, 'VEHICLE_NOT_FOUND', 'Veículo não encontrado.')
      }
      return vehicle
    },

    update(id, { plate, brand, model, year, categoryId, status }) {
      if (typeof categoryId === 'string' && categoryId) {
        assertCategoryExists(categoryId)
      }

      if (status !== undefined && (typeof status !== 'string' || !VALID_STATUSES.includes(status))) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Status de veículo inválido.')
      }

      let parsedYear: number | undefined
      if (year !== undefined) {
        parsedYear = Number(year)
        if (!isPlausibleYear(parsedYear)) {
          throw new ApiError(400, 'VALIDATION_ERROR', 'Ano do veículo inválido.')
        }
      }

      try {
        const updated = vehicleRepository.update(id, {
          plate: typeof plate === 'string' && plate.trim() ? normalizePlate(plate) : undefined,
          brand: typeof brand === 'string' ? brand.trim() : undefined,
          model: typeof model === 'string' ? model.trim() : undefined,
          year: parsedYear,
          categoryId: typeof categoryId === 'string' && categoryId ? categoryId : undefined,
          status: typeof status === 'string' ? status : undefined,
        })

        if (!updated) {
          throw new ApiError(404, 'VEHICLE_NOT_FOUND', 'Veículo não encontrado.')
        }

        return updated
      } catch (error) {
        if (isUniqueConstraintError(error, 'plate')) {
          throw new ApiError(409, 'VEHICLE_PLATE_CONFLICT', 'Já existe um veículo com esta placa.')
        }
        throw error
      }
    },
  }
}
