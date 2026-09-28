import { randomUUID } from 'node:crypto'
import type { Database } from '../database/connection.ts'
import { isExclusionViolation } from '../database/errors.ts'
import { ApiError } from '../shared/ApiError.ts'
import { createAppointmentModel } from './appointmentModel.ts'
import type { AppointmentModel, AppointmentRecord } from './appointmentModel.ts'
import type { StudentModel } from './studentModel.ts'
import type { InstructorModel } from './instructorModel.ts'
import type { InstructorAvailabilityModel } from './instructorAvailabilityModel.ts'
import type { InstructorBlockModel } from './instructorBlockModel.ts'
import type { VehicleModel } from './vehicleModel.ts'

// Stand-in for a future `system_setting` table (see the appointment-scheduling
// change's design.md Non-Goals) — hardcoded on purpose for this academic scope.
// Admin > Configurações displays these values (mirrored in
// apps/web/src/constants/schedulingDefaults.ts) but its "save" is mocked and
// never writes back here — see "O que é real vs. simulado" in README.md.
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
  searchSlots(params: SearchSlotsParams, requester: Requester): Promise<AvailableSlot[]>
  book(params: BookAppointmentParams, requester: Requester): Promise<AppointmentRecord>
  list(params: ListAppointmentsParams, requester: Requester): Promise<AppointmentListResult>
}

interface AppointmentServiceDeps {
  database: Database
  appointmentModel: AppointmentModel
  studentModel: StudentModel
  instructorModel: InstructorModel
  instructorAvailabilityModel: InstructorAvailabilityModel
  instructorBlockModel: InstructorBlockModel
  vehicleModel: VehicleModel
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

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export function createAppointmentService({
  database,
  appointmentModel,
  studentModel,
  instructorModel,
  instructorAvailabilityModel,
  instructorBlockModel,
  vehicleModel,
}: AppointmentServiceDeps): AppointmentService {
  // An instructor is available only inside a declared weekly window (weekday +
  // time-of-day, same UTC-only simplification as isWithinBusinessHours) and
  // outside any block — no declared windows means never available, a deliberate
  // change from this project's earlier "every active instructor is always
  // available" simplification (see instructor-availability's design.md).
  async function isInstructorAvailable(instructorId: string, start: Date, end: Date): Promise<boolean> {
    const weekday = start.getUTCDay()
    const startMinutes = start.getUTCHours() * 60 + start.getUTCMinutes()
    const endMinutes = end.getUTCHours() * 60 + end.getUTCMinutes()

    const windows = await instructorAvailabilityModel.findActiveByInstructorAndWeekday(instructorId, weekday)
    const withinWindow = windows.some(
      (window) => startMinutes >= toMinutes(window.start_time) && endMinutes <= toMinutes(window.end_time),
    )
    if (!withinWindow) return false

    return !(await instructorBlockModel.isBlocked(instructorId, start.toISOString(), end.toISOString()))
  }

  return {
    async searchSlots({ studentId, categoryId, dateFrom, dateTo, durationMinutes }, requester) {
      // A STUDENT caller can only ever search for themselves, in their own registered
      // category — any studentId/categoryId sent in the request is ignored for this
      // role (see design.md's "self-service booking" decision).
      let effectiveStudentId = studentId
      let effectiveCategoryId = categoryId
      if (requester.role === 'STUDENT') {
        const own = await studentModel.findByUserId(requester.userId)
        if (!own) {
          throw new ApiError(400, 'VALIDATION_ERROR', 'Aluno inválido ou inativo.')
        }
        effectiveStudentId = own.id
        effectiveCategoryId = own.category_id
      }

      if (typeof effectiveStudentId !== 'string' || !effectiveStudentId) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Informe o aluno.')
      }
      if (typeof effectiveCategoryId !== 'string' || !effectiveCategoryId) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Informe a categoria.')
      }

      const student = await studentModel.findById(effectiveStudentId)
      if (!student || student.status !== 'ACTIVE') {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Aluno inválido ou inativo.')
      }
      if (student.category_id !== effectiveCategoryId) {
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

      const candidateInstructors = await instructorModel.findMany({
        page: 1,
        pageSize: 1000,
        status: 'ACTIVE',
      })
      const candidateVehicles = (await vehicleModel.findMany({ page: 1, pageSize: 1000, status: 'ACTIVE' })).filter(
        (vehicle) => vehicle.category_id === effectiveCategoryId,
      )

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

        if (!(await appointmentModel.isStudentFree(effectiveStudentId, startIso, endIso))) {
          continue
        }

        // First candidate, in order, that is both available and free — a plain loop
        // because the checks are async (Array#find can't await its predicate).
        let instructor: (typeof candidateInstructors)[number] | undefined
        for (const candidate of candidateInstructors) {
          if (
            (await isInstructorAvailable(candidate.id, start, end)) &&
            (await appointmentModel.isInstructorFree(candidate.id, startIso, endIso))
          ) {
            instructor = candidate
            break
          }
        }
        if (!instructor) continue

        let vehicle: (typeof candidateVehicles)[number] | undefined
        for (const candidate of candidateVehicles) {
          if (await appointmentModel.isVehicleFree(candidate.id, startIso, endIso)) {
            vehicle = candidate
            break
          }
        }
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

    async book({ studentId, instructorId, vehicleId, categoryId, startAt, durationMinutes }, requester) {
      // Same STUDENT-role override as searchSlots — see design.md.
      let effectiveStudentId = studentId
      let effectiveCategoryId = categoryId
      if (requester.role === 'STUDENT') {
        const own = await studentModel.findByUserId(requester.userId)
        if (!own) {
          throw new ApiError(400, 'VALIDATION_ERROR', 'Aluno inválido ou inativo.')
        }
        effectiveStudentId = own.id
        effectiveCategoryId = own.category_id
      }

      if (
        typeof effectiveStudentId !== 'string' ||
        !effectiveStudentId ||
        typeof instructorId !== 'string' ||
        !instructorId ||
        typeof vehicleId !== 'string' ||
        !vehicleId ||
        typeof effectiveCategoryId !== 'string' ||
        !effectiveCategoryId ||
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

      const student = await studentModel.findById(effectiveStudentId)
      if (!student || student.status !== 'ACTIVE') {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Aluno inválido ou inativo.')
      }

      const instructor = await instructorModel.findById(instructorId)
      if (!instructor || instructor.status !== 'ACTIVE') {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Instrutor inválido ou inativo.')
      }

      const vehicle = await vehicleModel.findById(vehicleId)
      if (!vehicle || vehicle.status !== 'ACTIVE') {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Veículo inválido ou indisponível.')
      }

      if (student.category_id !== effectiveCategoryId || vehicle.category_id !== effectiveCategoryId) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Categoria incompatível com o aluno ou o veículo.')
      }

      if (!isWithinBusinessHours(start, end)) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Horário fora do expediente configurado.')
      }
      if (!meetsAdvanceNotice(start, new Date())) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Antecedência mínima não respeitada.')
      }
      if (!(await isInstructorAvailable(instructorId, start, end))) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Instrutor indisponível nesse horário.')
      }

