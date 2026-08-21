import type { DatabaseSync } from 'node:sqlite'

export interface AppointmentRecord {
  id: string
  student_id: string
  instructor_id: string
  vehicle_id: string
  category_id: string
  start_at: string
  end_at: string
  status: string
  cancellation_reason: string | null
  notes: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface CreateAppointmentInput {
  id: string
  studentId: string
  instructorId: string
  vehicleId: string
  categoryId: string
  startAt: string
  endAt: string
  createdBy: string
}

export interface AppointmentRepository {
  isStudentFree(studentId: string, startAt: string, endAt: string): boolean
  isInstructorFree(instructorId: string, startAt: string, endAt: string): boolean
  isVehicleFree(vehicleId: string, startAt: string, endAt: string): boolean
  create(input: CreateAppointmentInput): AppointmentRecord
  findMany(params: { page: number; pageSize: number }): AppointmentRecord[]
  count(): number
}

// Every appointment created in this change stays in AGENDADA (no cancel/complete
// actions exist yet), so every row is a "live" booking — this overlap check doesn't
// need a status filter today. Add one (excluding cancelled/final states) once a
// lifecycle-transition change lands.
function isFree(
  db: DatabaseSync,
  column: 'student_id' | 'instructor_id' | 'vehicle_id',
  resourceId: string,
  startAt: string,
  endAt: string,
): boolean {
  // Overlap iff NOT(existing.end_at <= new.startAt OR new.endAt <= existing.start_at),
  // i.e. NOT(end_at <= newStartAt OR start_at >= newEndAt) — bind newStartAt first,
  // newEndAt second (params must not be swapped, or every check silently inverts).
  const row = db
    .prepare(`SELECT 1 FROM appointment WHERE ${column} = ? AND NOT (end_at <= ? OR start_at >= ?) LIMIT 1`)
    .get(resourceId, startAt, endAt)
  return !row
}

export function createAppointmentRepository(db: DatabaseSync): AppointmentRepository {
  function findById(id: string): AppointmentRecord | undefined {
    return db.prepare('SELECT * FROM appointment WHERE id = ?').get(id) as AppointmentRecord | undefined
  }

  return {
    isStudentFree(studentId, startAt, endAt) {
      return isFree(db, 'student_id', studentId, startAt, endAt)
    },

    isInstructorFree(instructorId, startAt, endAt) {
      return isFree(db, 'instructor_id', instructorId, startAt, endAt)
    },

    isVehicleFree(vehicleId, startAt, endAt) {
      return isFree(db, 'vehicle_id', vehicleId, startAt, endAt)
    },

    create({ id, studentId, instructorId, vehicleId, categoryId, startAt, endAt, createdBy }) {
      db.prepare(
        `INSERT INTO appointment (id, student_id, instructor_id, vehicle_id, category_id, start_at, end_at, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(id, studentId, instructorId, vehicleId, categoryId, startAt, endAt, createdBy)
      return findById(id)!
    },

    findMany({ page, pageSize }) {
      const offset = (page - 1) * pageSize
      return db
        .prepare('SELECT * FROM appointment ORDER BY start_at LIMIT ? OFFSET ?')
        .all(pageSize, offset) as unknown as AppointmentRecord[]
    },

    count() {
      const row = db.prepare('SELECT COUNT(*) as total FROM appointment').get() as { total: number }
      return row.total
    },
  }
}
