import type { Queryable } from '../database/connection.ts'

export interface InstructorAvailabilityRecord {
  id: string
  instructor_id: string
  weekday: number
  start_time: string
  end_time: string
  active: number
  created_at: string
}

export interface CreateInstructorAvailabilityInput {
  id: string
  instructorId: string
  weekday: number
  startTime: string
  endTime: string
}

export interface InstructorAvailabilityModel {
  findByInstructorId(instructorId: string): Promise<InstructorAvailabilityRecord[]>
  findActiveByInstructorAndWeekday(instructorId: string, weekday: number): Promise<InstructorAvailabilityRecord[]>
  create(input: CreateInstructorAvailabilityInput): Promise<InstructorAvailabilityRecord>
}

export function createInstructorAvailabilityModel(db: Queryable): InstructorAvailabilityModel {
  return {
    async findByInstructorId(instructorId) {
      const { rows } = await db.query<InstructorAvailabilityRecord>(
        'SELECT * FROM instructor_availability WHERE instructor_id = $1 ORDER BY weekday, start_time',
        [instructorId],
      )
      return rows
    },

    async findActiveByInstructorAndWeekday(instructorId, weekday) {
      const { rows } = await db.query<InstructorAvailabilityRecord>(
        'SELECT * FROM instructor_availability WHERE instructor_id = $1 AND weekday = $2 AND active = 1',
        [instructorId, weekday],
      )
      return rows
    },

    async create({ id, instructorId, weekday, startTime, endTime }) {
      const { rows } = await db.query<InstructorAvailabilityRecord>(
        `INSERT INTO instructor_availability (id, instructor_id, weekday, start_time, end_time)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [id, instructorId, weekday, startTime, endTime],
      )
      return rows[0]!
    },
  }
}
