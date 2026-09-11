import type { DatabaseSync } from 'node:sqlite'

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

export interface InstructorAvailabilityRepository {
  findByInstructorId(instructorId: string): InstructorAvailabilityRecord[]
  findActiveByInstructorAndWeekday(instructorId: string, weekday: number): InstructorAvailabilityRecord[]
  create(input: CreateInstructorAvailabilityInput): InstructorAvailabilityRecord
}

export function createInstructorAvailabilityRepository(
  db: DatabaseSync,
): InstructorAvailabilityRepository {
  function findById(id: string): InstructorAvailabilityRecord {
    return db
      .prepare('SELECT * FROM instructor_availability WHERE id = ?')
      .get(id) as unknown as InstructorAvailabilityRecord
  }

  return {
    findByInstructorId(instructorId) {
      return db
        .prepare('SELECT * FROM instructor_availability WHERE instructor_id = ? ORDER BY weekday, start_time')
        .all(instructorId) as unknown as InstructorAvailabilityRecord[]
    },

    findActiveByInstructorAndWeekday(instructorId, weekday) {
      return db
        .prepare(
          'SELECT * FROM instructor_availability WHERE instructor_id = ? AND weekday = ? AND active = 1',
        )
        .all(instructorId, weekday) as unknown as InstructorAvailabilityRecord[]
    },

    create({ id, instructorId, weekday, startTime, endTime }) {
      db.prepare(
        `INSERT INTO instructor_availability (id, instructor_id, weekday, start_time, end_time)
         VALUES (?, ?, ?, ?, ?)`,
      ).run(id, instructorId, weekday, startTime, endTime)
      return findById(id)
    },
  }
}
