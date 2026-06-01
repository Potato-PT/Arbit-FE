import type { AuthTokenResponse } from '../features/user/api/authApi'

export const AUTH_STORAGE_KEY = 'arbit.isLoggedIn'
export const ACCESS_TOKEN_STORAGE_KEY = 'accessToken'
export const REFRESH_TOKEN_STORAGE_KEY = 'refreshToken'
export const AUTHENTICATED_USERNAME_STORAGE_KEY = 'arbit.authenticatedUsername'
export const RECOMMENDATION_EVENT_IDS_STORAGE_KEY = 'arbit.recommendationEventIdsByUsername'
export const PREFERENCES_ONBOARDING_STORAGE_KEY = 'arbit.preferencesOnboarding'

function readLocalStorage(key: string) {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.localStorage.getItem(key) ?? ''
}

export function readAccessToken() {
  return readLocalStorage(ACCESS_TOKEN_STORAGE_KEY)
}

export function readRecommendationEventIds() {
  const username = readLocalStorage(AUTHENTICATED_USERNAME_STORAGE_KEY)
  const storedEventIdsByUsername = readLocalStorage(RECOMMENDATION_EVENT_IDS_STORAGE_KEY)

  if (!username || !storedEventIdsByUsername) {
    return []
  }

  try {
    const eventIdsByUsername = JSON.parse(storedEventIdsByUsername) as unknown
    const eventIds =
      typeof eventIdsByUsername === 'object' &&
      eventIdsByUsername !== null &&
      username in eventIdsByUsername
        ? (eventIdsByUsername as Record<string, unknown>)[username]
        : undefined

    return Array.isArray(eventIds) && eventIds.every(isValidEventId) && isValidEventIdCount(eventIds)
      ? eventIds
      : []
  } catch {
    return []
  }
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

  const normalizedAccessToken = normalizeJwt(accessToken, 'access token')
  const normalizedRefreshToken = normalizeJwt(refreshToken, 'refresh token')

  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, normalizedAccessToken)
  window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, normalizedRefreshToken)
}

export function saveAuthenticatedUsername(username: string) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(AUTHENTICATED_USERNAME_STORAGE_KEY, username)
}

export function beginPreferencesOnboarding() {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.setItem(PREFERENCES_ONBOARDING_STORAGE_KEY, 'true')
}

export function hasPreferencesOnboarding() {
  if (typeof window === 'undefined') {
    return false
  }

  return window.sessionStorage.getItem(PREFERENCES_ONBOARDING_STORAGE_KEY) === 'true'
}

export function completePreferencesOnboarding() {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.removeItem(PREFERENCES_ONBOARDING_STORAGE_KEY)
}

export function saveRecommendationEventIds(eventIds: string[]) {
  if (typeof window === 'undefined') {
    return
  }

  const validEventIds = [...new Set(eventIds.filter(isValidEventId))]

  if (!isValidEventIdCount(validEventIds)) {
    throw new Error('Invalid recommendation event IDs')
  }

  const username = readLocalStorage(AUTHENTICATED_USERNAME_STORAGE_KEY)

  if (!username) {
    throw new Error('Missing authenticated username')
  }

  const storedEventIdsByUsername = readLocalStorage(RECOMMENDATION_EVENT_IDS_STORAGE_KEY)
  const eventIdsByUsername = parseEventIdsByUsername(storedEventIdsByUsername)

  window.localStorage.setItem(
    RECOMMENDATION_EVENT_IDS_STORAGE_KEY,
    JSON.stringify({ ...eventIdsByUsername, [username]: validEventIds }),
  )
}

function normalizeJwt(token: unknown, label: string) {
  if (typeof token !== 'string') {
    throw new Error(`Invalid ${label}`)
  }

  const normalizedToken = token.trim()

  if (!isJwtLike(normalizedToken)) {
    throw new Error(`Invalid ${label}`)
  }

  return normalizedToken
}

export function isJwtLike(token: string) {
  const segments = token.split('.')

  return segments.length === 3 && segments.every(Boolean)
}

function isValidEventId(eventId: unknown): eventId is string {
  return typeof eventId === 'string' && Boolean(eventId.trim())
}

function isValidEventIdCount(eventIds: string[]) {
  return eventIds.length >= 4 && eventIds.length <= 5
}

function parseEventIdsByUsername(value: string) {
  if (!value) {
    return {}
  }

  try {
    const parsedValue = JSON.parse(value) as unknown

    return typeof parsedValue === 'object' && parsedValue !== null
      ? parsedValue as Record<string, unknown>
      : {}
  } catch {
    return {}
  }
}

export function clearAuthStorage() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
  window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
  window.localStorage.removeItem(AUTH_STORAGE_KEY)
  window.localStorage.removeItem(AUTHENTICATED_USERNAME_STORAGE_KEY)
  window.sessionStorage.removeItem(PREFERENCES_ONBOARDING_STORAGE_KEY)
  window.dispatchEvent(new Event('arbit-auth-change'))
}
