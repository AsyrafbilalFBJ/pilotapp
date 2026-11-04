/**
 * One $fetch instance for the whole app: points at the API, adds the bearer token,
 * and sends the pilot back to Sign In when a stored token is rejected (expired or invalid).
 */
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const api = $fetch.create({
    baseURL: config.public.apiBase,
    onRequest({ options }) {
      const auth = useAuthStore()
      if (auth.token) {
        options.headers.set('Authorization', `Bearer ${auth.token}`)
      }
    },
    async onResponseError({ response }) {
      const auth = useAuthStore()
      // A 401 without a token is a failed sign-in; the Sign In page handles that itself.
      if (response.status === 401 && auth.token) {
        auth.logout()
        await navigateTo('/login')
      }
    },
  })

  return { provide: { api } }
})
