import type { DatabaseSync } from 'node:sqlite'

export interface HealthModel {
  isDatabaseReachable(): boolean
}

export function createHealthModel(db: DatabaseSync): HealthModel {
  return {
    isDatabaseReachable() {
      try {
        db.prepare('SELECT 1').get()
        return true
      } catch {
        return false
      }
    },
  }
}
