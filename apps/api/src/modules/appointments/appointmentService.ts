import { randomUUID } from 'node:crypto'
import type { DatabaseSync } from 'node:sqlite'
import { ApiError } from '../../shared/ApiError.ts'
import type { AppointmentRepository, AppointmentRecord } from '../../repositories/appointmentRepository.ts'
import type { StudentRepository } from '../../repositories/studentRepository.ts'
import type { InstructorRepository } from '../../repositories/instructorRepository.ts'
import type { VehicleRepository } from '../../repositories/vehicleRepository.ts'

// Stand-in for a future `system_setting` table (see the appointment-scheduling
// change's design.md Non-Goals) — hardcoded on purpose for this academic scope,
// not a settings-editing screen anyone can reach today.
const BUSINESS_HOURS_START_HOUR = 8
const BUSINESS_HOURS_END_HOUR = 18
const DEFAULT_DURATION_MINUTES = 50
const MIN_ADVANCE_MINUTES = 120
const SLOT_STEP_MINUTES = 30
const MAX_SLOTS_RETURNED = 20
const MAX_SEARCH_RANGE_DAYS = 30
const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 50

export interface AvailableSlot {
  startAt: string
  endAt: string
  instructorId: string
  instructorName: string
  vehicleId: string
  vehiclePlate: string
}

export interface AppointmentListResult {
  items: AppointmentRecord[]
  page: number
  pageSize: number
  total: number
}

export interface SearchSlotsParams {
  studentId?: unknown
  categoryId?: unknown
  dateFrom?: unknown
  dateTo?: unknown
  durationMinutes?: unknown
}

export interface BookAppointmentParams {
  studentId?: unknown
  instructorId?: unknown
  vehicleId?: unknown
  categoryId?: unknown
  startAt?: unknown
  durationMinutes?: unknown
}

export interface ListAppointmentsParams {
  page?: unknown
  pageSize?: unknown
}

export interface Requester {
  role: string
  userId: string
}

export interface AppointmentService {
  searchSlots(params: SearchSlotsParams): AvailableSlot[]
  book(params: BookAppointmentParams, createdBy: string): AppointmentRecord
  list(params: ListAppointmentsParams, requester: Requester): AppointmentListResult
}

interface AppointmentServiceDeps {
  db: DatabaseSync
  appointmentRepository: AppointmentRepository
  studentRepository: StudentRepository
  instructorRepository: InstructorRepository
  vehicleRepository: VehicleRepository
}

function parsePage(value: unknown): number {
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : 1
}

function parsePageSize(value: unknown): number {
  const pageSize = Number(value)
  if (!Number.isInteger(pageSize) || pageSize <= 0) return DEFAULT_PAGE_SIZE
  return Math.min(pageSize, MAX_PAGE_SIZE)
}

function parseDuration(value: unknown): number {
  const duration = Number(value)
  return Number.isInteger(duration) && duration > 0 ? duration : DEFAULT_DURATION_MINUTES
}

// Business hours are checked in UTC (Date#getUTCHours), not the project's real
// target timezone (America/Fortaleza per docs/01 RN-025) — a deliberate
// simplification for this academic scope; a timezone-aware implementation would
// need a real library and per-locale handling.
function isWithinBusinessHours(start: Date, end: Date): boolean {
  const sameDay =
    start.getUTCFullYear() === end.getUTCFullYear() &&
    start.getUTCMonth() === end.getUTCMonth() &&
    start.getUTCDate() === end.getUTCDate()

  if (!sameDay) return false

  const startMinutes = start.getUTCHours() * 60 + start.getUTCMinutes()
  const endMinutes = end.getUTCHours() * 60 + end.getUTCMinutes()

  return startMinutes >= BUSINESS_HOURS_START_HOUR * 60 && endMinutes <= BUSINESS_HOURS_END_HOUR * 60
}

function meetsAdvanceNotice(start: Date, now: Date): boolean {
  return start.getTime() - now.getTime() >= MIN_ADVANCE_MINUTES * 60 * 1000
}

