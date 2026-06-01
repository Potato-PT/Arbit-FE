import { API_BASE_URL } from '../../../api/config'
import { clearAuthStorage, isJwtLike } from '../../../api/authStorage'
import { createJsonHeaders, getAccessTokenForApi } from '../../../api/headers'
import { ApiError } from './authApi'

export type PreferenceSeedEvent = {
  event_id: string
  title: string
  genre: string
  posterImage: string
}

export type PreferencesResponse = PreferenceSeedEvent[]
type PreferencesDataResponse = {
  data: PreferencesResponse
}

export type SavePreferencesRequest = string[]
type SavePreferencesApiPayload = {
  success: true
  data: SavePreferencesRequest
  error: null
}
type SavePreferencesResponse = SavePreferencesRequest

type ApiSuccessResponse<T> = {
  success: true
  data: T
  error?: null
}

type ApiFailureResponse = {
  success: false
  data?: null
  error: string | { code?: string; message?: string }
}

type ApiResponse<T> = ApiSuccessResponse<T> | ApiFailureResponse

const PREFERENCES_API_PATH = '/api/preferences'
const LOGIN_PATH = '/user/login'

function handleUnauthorized() {
  clearAuthStorage()

  if (typeof window !== 'undefined') {
    window.location.href = LOGIN_PATH
  }
}

function getApiErrorMessage(error: ApiFailureResponse['error'] | null | undefined) {
  if (!error) {
    return '요청 처리 중 오류가 발생했습니다.'
  }

  return typeof error === 'string' ? error : error.message ?? '요청 처리 중 오류가 발생했습니다.'
}

async function parsePreferencesResponse<T>(
  response: Response,
  options: { redirectOnUnauthorized?: boolean } = {},
): Promise<T> {
  const result = (await response.json().catch(() => null)) as ApiResponse<T> | T | null

  if (response.status === 401 || isUnauthorizedResponse(result)) {
    if (options.redirectOnUnauthorized) {
      handleUnauthorized()
    }

    throw new ApiError('로그인이 필요합니다.', response.status)
  }

  if (!result) {
    throw new ApiError('요청 처리 중 오류가 발생했습니다.', response.status)
  }

  if (isApiResponse(result)) {
    if (!response.ok || !result.success) {
      throw new ApiError(getApiErrorMessage(result.error), response.status)
    }

    return result.data
  }

  if (!response.ok) {
    throw new ApiError('요청 처리 중 오류가 발생했습니다.', response.status)
  }

  return result
}

function isApiResponse<T>(result: unknown): result is ApiResponse<T> {
  return (
    typeof result === 'object' &&
    result !== null &&
    'success' in result &&
    'data' in result
  )
}

function isUnauthorizedResponse<T>(result: ApiResponse<T> | T | null) {
  return (
    isApiResponse(result) &&
    !result.success &&
    typeof result.error === 'object' &&
    result.error?.code === 'UNAUTHORIZED'
  )
}

export async function getPreferenceCategories() {
  const response = await fetch(`${API_BASE_URL}${PREFERENCES_API_PATH}/categories`, {
    method: 'GET',
  })

  const result = await parsePreferencesResponse<PreferencesResponse | PreferencesDataResponse>(response)
  const seedEvents = Array.isArray(result) ? result : result.data

  if (!Array.isArray(seedEvents)) {
    throw new ApiError('취향 선택 이벤트 응답 형식이 올바르지 않습니다.', response.status)
  }

  return normalizePreferenceSeedEvents(seedEvents)
}

function normalizePreferenceSeedEvents(seedEvents: unknown[]): PreferenceSeedEvent[] {
  return seedEvents.flatMap((seedEvent) => {
    if (
      typeof seedEvent !== 'object' ||
      seedEvent === null ||
      !('event_id' in seedEvent) ||
      typeof seedEvent.event_id !== 'string' ||
      !seedEvent.event_id.trim()
    ) {
      return []
    }

    const fields = seedEvent as Record<string, unknown>

    return [{
      event_id: seedEvent.event_id,
      title: getStringField(fields, 'title', '제목 없는 이벤트'),
      genre: getStringField(fields, 'genre', '장르 미정'),
      posterImage: getStringField(fields, 'posterImageUrl') || getStringField(fields, 'posterImage'),
    }]
  })
}

function getStringField(
  value: Record<string, unknown>,
  key: 'title' | 'genre' | 'posterImage' | 'posterImageUrl',
  fallback = '',
) {
  return key in value && typeof value[key] === 'string' ? value[key] : fallback
}

export async function savePreferences(selectedEventIds: SavePreferencesRequest) {
  const accessToken = getAccessTokenForApi().trim()

  if (!accessToken || !isJwtLike(accessToken)) {
    handleUnauthorized()
    throw new ApiError('로그인이 필요합니다.', 401)
  }

  const request: SavePreferencesApiPayload = {
    success: true,
    data: selectedEventIds,
    error: null,
  }
  const response = await fetch(`${API_BASE_URL}${PREFERENCES_API_PATH}`, {
    method: 'POST',
    headers: createJsonHeaders(),
    body: JSON.stringify(request),
  })
  const result = await parsePreferencesResponse<SavePreferencesResponse>(response, {
    redirectOnUnauthorized: true,
  })

  if (!Array.isArray(result) || !result.every(isValidEventId)) {
    throw new ApiError('취향 저장 응답 형식이 올바르지 않습니다.', response.status)
  }

  return result
}

function isValidEventId(eventId: unknown): eventId is string {
  return typeof eventId === 'string' && Boolean(eventId.trim())
}
