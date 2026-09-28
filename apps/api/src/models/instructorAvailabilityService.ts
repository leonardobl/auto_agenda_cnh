import { randomUUID } from 'node:crypto'
import { ApiError } from '../shared/ApiError.ts'
import type { InstructorModel } from './instructorModel.ts'
import type {
  InstructorAvailabilityModel,
  InstructorAvailabilityRecord,
} from './instructorAvailabilityModel.ts'
import type {
  InstructorBlockModel,
  InstructorBlockRecord,
} from './instructorBlockModel.ts'

export interface Requester {
  role: string
  userId: string
}

export interface AddAvailabilityParams {
  weekday?: unknown
  startTime?: unknown
  endTime?: unknown
}

export interface AddBlockParams {
  startAt?: unknown
  endAt?: unknown
  reason?: unknown
}

export interface InstructorAvailabilityService {
  listAvailability(instructorId: string, requester: Requester): Promise<InstructorAvailabilityRecord[]>
  addAvailability(
    instructorId: string,
    requester: Requester,
    params: AddAvailabilityParams,
  ): Promise<InstructorAvailabilityRecord>
  listBlocks(instructorId: string, requester: Requester): Promise<InstructorBlockRecord[]>
  addBlock(instructorId: string, requester: Requester, params: AddBlockParams): Promise<InstructorBlockRecord>
}

interface InstructorAvailabilityServiceDeps {
  instructorModel: InstructorModel
  instructorAvailabilityModel: InstructorAvailabilityModel
  instructorBlockModel: InstructorBlockModel
}

export function createInstructorAvailabilityService({
  instructorModel,
  instructorAvailabilityModel,
  instructorBlockModel,
}: InstructorAvailabilityServiceDeps): InstructorAvailabilityService {
  async function assertCanManage(instructorId: string, requester: Requester): Promise<void> {
    const instructor = await instructorModel.findById(instructorId)
    if (!instructor) {
      throw new ApiError(404, 'INSTRUCTOR_NOT_FOUND', 'Instrutor não encontrado.')
    }
    if (requester.role !== 'ADMIN' && instructor.user_id !== requester.userId) {
      throw new ApiError(403, 'FORBIDDEN', 'Você não tem permissão para acessar este recurso.')
    }
  }

  return {
    async listAvailability(instructorId, requester) {
      await assertCanManage(instructorId, requester)
      return instructorAvailabilityModel.findByInstructorId(instructorId)
    },

    async addAvailability(instructorId, requester, { weekday, startTime, endTime }) {
      await assertCanManage(instructorId, requester)

      const parsedWeekday = Number(weekday)
      if (
        !Number.isInteger(parsedWeekday) ||
        parsedWeekday < 0 ||
        parsedWeekday > 6 ||
        typeof startTime !== 'string' ||
        !startTime ||
        typeof endTime !== 'string' ||
        !endTime ||
        endTime <= startTime
      ) {
        throw new ApiError(
          400,
          'VALIDATION_ERROR',
          'Informe um dia da semana (0-6), horário inicial e horário final (depois do inicial).',
        )
      }

      return instructorAvailabilityModel.create({
        id: randomUUID(),
        instructorId,
        weekday: parsedWeekday,
        startTime,
        endTime,
      })
    },

    async listBlocks(instructorId, requester) {
      await assertCanManage(instructorId, requester)
      return instructorBlockModel.findByInstructorId(instructorId)
    },

    async addBlock(instructorId, requester, { startAt, endAt, reason }) {
      await assertCanManage(instructorId, requester)

      if (
        typeof startAt !== 'string' ||
        !startAt ||
        typeof endAt !== 'string' ||
        !endAt ||
        typeof reason !== 'string' ||
        !reason.trim()
      ) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Informe início, fim e motivo do bloqueio.')
      }

      const start = new Date(startAt)
      const end = new Date(endAt)
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Intervalo de bloqueio inválido.')
      }

      return instructorBlockModel.create({
        id: randomUUID(),
        instructorId,
        startAt: start.toISOString(),
        endAt: end.toISOString(),
        reason: reason.trim(),
        createdBy: requester.userId,
      })
    },
  }
}