export function createAppointmentService({
  db,
  appointmentRepository,
  studentRepository,
  instructorRepository,
  vehicleRepository,
}: AppointmentServiceDeps): AppointmentService {
  return {
    searchSlots({ studentId, categoryId, dateFrom, dateTo, durationMinutes }) {
      if (typeof studentId !== 'string' || !studentId) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Informe o aluno.')
      }
      if (typeof categoryId !== 'string' || !categoryId) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Informe a categoria.')
      }

      const student = studentRepository.findById(studentId)
      if (!student || student.status !== 'ACTIVE') {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Aluno inválido ou inativo.')
      }
      if (student.category_id !== categoryId) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Categoria incompatível com o aluno.')
      }

      const duration = parseDuration(durationMinutes)
      const now = new Date()

      const from = typeof dateFrom === 'string' && dateFrom ? new Date(dateFrom) : now
      const requestedTo =
        typeof dateTo === 'string' && dateTo
          ? new Date(dateTo)
          : new Date(from.getTime() + 7 * 24 * 60 * 60 * 1000)

      if (Number.isNaN(from.getTime()) || Number.isNaN(requestedTo.getTime()) || requestedTo <= from) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Intervalo de datas inválido.')
      }

      const maxRangeMs = MAX_SEARCH_RANGE_DAYS * 24 * 60 * 60 * 1000
      const to = requestedTo.getTime() - from.getTime() > maxRangeMs ? new Date(from.getTime() + maxRangeMs) : requestedTo

      const candidateInstructors = instructorRepository.findMany({
        page: 1,
        pageSize: 1000,
        status: 'ACTIVE',
      })
      const candidateVehicles = vehicleRepository
        .findMany({ page: 1, pageSize: 1000, status: 'ACTIVE' })
        .filter((vehicle) => vehicle.category_id === categoryId)

      const slots: AvailableSlot[] = []
      let cursor = new Date(from)

      while (cursor < to && slots.length < MAX_SLOTS_RETURNED) {
        const start = new Date(cursor)
        const end = new Date(start.getTime() + duration * 60 * 1000)
        cursor = new Date(cursor.getTime() + SLOT_STEP_MINUTES * 60 * 1000)

        if (end > to || !isWithinBusinessHours(start, end) || !meetsAdvanceNotice(start, now)) {
          continue
        }

        const startIso = start.toISOString()
        const endIso = end.toISOString()

        if (!appointmentRepository.isStudentFree(studentId, startIso, endIso)) {
          continue
        }

        const instructor = candidateInstructors.find((candidate) =>
          appointmentRepository.isInstructorFree(candidate.id, startIso, endIso),
        )
        if (!instructor) continue

        const vehicle = candidateVehicles.find((candidate) =>
          appointmentRepository.isVehicleFree(candidate.id, startIso, endIso),
        )
        if (!vehicle) continue

        slots.push({
          startAt: startIso,
          endAt: endIso,
          instructorId: instructor.id,
          instructorName: instructor.full_name,
          vehicleId: vehicle.id,
          vehiclePlate: vehicle.plate,
        })
      }

      return slots
    },

    book({ studentId, instructorId, vehicleId, categoryId, startAt, durationMinutes }, createdBy) {
      if (
        typeof studentId !== 'string' ||
        !studentId ||
        typeof instructorId !== 'string' ||
        !instructorId ||
        typeof vehicleId !== 'string' ||
        !vehicleId ||
        typeof categoryId !== 'string' ||
        !categoryId ||
        typeof startAt !== 'string' ||
        !startAt
      ) {
        throw new ApiError(
          400,
          'VALIDATION_ERROR',
          'Aluno, instrutor, veículo, categoria e horário são obrigatórios.',
        )
      }

      const start = new Date(startAt)
      if (Number.isNaN(start.getTime())) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Horário inicial inválido.')
      }
      const duration = parseDuration(durationMinutes)
      const end = new Date(start.getTime() + duration * 60 * 1000)

      const student = studentRepository.findById(studentId)
      if (!student || student.status !== 'ACTIVE') {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Aluno inválido ou inativo.')
      }

      const instructor = instructorRepository.findById(instructorId)
      if (!instructor || instructor.status !== 'ACTIVE') {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Instrutor inválido ou inativo.')
      }

      const vehicle = vehicleRepository.findById(vehicleId)
      if (!vehicle || vehicle.status !== 'ACTIVE') {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Veículo inválido ou indisponível.')
      }

      if (student.category_id !== categoryId || vehicle.category_id !== categoryId) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Categoria incompatível com o aluno ou o veículo.')
      }

      if (!isWithinBusinessHours(start, end)) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Horário fora do expediente configurado.')
      }
      if (!meetsAdvanceNotice(start, new Date())) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Antecedência mínima não respeitada.')
      }

      const startIso = start.toISOString()
      const endIso = end.toISOString()

      // Synchronous critical section, deliberately: node:sqlite's DatabaseSync API
      // is synchronous, and Node's single-threaded event loop can't interleave
      // another request's handler into a `BEGIN...COMMIT` block that never awaits.
      // That (not a DB-level lock) is what gives RN-016 its concurrency guarantee
      // here — see design.md. Keep this block free of `await`.
      db.exec('BEGIN')
      try {
        if (!appointmentRepository.isStudentFree(studentId, startIso, endIso)) {
          throw new ApiError(409, 'APPOINTMENT_STUDENT_CONFLICT', 'O aluno já possui uma aula nesse horário.')
        }
        if (!appointmentRepository.isInstructorFree(instructorId, startIso, endIso)) {
          throw new ApiError(409, 'APPOINTMENT_INSTRUCTOR_CONFLICT', 'O instrutor já possui uma aula nesse horário.')
        }
        if (!appointmentRepository.isVehicleFree(vehicleId, startIso, endIso)) {
          throw new ApiError(409, 'APPOINTMENT_VEHICLE_CONFLICT', 'O veículo já possui uma aula nesse horário.')
        }

        const appointment = appointmentRepository.create({
          id: randomUUID(),
          studentId,
          instructorId,
          vehicleId,
          categoryId,
          startAt: startIso,
          endAt: endIso,
          createdBy,
        })

        db.exec('COMMIT')
        return appointment
      } catch (error) {
        db.exec('ROLLBACK')
        throw error
      }
    },

    list({ page, pageSize }, requester) {
      const parsedPage = parsePage(page)
      const parsedPageSize = parsePageSize(pageSize)

      let instructorId: string | undefined
      if (requester.role === 'INSTRUCTOR') {
        const instructor = instructorRepository.findByUserId(requester.userId)
        if (!instructor) {
          return { items: [], page: parsedPage, pageSize: parsedPageSize, total: 0 }
        }
        instructorId = instructor.id
      }

      const items = appointmentRepository.findMany({ page: parsedPage, pageSize: parsedPageSize, instructorId })
      const total = appointmentRepository.count({ instructorId })

      return { items, page: parsedPage, pageSize: parsedPageSize, total }
    },
  }
}
