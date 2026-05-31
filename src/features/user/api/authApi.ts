import { API_BASE_URL } from '../../../api/config'
import { createAuthorizationHeaders } from '../../../api/headers'

export type Gender = 'MALE' | 'FEMALE'

export type SignupRequest = {
  username: string
  password: string
  nickname: string
  birthYear: number
  gender: Gender
  residentialArea: string
}

export type LoginRequest = {
  username: string
  password: string
}

export type AuthTokenResponse = {
  accessToken: string
  refreshToken: string
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

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiFailureResponse

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const AUTH_API_PATH = '/api/auth'

async function postAuth<TRequest extends object, TResponse>(
  path: string,
  body: TRequest,
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const result = (await response.json().catch(() => null)) as ApiResponse<TResponse> | null

  if (!result) {
    throw new ApiError('요청 처리 중 오류가 발생했습니다.', response.status)
  }

  if (!response.ok || !result.success) {
    const message =
      typeof result?.error === 'string'
        ? result.error
        : result.error?.message ?? '요청 처리 중 오류가 발생했습니다.'

    throw new ApiError(message, response.status)
  }

  return result.data
}

export function signup(request: SignupRequest) {
  return postAuth<SignupRequest, AuthTokenResponse>(`${AUTH_API_PATH}/signup`, request)
}

export function login(request: LoginRequest) {
  return postAuth<LoginRequest, AuthTokenResponse>(`${AUTH_API_PATH}/login`, request)
}

export async function logout() {
  const response = await fetch(`${API_BASE_URL}${AUTH_API_PATH}/logout`, {
    method: 'POST',
    headers: createAuthorizationHeaders(),
  })

  const result = (await response.json().catch(() => null)) as ApiResponse<unknown> | null

  if (!response.ok || (result && !result.success)) {
    const message =
      typeof result?.error === 'string'
        ? result.error
        : result?.error?.message ?? '로그아웃 중 오류가 발생했습니다.'

    throw new ApiError(message, response.status)
  }
}
