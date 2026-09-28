import type { Queryable } from '../database/connection.ts'
import { bind } from '../database/params.ts'

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
  student_full_name: string
  instructor_full_name: string
  vehicle_plate: string
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

export interface FindManyParams {
  page: number
  pageSize: number
  instructorId?: string
  studentId?: string
}

export interface CountParams {
  instructorId?: string
  studentId?: string
}

export interface AppointmentModel {
  isStudentFree(studentId: string, startAt: string, endAt: string): Promise<boolean>
  isInstructorFree(instructorId: string, startAt: string, endAt: string): Promise<boolean>
  isVehicleFree(vehicleId: string, startAt: string, endAt: string): Promise<boolean>
  create(input: CreateAppointmentInput): Promise<AppointmentRecord>
  findMany(params: FindManyParams): Promise<AppointmentRecord[]>
  count(params: CountParams): Promise<number>
}

// Resolves the student/instructor/vehicle names an Instructor caller needs to make
// sense of their own schedule — they have no access to /students or /vehicles to
// look these up separately (both stay Admin-only), so the appointment list has to
// carry them directly.
const SELECT_WITH_NAMES = `
  SELECT appointment.*,
    student.full_name AS student_full_name,
    instructor.full_name AS instructor_full_name,
    vehicle.plate AS vehicle_plate
  FROM appointment
  JOIN student ON student.id = appointment.student_id
  JOIN instructor ON instructor.id = appointment.instructor_id
  JOIN vehicle ON vehicle.id = appointment.vehicle_id
`

// Every appointment created so far stays in AGENDADA (no cancel/complete actions
// exist yet), so every row is a "live" booking — this overlap check doesn't need a
// status filter today. Add one (excluding cancelled/final states) once a
// lifecycle-transition change lands, and add the same predicate to the exclusion
// constraints in migration 0007.
async function isFree(
  db: Queryable,
  column: 'student_id' | 'instructor_id' | 'vehicle_id',
  resourceId: string,
  startAt: string,
  endAt: string,
): Promise<boolean> {
  // Overlap iff NOT(existing.end_at <= new.startAt OR new.endAt <= existing.start_at),
  // i.e. NOT(end_at <= newStartAt OR start_at >= newEndAt) — bind newStartAt ($2) first,
  // newEndAt ($3) second (params must not be swapped, or every check silently inverts).
  // This check gives the friendly per-resource 409; the exclusion constraints in
  // migration 0007 are the concurrency-proof backstop behind it.
  const { rows } = await db.query(
    `SELECT 1 FROM appointment WHERE ${column} = $1 AND NOT (end_at <= $2 OR start_at >= $3) LIMIT 1`,
    [resourceId, startAt, endAt],
  )
  return rows.length === 0
}

export function createAppointmentModel(db: Queryable): AppointmentModel {
  async function findById(id: string): Promise<AppointmentRecord | undefined> {
    const { rows } = await db.query<AppointmentRecord>(`${SELECT_WITH_NAMES} WHERE appointment.id = $1`, [id])
    return rows[0]
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

    async create({ id, studentId, instructorId, vehicleId, categoryId, startAt, endAt, createdBy }) {
      // May reject with a 23P01 (exclusion_violation) if a concurrent booking won the
      // race — appointmentService.book translates it to the matching 409.
      await db.query(
        `INSERT INTO appointment (id, student_id, instructor_id, vehicle_id, category_id, start_at, end_at, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [id, studentId, instructorId, vehicleId, categoryId, startAt, endAt, createdBy],
      )
      return (await findById(id))!
    },

    async findMany({ page, pageSize, instructorId, studentId }) {
      const params: unknown[] = []
      // A single requester has exactly one role, so instructorId/studentId are never
      // both set at once — this is a parallel scoping branch, not a combined filter.
      const where = instructorId
        ? `WHERE appointment.instructor_id = ${bind(params, instructorId)}`
        : studentId
          ? `WHERE appointment.student_id = ${bind(params, studentId)}`
          : ''
      const limit = bind(params, pageSize)
      const offset = bind(params, (page - 1) * pageSize)
      const { rows } = await db.query<AppointmentRecord>(
        `${SELECT_WITH_NAMES} ${where} ORDER BY appointment.start_at LIMIT ${limit} OFFSET ${offset}`,
        params,
      )
      return rows
    },

    async count({ instructorId, studentId }) {
      const params: unknown[] = []
      const where = instructorId
        ? `WHERE instructor_id = ${bind(params, instructorId)}`
        : studentId
          ? `WHERE student_id = ${bind(params, studentId)}`
          : ''
      const { rows } = await db.query<{ total: number }>(
        `SELECT COUNT(*)::int AS total FROM appointment ${where}`,
        params,
      )
      return rows[0]!.total
    },
  }
}
