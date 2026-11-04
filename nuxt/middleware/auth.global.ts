const SIGN_IN_PATH = '/login'

/** Every screen except Sign In needs a token. A signed-in pilot skips Sign In. */
export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()

  if (to.path === SIGN_IN_PATH) {
    return auth.isAuthenticated ? navigateTo('/') : undefined
  }

  if (!auth.isAuthenticated) {
    return navigateTo(SIGN_IN_PATH)
  }
})
