import type { ApiErrorResponse } from '~/types/api'

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const record = value as Record<string, unknown>
  return (
    typeof record.statusCode === 'number' &&
    (typeof record.message === 'string' || Array.isArray(record.message))
  )
}

/** HTTP status of a failed API call, or undefined when the server was not reached. */
export function apiErrorStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) {
    return undefined
  }
  // The API body is the most reliable source: useAsyncData re-wraps fetch errors.
  const data = (error as { data?: unknown }).data
  if (isApiErrorResponse(data)) {
    return data.statusCode
  }
  const { statusCode, status } = error as { statusCode?: unknown; status?: unknown }
  if (typeof statusCode === 'number' && statusCode > 0) return statusCode
  if (typeof status === 'number' && status > 0) return status
  return undefined
}

/**
 * The message the API returned (joined when it lists several problems).
 * Falls back to a connection message when there is no API response at all.
 */
export function apiErrorMessage(error: unknown, fallback = 'Something went wrong. Try again.'): string {
  const data = typeof error === 'object' && error !== null ? (error as { data?: unknown }).data : undefined
  if (isApiErrorResponse(data)) {
    return Array.isArray(data.message) ? data.message.join('. ') : data.message
  }
  if (apiErrorStatus(error) === undefined) {
    return "Can't reach the server. Check your connection and try again."
  }
  return fallback
}
