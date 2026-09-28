import type { StudentRecord } from '../models/studentModel.ts'

// Fields are listed one by one on purpose: nothing reaches the client unless it is
// named here (LGPD — the view is where "what leaves the API" is decided).
export function presentStudent(student: StudentRecord) {
  return {
    id: student.id,
    user_id: student.user_id,
    full_name: student.full_name,
    document: student.document,
    phone: student.phone,
    birth_date: student.birth_date,
    category_id: student.category_id,
    status: student.status,
    created_at: student.created_at,
    updated_at: student.updated_at,
  }
}
