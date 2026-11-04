import type { PilotProfile } from '~/types/api'

/**
 * GET /pilot/me, shared by Home and More. Both use the same key,
 * so moving between them reuses the loaded profile instead of fetching again.
 */
export function usePilotProfile() {
  const api = useApi()
  return useAsyncData('pilot', () => api<PilotProfile>('/pilot/me'))
}
