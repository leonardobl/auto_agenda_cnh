import type { DatabaseSync } from 'node:sqlite'

export interface InstructorBlockRecord {
  id: string
  instructor_id: string
  start_at: string
  end_at: string
  reason: string
  created_by: string
  created_at: string
}

export interface CreateInstructorBlockInput {
  id: string
  instructorId: string
  startAt: string
  endAt: string
  reason: string
  createdBy: string
}

export interface InstructorBlockRepository {
  findByInstructorId(instructorId: string): InstructorBlockRecord[]
  isBlocked(instructorId: string, startAt: string, endAt: string): boolean
  create(input: CreateInstructorBlockInput): InstructorBlockRecord
}

export function createInstructorBlockRepository(db: DatabaseSync): InstructorBlockRepository {
  function findById(id: string): InstructorBlockRecord {
    return db
      .prepare('SELECT * FROM instructor_block WHERE id = ?')
      .get(id) as unknown as InstructorBlockRecord
  }

  return {
    findByInstructorId(instructorId) {
      return db
        .prepare('SELECT * FROM instructor_block WHERE instructor_id = ? ORDER BY start_at')
        .all(instructorId) as unknown as InstructorBlockRecord[]
    },

    isBlocked(instructorId, startAt, endAt) {
      // Overlap iff NOT(existing.end_at <= new.startAt OR new.endAt <= existing.start_at)
      // — same param-order gotcha as appointmentRepository's isFree: bind
      // newStartAt first, newEndAt second, or the check silently inverts.
      const row = db
        .prepare(
          'SELECT 1 FROM instructor_block WHERE instructor_id = ? AND NOT (end_at <= ? OR start_at >= ?) LIMIT 1',
        )
        .get(instructorId, startAt, endAt)
      return Boolean(row)
    },

    create({ id, instructorId, startAt, endAt, reason, createdBy }) {
      db.prepare(
        `INSERT INTO instructor_block (id, instructor_id, start_at, end_at, reason, created_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
      ).run(id, instructorId, startAt, endAt, reason, createdBy)
      return findById(id)
    },
  }
}
