import { API_BASE_URL } from '../../../api/config'
import { clearAuthStorage } from '../../../api/authStorage'
import { createJsonHeaders, createUploadHeaders } from '../../../api/headers'
import { ApiError } from './authApi'
import type {
  ApiResponse,
  MyBookmark,
  MyProfile,
  MyReview,
  UpdateNicknameResponse,
  UpdateProfileImageResponse,
  UpdateNicknameRequest,
} from '../types/myPageApi'

const MY_PAGE_API_PATH = '/api/users/me'
const LOGIN_PATH = '/user/login'

function handleUnauthorized() {
  clearAuthStorage()

  if (typeof window !== 'undefined') {
    window.location.href = LOGIN_PATH
  }
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const result = (await response.json().catch(() => null)) as ApiResponse<T> | null

  if (response.status === 401) {
    handleUnauthorized()
    throw new ApiError(result?.error?.message ?? '로그인이 필요합니다.', response.status)
  }

  if (!result) {
    throw new ApiError('요청 처리 중 오류가 발생했습니다.', response.status)
  }

  if (!response.ok || !result.success) {
    throw new ApiError(result.error?.message ?? '요청 처리 중 오류가 발생했습니다.', response.status)
  }

  return result.data
}

async function requestMyPage<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init)

  return parseApiResponse<T>(response)
}

export function getMyProfile() {
  return requestMyPage<MyProfile>(MY_PAGE_API_PATH, {
    method: 'GET',
    headers: createJsonHeaders(),
  })
}

export function updateNickname(nickname: string) {
  const body: UpdateNicknameRequest = { nickname }

  return requestMyPage<UpdateNicknameResponse>(`${MY_PAGE_API_PATH}/nickname`, {
    method: 'PUT',
    headers: createJsonHeaders(),
    body: JSON.stringify(body),
  })
}

export function updateProfileImage(file: File) {
  const formData = new FormData()
  formData.append('profileImage', file)

  return requestMyPage<UpdateProfileImageResponse>(`${MY_PAGE_API_PATH}/profile_image`, {
    method: 'PUT',
    headers: createUploadHeaders(),
    body: formData,
  })
}

export function getMyReviews() {
  return requestMyPage<MyReview[]>(`${MY_PAGE_API_PATH}/reviews`, {
    method: 'GET',
    headers: createJsonHeaders(),
  })
}

export async function deleteMyReview(reviewId: string | number) {
  const response = await fetch(
    `${API_BASE_URL}${MY_PAGE_API_PATH}/reviews/${encodeURIComponent(String(reviewId))}`,
    {
      method: 'DELETE',
      headers: createJsonHeaders(),
    },
  )

  if (response.status === 401) {
    handleUnauthorized()
    throw new ApiError('로그인이 필요합니다.', response.status)
  }

  if (response.status === 404) {
    throw new ApiError('리뷰를 찾을 수 없습니다.', response.status)
  }

  if (response.status === 204) {
    return
  }

  if (!response.ok) {
    const result = (await response.json().catch(() => null)) as ApiResponse<unknown> | null

    throw new ApiError(
      result?.error?.message ?? '리뷰를 삭제하지 못했습니다.',
      response.status,
    )
  }
}

export function getMyBookmarks() {
  return requestMyPage<MyBookmark[]>(`${MY_PAGE_API_PATH}/bookmarks`, {
    method: 'GET',
    headers: createJsonHeaders(),
  })
}
