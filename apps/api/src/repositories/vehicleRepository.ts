import type { DatabaseSync } from 'node:sqlite'

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

export interface VehicleRepository {
  findMany(params: FindManyParams): VehicleRecord[]
  count(filters: VehicleFilters): number
  findById(id: string): VehicleRecord | undefined
  create(input: CreateVehicleInput): VehicleRecord
  update(id: string, input: UpdateVehicleInput): VehicleRecord | undefined
}

function buildFilters({ search, status }: VehicleFilters): { where: string; params: string[] } {
  const clauses: string[] = []
  const params: string[] = []

  if (search) {
    clauses.push('(plate LIKE ? OR brand LIKE ? OR model LIKE ?)')
    const like = `%${search}%`
    params.push(like, like, like)
  }

  if (status) {
    clauses.push('status = ?')
    params.push(status)
  }

  return { where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params }
}

export function createVehicleRepository(db: DatabaseSync): VehicleRepository {
  function findById(id: string): VehicleRecord | undefined {
    return db.prepare('SELECT * FROM vehicle WHERE id = ?').get(id) as VehicleRecord | undefined
  }

  return {
    findMany({ page, pageSize, search, status }) {
      const { where, params } = buildFilters({ search, status })
      const offset = (page - 1) * pageSize
      return db
        .prepare(`SELECT * FROM vehicle ${where} ORDER BY plate LIMIT ? OFFSET ?`)
        .all(...params, pageSize, offset) as unknown as VehicleRecord[]
    },

    count({ search, status }) {
      const { where, params } = buildFilters({ search, status })
      const row = db.prepare(`SELECT COUNT(*) as total FROM vehicle ${where}`).get(...params) as {
        total: number
      }
      return row.total
    },

    findById,

    create({ id, plate, brand, model, year, categoryId }) {
      db.prepare(
        `INSERT INTO vehicle (id, plate, brand, model, year, category_id, status)
         VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`,
      ).run(id, plate, brand, model, year, categoryId)
      return findById(id)!
    },

    update(id, input) {
      const existing = findById(id)
      if (!existing) return undefined

      const plate = input.plate ?? existing.plate
      const brand = input.brand ?? existing.brand
      const model = input.model ?? existing.model
      const year = input.year ?? existing.year
      const categoryId = input.categoryId ?? existing.category_id
      const status = input.status ?? existing.status

      db.prepare(
        `UPDATE vehicle
         SET plate = ?, brand = ?, model = ?, year = ?, category_id = ?, status = ?, updated_at = datetime('now')
         WHERE id = ?`,
      ).run(plate, brand, model, year, categoryId, status, id)

      return findById(id)
    },
  }
}
