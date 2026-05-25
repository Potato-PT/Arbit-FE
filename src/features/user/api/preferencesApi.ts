import { API_BASE_URL } from '../../../api/config'
import { clearAuthStorage } from '../../../api/authStorage'
import { createAuthorizationHeaders, createJsonHeaders } from '../../../api/headers'
import { ApiError } from './authApi'

export type PreferenceCategory = {
  id: string
  label: string
  icon?: string
  details?: PreferenceDetailOption[]
}

export type PreferenceDetailOption = {
  id: string
  label: string
}

export type PreferenceCategoriesResponse = {
  categories: PreferenceCategory[]
}

export type SavePreferencesRequest = {
  keyword1: string
  keyword2: string
  keyword3: string
  keyword4: string
}

export type SavePreferencesResponse = {
  keyword1: string
  keyword2: string
  keyword3: string
  keyword4: string
}

type ApiSuccessResponse<T> = {
  success: true
  data: T
  error: null
}

type ApiFailureResponse = {
  success: false
  data: null
  error: string | { message?: string }
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

function getApiErrorMessage(error: ApiFailureResponse['error'] | null) {
  if (!error) {
    return '요청 처리 중 오류가 발생했습니다.'
  }

  return typeof error === 'string' ? error : error.message ?? '요청 처리 중 오류가 발생했습니다.'
}

async function parsePreferencesResponse<T>(response: Response): Promise<T> {
  const result = (await response.json().catch(() => null)) as ApiResponse<T> | T | null

  if (response.status === 401) {
    handleUnauthorized()
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

function isApiResponse<T>(result: ApiResponse<T> | T): result is ApiResponse<T> {
  return (
    typeof result === 'object' &&
    result !== null &&
    'success' in result &&
    'data' in result &&
    'error' in result
  )
}

export async function getPreferenceCategories() {
  const response = await fetch(`${API_BASE_URL}${PREFERENCES_API_PATH}/categories`, {
    method: 'GET',
    headers: createAuthorizationHeaders(),
  })

  return parsePreferencesResponse<PreferenceCategoriesResponse | PreferenceCategory[]>(response)
}

export async function savePreferences(request: SavePreferencesRequest) {
  const response = await fetch(`${API_BASE_URL}${PREFERENCES_API_PATH}`, {
    method: 'POST',
    headers: createJsonHeaders(),
    body: JSON.stringify(request),
  })

  return parsePreferencesResponse<SavePreferencesResponse>(response)
}
