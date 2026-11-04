import type { LoginRequest, LoginResponse } from '~/types/api'

/** POST /auth/login. Used by the auth store, which keeps the returned token. */
export function useAuthApi() {
  const api = useApi()

  /** Throws the API error (401 bad credentials, 400 missing fields) to the caller. */
  function login(credentials: LoginRequest): Promise<LoginResponse> {
    return api<LoginResponse>('/auth/login', { method: 'POST', body: credentials })
  }

  return { login }
}
