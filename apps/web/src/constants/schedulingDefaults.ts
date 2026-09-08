// Mirrors apps/api/src/modules/appointments/appointmentService.ts's scheduling
// constants for display in Admin > Configurações (a mocked, non-persisting screen —
// see "O que é real vs. simulado" in README.md). Keep in sync manually; drifting
// only affects what this display shows, not the real scheduling algorithm.
export const BUSINESS_HOURS_START_HOUR = 8
export const BUSINESS_HOURS_END_HOUR = 18
export const DEFAULT_DURATION_MINUTES = 50
export const MIN_ADVANCE_MINUTES = 120
