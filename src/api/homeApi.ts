import { API_BASE_URL } from './config'
import { createAuthorizationHeaders } from './headers'
import { ApiError } from '../features/user/api/authApi'
import type { HomeResponse } from '../types/home'

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

const HOME_API_PATH = '/api/home'

function getApiErrorMessage(error: ApiFailureResponse['error'] | null) {
  if (!error) {
    return '요청 처리 중 오류가 발생했습니다.'
  }

  return typeof error === 'string' ? error : error.message ?? '요청 처리 중 오류가 발생했습니다.'
}

async function parseHomeResponse<T>(response: Response): Promise<T> {
  const result = (await response.json().catch(() => null)) as ApiResponse<T> | T | null

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

export async function getHome() {
  const response = await fetch(`${API_BASE_URL}${HOME_API_PATH}`, {
    method: 'GET',
  })

  return parseHomeResponse<HomeResponse>(response)
}

export async function getHomeRecommendations() {
  const response = await fetch(`${API_BASE_URL}${HOME_API_PATH}/recommendations`, {
    method: 'GET',
    headers: createAuthorizationHeaders(),
  })

  if (response.status === 401) {
    return getHome()
  }

  return parseHomeResponse<HomeResponse>(response)
}
