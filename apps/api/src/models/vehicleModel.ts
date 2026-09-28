import type { Queryable } from '../database/connection.ts'
import { bind } from '../database/params.ts'

export interface VehicleRecord {
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

export interface VehicleFilters {
  search?: string
  status?: string
}

export interface FindManyParams extends VehicleFilters {
  page: number
  pageSize: number
}

export interface CreateVehicleInput {
  id: string
  plate: string
  brand: string
  model: string
  year: number
  categoryId: string
}

export interface UpdateVehicleInput {
  plate?: string
  brand?: string
  model?: string
  year?: number
  categoryId?: string
  status?: string
}

export interface VehicleModel {
  findMany(params: FindManyParams): Promise<VehicleRecord[]>
  count(filters: VehicleFilters): Promise<number>
  findById(id: string): Promise<VehicleRecord | undefined>
  create(input: CreateVehicleInput): Promise<VehicleRecord>
  update(id: string, input: UpdateVehicleInput): Promise<VehicleRecord | undefined>
}

function buildFilters({ search, status }: VehicleFilters): { where: string; params: unknown[] } {
  const clauses: string[] = []
  const params: unknown[] = []

  if (search) {
    const like = bind(params, `%${search}%`)
    clauses.push(`(plate ILIKE ${like} OR brand ILIKE ${like} OR model ILIKE ${like})`)
  }

  if (status) {
    clauses.push(`status = ${bind(params, status)}`)
  }

  return { where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params }
}

export function createVehicleModel(db: Queryable): VehicleModel {
  async function findById(id: string): Promise<VehicleRecord | undefined> {
    const { rows } = await db.query<VehicleRecord>('SELECT * FROM vehicle WHERE id = $1', [id])
    return rows[0]
  }

  return {
    async findMany({ page, pageSize, search, status }) {
      const { where, params } = buildFilters({ search, status })
      const limit = bind(params, pageSize)
      const offset = bind(params, (page - 1) * pageSize)
      const { rows } = await db.query<VehicleRecord>(
        `SELECT * FROM vehicle ${where} ORDER BY plate LIMIT ${limit} OFFSET ${offset}`,
        params,
      )
      return rows
    },

    async count({ search, status }) {
      const { where, params } = buildFilters({ search, status })
      const { rows } = await db.query<{ total: number }>(
        `SELECT COUNT(*)::int AS total FROM vehicle ${where}`,
        params,
      )
      return rows[0]!.total
    },

    findById,

    async create({ id, plate, brand, model, year, categoryId }) {
      const { rows } = await db.query<VehicleRecord>(
        `INSERT INTO vehicle (id, plate, brand, model, year, category_id, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE')
         RETURNING *`,
        [id, plate, brand, model, year, categoryId],
      )
      return rows[0]!
    },

    async update(id, input) {
      const existing = await findById(id)
      if (!existing) return undefined

      const plate = input.plate ?? existing.plate
      const brand = input.brand ?? existing.brand
      const model = input.model ?? existing.model
      const year = input.year ?? existing.year
      const categoryId = input.categoryId ?? existing.category_id
      const status = input.status ?? existing.status

      const { rows } = await db.query<VehicleRecord>(
        `UPDATE vehicle
         SET plate = $1, brand = $2, model = $3, year = $4, category_id = $5, status = $6, updated_at = now()
         WHERE id = $7
         RETURNING *`,
        [plate, brand, model, year, categoryId, status, id],
      )
      return rows[0]
    },
  }
}
