export interface ApiErrorResponse {
  code: string
  message: string
  fieldErrors?: Record<string, string[]>
  correlationId: string
}