      const startIso = start.toISOString()
      const endIso = end.toISOString()

      // RN-016 under concurrency: the three checks and the insert run in one transaction
      // for a friendly, specific 409 in the common case. Two requests can still pass the
      // checks at the same time (READ COMMITTED) — the exclusion constraints from
      // migration 0007 then make the second insert fail with 23P01, translated below to
      // the same 409 the check would have produced.
      try {
        return await database.withTransaction(async (tx) => {
          const txAppointmentModel = createAppointmentModel(tx)

          if (!(await txAppointmentModel.isStudentFree(effectiveStudentId, startIso, endIso))) {
            throw new ApiError(409, 'APPOINTMENT_STUDENT_CONFLICT', 'O aluno já possui uma aula nesse horário.')
          }
          if (!(await txAppointmentModel.isInstructorFree(instructorId, startIso, endIso))) {
            throw new ApiError(409, 'APPOINTMENT_INSTRUCTOR_CONFLICT', 'O instrutor já possui uma aula nesse horário.')
          }
          if (!(await txAppointmentModel.isVehicleFree(vehicleId, startIso, endIso))) {
            throw new ApiError(409, 'APPOINTMENT_VEHICLE_CONFLICT', 'O veículo já possui uma aula nesse horário.')
          }

          return txAppointmentModel.create({
            id: randomUUID(),
            studentId: effectiveStudentId,
            instructorId,
            vehicleId,
            categoryId: effectiveCategoryId,
            startAt: startIso,
            endAt: endIso,
            createdBy: requester.userId,
          })
        })
      } catch (error) {
        if (isExclusionViolation(error, 'appointment_student_no_overlap')) {
          throw new ApiError(409, 'APPOINTMENT_STUDENT_CONFLICT', 'O aluno já possui uma aula nesse horário.')
        }
        if (isExclusionViolation(error, 'appointment_instructor_no_overlap')) {
          throw new ApiError(409, 'APPOINTMENT_INSTRUCTOR_CONFLICT', 'O instrutor já possui uma aula nesse horário.')
        }
        if (isExclusionViolation(error, 'appointment_vehicle_no_overlap')) {
          throw new ApiError(409, 'APPOINTMENT_VEHICLE_CONFLICT', 'O veículo já possui uma aula nesse horário.')
        }
        throw error
      }
    },

    async list({ page, pageSize }, requester) {
      const parsedPage = parsePage(page)
      const parsedPageSize = parsePageSize(pageSize)

      let instructorId: string | undefined
      let studentId: string | undefined
      if (requester.role === 'INSTRUCTOR') {
        const instructor = await instructorModel.findByUserId(requester.userId)
        if (!instructor) {
          return { items: [], page: parsedPage, pageSize: parsedPageSize, total: 0 }
        }
        instructorId = instructor.id
      } else if (requester.role === 'STUDENT') {
        const student = await studentModel.findByUserId(requester.userId)
        if (!student) {
          return { items: [], page: parsedPage, pageSize: parsedPageSize, total: 0 }
        }
        studentId = student.id
      }

      const items = await appointmentModel.findMany({
        page: parsedPage,
        pageSize: parsedPageSize,
        instructorId,
        studentId,
      })
      const total = await appointmentModel.count({ instructorId, studentId })

      return { items, page: parsedPage, pageSize: parsedPageSize, total }
    },
  }
}
