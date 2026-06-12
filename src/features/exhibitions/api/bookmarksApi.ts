import { clearAuthStorage } from '../../../api/authStorage'
import { API_BASE_URL } from '../../../api/config'
import { createAuthorizationHeaders } from '../../../api/headers'
import { ApiError } from '../../user/api/authApi'

export type BookmarkEventId = string

export type BookmarkMutationResponse = null

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

const BOOKMARKS_API_PATH = '/api/bookmarks'
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

function isApiResponse<T>(result: ApiResponse<T> | T): result is ApiResponse<T> {
  return (
    typeof result === 'object' &&
    result !== null &&
    'success' in result &&
    'data' in result &&
    'error' in result
  )
}

async function parseBookmarkResponse<T>(response: Response): Promise<T | undefined> {
  const result = (await response.json().catch(() => null)) as ApiResponse<T> | T | null

  if (response.status === 401) {
    handleUnauthorized()
    throw new ApiError('로그인이 필요합니다.', response.status)
  }

  if (response.status === 404) {
    throw new ApiError('이벤트 또는 북마크를 찾을 수 없습니다.', response.status)
  }

  if (response.status === 409) {
    throw new ApiError('이미 북마크된 이벤트입니다.', response.status)
  }

  if (response.status === 204) {
    return undefined
  }

  if (!result) {
    if (response.ok) {
      return undefined
    }

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

async function requestBookmark(eventId: BookmarkEventId, method: 'POST' | 'DELETE') {
  const response = await fetch(
    `${API_BASE_URL}${BOOKMARKS_API_PATH}/${encodeURIComponent(eventId)}`,
    {
      method,
      headers: createAuthorizationHeaders(),
    },
  )

  await parseBookmarkResponse<BookmarkMutationResponse>(response)
}

export function addBookmark(eventId: BookmarkEventId) {
  return requestBookmark(eventId, 'POST')
}

export function removeBookmark(eventId: BookmarkEventId) {
  return requestBookmark(eventId, 'DELETE')
}
