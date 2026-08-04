import type { DatabaseSync } from 'node:sqlite'

export interface LicenseCategoryRecord {
  id: string
  code: string
  name: string
}

export interface LicenseCategoryRepository {
  findAll(): LicenseCategoryRecord[]
}

export function createLicenseCategoryRepository(db: DatabaseSync): LicenseCategoryRepository {
  return {
    findAll() {
      return db
        .prepare('SELECT * FROM license_category ORDER BY code')
        .all() as unknown as LicenseCategoryRecord[]
    },
  }
}
