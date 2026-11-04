import type { HealthResponse } from '~/types/api'

/** GET /health (public). Used by the app store at start-up to read "today". */
export function useHealthApi() {
  const api = useApi()

  function getHealth(): Promise<HealthResponse> {
    return api<HealthResponse>('/health')
  }

  return { getHealth }
}
