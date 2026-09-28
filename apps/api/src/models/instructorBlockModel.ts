import type { Queryable } from '../database/connection.ts'

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

export interface InstructorBlockModel {
  findByInstructorId(instructorId: string): Promise<InstructorBlockRecord[]>
  isBlocked(instructorId: string, startAt: string, endAt: string): Promise<boolean>
  create(input: CreateInstructorBlockInput): Promise<InstructorBlockRecord>
}

export function createInstructorBlockModel(db: Queryable): InstructorBlockModel {
  return {
    async findByInstructorId(instructorId) {
      const { rows } = await db.query<InstructorBlockRecord>(
        'SELECT * FROM instructor_block WHERE instructor_id = $1 ORDER BY start_at',
        [instructorId],
      )
      return rows
    },

    async isBlocked(instructorId, startAt, endAt) {
      // Overlap iff NOT(existing.end_at <= new.startAt OR new.endAt <= existing.start_at)
      // — same param-order gotcha as appointmentModel's isFree: bind
      // newStartAt ($2) first, newEndAt ($3) second, or the check silently inverts.
      const { rows } = await db.query(
        'SELECT 1 FROM instructor_block WHERE instructor_id = $1 AND NOT (end_at <= $2 OR start_at >= $3) LIMIT 1',
        [instructorId, startAt, endAt],
      )
      return rows.length > 0
    },

    async create({ id, instructorId, startAt, endAt, reason, createdBy }) {
      const { rows } = await db.query<InstructorBlockRecord>(
        `INSERT INTO instructor_block (id, instructor_id, start_at, end_at, reason, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [id, instructorId, startAt, endAt, reason, createdBy],
      )
      return rows[0]!
    },
  }
}
