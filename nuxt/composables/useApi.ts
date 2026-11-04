/** The app-wide API client from plugins/api.ts. */
export function useApi() {
  return useNuxtApp().$api
}
