import type { Queryable } from '../database/connection.ts'

export interface HealthModel {
  isDatabaseReachable(): Promise<boolean>
}

export function createHealthModel(db: Queryable): HealthModel {
  return {
    async isDatabaseReachable() {
      try {
        await db.query('SELECT 1')
        return true
      } catch {
        return false
      }
    },
  }
}
