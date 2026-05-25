import { API_BASE_URL } from '../../../api/config'
import { clearAuthStorage } from '../../../api/authStorage'
import { createJsonHeaders, createUploadHeaders } from '../../../api/headers'
import { ApiError } from './authApi'
import type {
  ApiResponse,
  DeleteMyAccountResponse,
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

async function parseOptionalApiResponse<T>(response: Response): Promise<T | undefined> {
  if (response.status === 401) {
    handleUnauthorized()
    throw new ApiError('로그인이 필요합니다.', response.status)
  }

  if (response.status === 204) {
    return undefined
  }

  return parseApiResponse<T>(response)
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

export function getMyBookmarks() {
  return requestMyPage<MyBookmark[]>(`${MY_PAGE_API_PATH}/bookmarks`, {
    method: 'GET',
    headers: createJsonHeaders(),
  })
}

export async function deleteMyAccount() {
  const response = await fetch(`${API_BASE_URL}${MY_PAGE_API_PATH}`, {
    method: 'DELETE',
    headers: createJsonHeaders(),
  })

  return parseOptionalApiResponse<DeleteMyAccountResponse>(response)
}
