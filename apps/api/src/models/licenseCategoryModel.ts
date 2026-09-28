import type { Queryable } from '../database/connection.ts'

export interface LicenseCategoryRecord {
  id: string
  code: string
  name: string
}

export interface LicenseCategoryModel {
  findAll(): Promise<LicenseCategoryRecord[]>
}

export function createLicenseCategoryModel(db: Queryable): LicenseCategoryModel {
  return {
    async findAll() {
      const { rows } = await db.query<LicenseCategoryRecord>('SELECT * FROM license_category ORDER BY code')
      return rows
    },
  }
}
