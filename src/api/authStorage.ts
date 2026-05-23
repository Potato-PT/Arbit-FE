import type { AuthTokenResponse } from '../features/user/api/authApi'

export const AUTH_STORAGE_KEY = 'arbit.isLoggedIn'
export const ACCESS_TOKEN_STORAGE_KEY = 'accessToken'
export const REFRESH_TOKEN_STORAGE_KEY = 'refreshToken'

function readLocalStorage(key: string) {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.localStorage.getItem(key) ?? ''
}

export function readAccessToken() {
  return readLocalStorage(ACCESS_TOKEN_STORAGE_KEY)
}

export function hasStoredLoginStatus() {
  if (typeof window === 'undefined') {
    return false
  }

  return window.localStorage.getItem(AUTH_STORAGE_KEY) === 'true' || Boolean(readAccessToken())
}

export function saveLoginStatus(nextIsLoggedIn: boolean) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, String(nextIsLoggedIn))
}

export function saveAuthTokens({ accessToken, refreshToken }: AuthTokenResponse) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken)
  window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken)
}

export function clearAuthStorage() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
  window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
  window.localStorage.removeItem(AUTH_STORAGE_KEY)
  window.dispatchEvent(new Event('arbit-auth-change'))
}
