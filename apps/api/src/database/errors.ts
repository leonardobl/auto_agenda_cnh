// PostgreSQL reports constraint failures through SQLSTATE codes on the thrown error
// (`code`) plus the violated constraint's name (`constraint`). Services translate these
// into the API's own 409s. Column-level UNIQUE constraints are auto-named
// `<table>_<column>_key`; the exclusion constraints are named in migration 0007.
const UNIQUE_VIOLATION = '23505'
const EXCLUSION_VIOLATION = '23P01'

function violates(error: unknown, code: string, constraint: string): boolean {
  if (!(error instanceof Error)) return false
  const { code: errorCode, constraint: errorConstraint } = error as { code?: string; constraint?: string }
  return errorCode === code && errorConstraint === constraint
}

export function isUniqueViolation(error: unknown, constraint: string): boolean {
  return violates(error, UNIQUE_VIOLATION, constraint)
}

export function isExclusionViolation(error: unknown, constraint: string): boolean {
  return violates(error, EXCLUSION_VIOLATION, constraint)
}
