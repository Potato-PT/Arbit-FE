import type { AuthTokenResponse } from '../features/user/api/authApi'

export const AUTH_STORAGE_KEY = 'arbit.isLoggedIn'
export const ACCESS_TOKEN_STORAGE_KEY = 'accessToken'
export const REFRESH_TOKEN_STORAGE_KEY = 'refreshToken'
export const AUTHENTICATED_USERNAME_STORAGE_KEY = 'arbit.authenticatedUsername'
export const RECOMMENDATION_EVENT_IDS_STORAGE_KEY = 'arbit.recommendationEventIdsByUsername'
export const PREFERENCES_ONBOARDING_STORAGE_KEY = 'arbit.preferencesOnboarding'
export const USER_LOCATION_STORAGE_KEY = 'arbit.userLocationByUsername'
const MIN_RECOMMENDATION_EVENT_ID_COUNT = 5
const MAX_RECOMMENDATION_EVENT_ID_COUNT = 20

export type UserLocationCoordinates = {
  lat: number
  lng: number
  label: string
}

const seoulDistrictCoordinates: Record<string, UserLocationCoordinates> = {
  강남구: { lat: 37.5172, lng: 127.0473, label: '강남구' },
  강동구: { lat: 37.5301, lng: 127.1238, label: '강동구' },
  강북구: { lat: 37.6396, lng: 127.0257, label: '강북구' },
  강서구: { lat: 37.5509, lng: 126.8495, label: '강서구' },
  관악구: { lat: 37.4784, lng: 126.9516, label: '관악구' },
  광진구: { lat: 37.5384, lng: 127.0823, label: '광진구' },
  구로구: { lat: 37.4955, lng: 126.8877, label: '구로구' },
  금천구: { lat: 37.4569, lng: 126.8955, label: '금천구' },
  노원구: { lat: 37.6542, lng: 127.0568, label: '노원구' },
  도봉구: { lat: 37.6688, lng: 127.0471, label: '도봉구' },
  동대문구: { lat: 37.5744, lng: 127.0396, label: '동대문구' },
  동작구: { lat: 37.5124, lng: 126.9393, label: '동작구' },
  마포구: { lat: 37.5663, lng: 126.9014, label: '마포구' },
  서대문구: { lat: 37.5791, lng: 126.9368, label: '서대문구' },
  서초구: { lat: 37.4836, lng: 127.0327, label: '서초구' },
  성동구: { lat: 37.5633, lng: 127.0371, label: '성동구' },
  성북구: { lat: 37.5894, lng: 127.0167, label: '성북구' },
  송파구: { lat: 37.5145, lng: 127.1059, label: '송파구' },
  양천구: { lat: 37.5169, lng: 126.8664, label: '양천구' },
  영등포구: { lat: 37.5264, lng: 126.8963, label: '영등포구' },
  용산구: { lat: 37.5326, lng: 126.9905, label: '용산구' },
  은평구: { lat: 37.6027, lng: 126.9291, label: '은평구' },
  종로구: { lat: 37.5735, lng: 126.9788, label: '종로구' },
  중구: { lat: 37.5636, lng: 126.9976, label: '중구' },
  중랑구: { lat: 37.6063, lng: 127.0927, label: '중랑구' },
}

function readLocalStorage(key: string) {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.localStorage.getItem(key) ?? ''
}

export function readAccessToken() {
  return readLocalStorage(ACCESS_TOKEN_STORAGE_KEY)
}

export function readAuthenticatedUsername() {
  return readLocalStorage(AUTHENTICATED_USERNAME_STORAGE_KEY)
}

export function readRecommendationEventIds() {
  const username = readAuthenticatedUsername()
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

export function clearAuthenticatedUsername() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(AUTHENTICATED_USERNAME_STORAGE_KEY)
}

export function saveAuthenticatedUserLocation(username: string, residentialArea: string) {
  if (typeof window === 'undefined') {
    return false
  }

  const normalizedUsername = username.trim()
  const coordinates = resolveResidentialAreaCoordinates(residentialArea)

  if (!normalizedUsername || !coordinates) {
    return false
  }

  const storedLocationsByUsername = readLocalStorage(USER_LOCATION_STORAGE_KEY)
  const locationsByUsername = parseUserLocationsByUsername(storedLocationsByUsername)

  window.localStorage.setItem(
    USER_LOCATION_STORAGE_KEY,
    JSON.stringify({ ...locationsByUsername, [normalizedUsername]: coordinates }),
  )

  return true
}

export function readAuthenticatedUserLocation() {
  const username = readAuthenticatedUsername()
  const storedLocationsByUsername = readLocalStorage(USER_LOCATION_STORAGE_KEY)

  if (!username || !storedLocationsByUsername) {
    return null
  }

  const locationsByUsername = parseUserLocationsByUsername(storedLocationsByUsername)
  const coordinates = locationsByUsername[username]

  return isValidUserLocationCoordinates(coordinates) ? coordinates : null
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
    return false
  }

  const validEventIds = [...new Set(eventIds.filter(isValidEventId))]

  if (!isValidEventIdCount(validEventIds)) {
    return false
  }

  const username = readAuthenticatedUsername()

  if (!username) {
    return false
  }

  const storedEventIdsByUsername = readLocalStorage(RECOMMENDATION_EVENT_IDS_STORAGE_KEY)
  const eventIdsByUsername = parseEventIdsByUsername(storedEventIdsByUsername)

  window.localStorage.setItem(
    RECOMMENDATION_EVENT_IDS_STORAGE_KEY,
    JSON.stringify({ ...eventIdsByUsername, [username]: validEventIds }),
  )

  return true
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
  return (
    eventIds.length >= MIN_RECOMMENDATION_EVENT_ID_COUNT &&
    eventIds.length <= MAX_RECOMMENDATION_EVENT_ID_COUNT
  )
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

export function resolveResidentialAreaCoordinates(residentialArea: string) {
  const normalizedResidentialArea = residentialArea.trim()

  if (!normalizedResidentialArea) {
    return null
  }

  const matchedDistrict = Object.keys(seoulDistrictCoordinates).find((district) =>
    normalizedResidentialArea.includes(district),
  )

  return matchedDistrict ? seoulDistrictCoordinates[matchedDistrict] : null
}

function parseUserLocationsByUsername(value: string) {
  if (!value) {
    return {}
  }

  try {
    const parsedValue = JSON.parse(value) as unknown

    if (typeof parsedValue !== 'object' || parsedValue === null) {
      return {}
    }

    return Object.entries(parsedValue).reduce<Record<string, UserLocationCoordinates>>(
      (locationsByUsername, [username, coordinates]) => {
        if (isValidUserLocationCoordinates(coordinates)) {
          locationsByUsername[username] = coordinates
        }

        return locationsByUsername
      },
      {},
    )
  } catch {
    return {}
  }
}

function isValidUserLocationCoordinates(value: unknown): value is UserLocationCoordinates {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as UserLocationCoordinates).lat === 'number' &&
    typeof (value as UserLocationCoordinates).lng === 'number' &&
    typeof (value as UserLocationCoordinates).label === 'string' &&
    Number.isFinite((value as UserLocationCoordinates).lat) &&
    Number.isFinite((value as UserLocationCoordinates).lng)
  )
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
