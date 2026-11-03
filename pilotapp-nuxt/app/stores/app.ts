import { defineStore } from 'pinia'
import type { HealthResponse } from '~/types/api'

type AppStatus = 'idle' | 'loading' | 'ready' | 'error'

/**
 * App-wide facts loaded once at start-up from the public GET /health:
 * whether the API is reachable, and the date the app treats as "today".
 */
export const useAppStore = defineStore('app', () => {
  const status = ref<AppStatus>('idle')
  const today = ref<string | null>(null)
  const errorMessage = ref<string | null>(null)

  async function load(): Promise<void> {
    const api = useApi()
    status.value = 'loading'
    errorMessage.value = null
    try {
      const health = await api<HealthResponse>('/health')
      if (health.status !== 'ok') {
        throw new Error('The service reported it is not ready.')
      }
      today.value = health.today
      status.value = 'ready'
    } catch (error) {
      errorMessage.value = apiErrorMessage(error, 'The service did not answer correctly. Try again in a moment.')
      status.value = 'error'
    }
  }

  return { status, today, errorMessage, load }
})
