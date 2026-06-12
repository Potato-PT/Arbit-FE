import { API_BASE_URL } from '../../../api/config'
import { clearAuthStorage } from '../../../api/authStorage'
import { createAuthorizationHeaders } from '../../../api/headers'
import { ApiError } from '../../user/api/authApi'

export type EventsSort = 'match' | 'deadline' | 'latest' | 'rating'
export type EventSearchSort = 'deadline' | 'latest' | 'rating' | 'distance'
export type EventStatus = 'ongoing' | 'upcoming' | 'ended' | '진행중' | '예정' | '종료'
export type EventSearchStatus = 'ONGOING' | 'UPCOMING' | 'CLOSED'
export type EventSearchTarget = 'ALL' | 'TITLE' | 'CATEGORY' | 'VENUE' | 'DISTRICT' | 'KEYWORD'

export type EventSummary = {
  eventId?: string
  event_id?: string
  id?: string | number
  title: string
  category: string
  posterImageUrl: string
  venue: string
  district: string
  startDate: string
  endDate: string
  free: boolean
  status: string
  url?: string
  matchScore?: number
  bookmarked?: boolean
  rating?: number
  averageRating?: number
  distanceKm?: number
  distance?: number
  location?: string
}

export type EventReview = {
  reviewId: string | number
  id?: string
  rating?: number
  starScore?: number
  content: string
  author?: string
  nickname?: string
  visitedAt?: string
  createdAt?: string
  public?: boolean
  isPublic?: boolean
}

export type EventReviewListItem = {
  id: string | number
  rating: number
  content: string
  verificationImageUrl: string
  createdAt: string
}

export type EventDetail = EventSummary & {
  hall?: string
  price?: string
  time?: string
  eventTime?: string
  url?: string
  homepageUrl?: string
  keyword?: string[]
  reviews?: EventReview[]
}

export type CreateReviewRequest = {
  rating: number
  content: string
  verificationImageUrl: string
}

export type CreateReviewResponse = EventReview

export type EventsQuery = {
  category?: string
  district?: string[]
  status?: EventStatus[]
  free?: boolean[]
  startDate?: string
  endDate?: string
  sort?: EventsSort
}

export type EventSearchQuery = {
  keyword?: string
  target?: EventSearchTarget
  category?: string
  district?: string[]
  status?: EventSearchStatus[]
  free?: boolean
  sort?: EventSearchSort
  lat?: number
  lng?: number
  page?: number
  size?: number
}

export type EventsResponse = {
  events: EventSummary[]
  totalCount?: number
}

export type EventSearchResponse = {
  keyword?: string
  target?: EventSearchTarget
  page: number
  size: number
  totalElements: number
  totalPages: number
  items: EventSummary[]
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

const EVENTS_API_PATH = '/api/events'
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

async function parseEventsResponse<T>(
  response: Response,
  options: { redirectOnUnauthorized?: boolean } = {},
): Promise<T> {
  const result = (await response.json().catch(() => null)) as ApiResponse<T> | T | null

  if (response.status === 401) {
    if (options.redirectOnUnauthorized) {
      handleUnauthorized()
    }

    throw new ApiError('로그인이 필요합니다.', response.status)
  }

  if (response.status === 404) {
    throw new ApiError('이벤트를 찾을 수 없습니다.', response.status)
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
    'data' in result
  )
}

function appendQueryValue(params: URLSearchParams, key: string, value: string | number | boolean) {
  params.append(key, String(value))
}

function createQueryString(query: Record<string, string | number | boolean | unknown[] | undefined>) {
  const params = new URLSearchParams()

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === '') {
      return
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== '') {
          appendQueryValue(params, key, item as string | number | boolean)
        }
      })
      return
    }

    appendQueryValue(params, key, value)
  })

  const queryString = params.toString()

  return queryString ? `?${queryString}` : ''
}

export async function getEvents(query: EventsQuery = {}) {
  const response = await fetch(`${API_BASE_URL}${EVENTS_API_PATH}${createQueryString(query)}`, {
    method: 'GET',
  })

  const result = await parseEventsResponse<EventsResponse | EventSummary[]>(response)

  if (Array.isArray(result) || Array.isArray(result.events)) {
    return result
  }

  throw new ApiError('전시 목록 응답 형식이 올바르지 않습니다.', response.status)
}

export async function searchEvents(query: EventSearchQuery = {}) {
  const response = await fetch(
    `${API_BASE_URL}${EVENTS_API_PATH}/search${createQueryString(query)}`,
    {
      method: 'GET',
    },
  )

  const result = await parseEventsResponse<EventSearchResponse>(response)

  if (Array.isArray(result.items)) {
    return result.items
  }

  throw new ApiError('검색 결과 응답 형식이 올바르지 않습니다.', response.status)
}

export async function getEventDetail(eventId: string) {
  const response = await fetch(`${API_BASE_URL}${EVENTS_API_PATH}/${encodeURIComponent(eventId)}`, {
    method: 'GET',
  })

  return parseEventsResponse<EventDetail>(response)
}

export async function recordHomepageClick(eventId: string) {
  const response = await fetch(
    `${API_BASE_URL}${EVENTS_API_PATH}/${encodeURIComponent(eventId)}/actions/homepage-click`,
    {
      method: 'POST',
      headers: createAuthorizationHeaders(),
    },
  )

  return parseEventsResponse<null>(response)
}

export async function createEventReview(eventId: string, request: CreateReviewRequest) {
  const response = await fetch(
    `${API_BASE_URL}${EVENTS_API_PATH}/${encodeURIComponent(eventId)}/reviews`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...createAuthorizationHeaders(),
      },
      body: JSON.stringify(request),
    },
  )

  if (response.status === 400) {
    throw new ApiError('평점 또는 리뷰 내용을 확인해주세요.', response.status)
  }

  if (response.status === 409) {
    throw new ApiError('이미 이 이벤트에 리뷰를 작성했습니다.', response.status)
  }

  return parseEventsResponse<CreateReviewResponse>(response, { redirectOnUnauthorized: true })
}

export async function deleteEventReview(eventId: string, reviewId: string | number) {
  const response = await fetch(
    `${API_BASE_URL}${EVENTS_API_PATH}/${encodeURIComponent(eventId)}/reviews/${encodeURIComponent(String(reviewId))}`,
    {
      method: 'DELETE',
      headers: createAuthorizationHeaders(),
    },
  )

  if (response.status === 401) {
    handleUnauthorized()
    throw new ApiError('로그인이 필요합니다.', response.status)
  }

  if (response.status === 403) {
    throw new ApiError('삭제 권한이 없습니다.', response.status)
  }

  if (response.status === 404) {
    throw new ApiError('리뷰를 찾을 수 없습니다.', response.status)
  }

  if (!response.ok) {
    const result = (await response.json().catch(() => null)) as ApiFailureResponse | null
    const message = isApiResponse(result) ? getApiErrorMessage(result.error) : '리뷰를 삭제하지 못했습니다.'

    throw new ApiError(message, response.status)
  }
}

export async function getEventReviews(eventId: string) {
  const response = await fetch(
    `${API_BASE_URL}${EVENTS_API_PATH}/${encodeURIComponent(eventId)}/reviews`,
    {
      method: 'GET',
    },
  )

  return parseEventsResponse<EventReviewListItem[]>(response)
}
