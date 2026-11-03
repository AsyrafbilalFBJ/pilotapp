import { defineStore } from 'pinia'
import type { LoginRequest, LoginResponse } from '~/types/api'

const TOKEN_COOKIE = 'pilot_token'

/**
 * Holds the bearer token from POST /auth/login.
 * The token is kept in a session cookie so a page reload keeps the pilot signed in.
 */
export const useAuthStore = defineStore('auth', () => {
  const tokenCookie = useCookie<string | null>(TOKEN_COOKIE, {
    sameSite: 'strict',
    secure: !import.meta.dev,
    default: () => null,
  })

  const token = computed(() => tokenCookie.value)
  const isAuthenticated = computed(() => Boolean(tokenCookie.value))

  /** Throws the API error on failure so the Sign In page can show its message. */
  async function login(credentials: LoginRequest): Promise<void> {
    const api = useApi()
    const response = await api<LoginResponse>('/auth/login', { method: 'POST', body: credentials })
    tokenCookie.value = response.token
  }

  /**
   * Front-end only: forgets the token. The API has no logout endpoint, so the token
   * itself stays valid on the server until it expires.
   */
  function logout(): void {
    tokenCookie.value = null
  }

  return { token, isAuthenticated, login, logout }
})
