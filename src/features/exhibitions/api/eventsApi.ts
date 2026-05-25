import { API_BASE_URL } from '../../../api/config'
import { clearAuthStorage } from '../../../api/authStorage'
import { createAuthorizationHeaders } from '../../../api/headers'
import { ApiError } from '../../user/api/authApi'

export type EventsSort = 'match' | 'deadline' | 'latest' | 'rating'
export type EventSearchSort = 'distance' | 'deadline' | 'upcoming'
export type EventStatus = 'ongoing' | 'upcoming' | 'ended' | '진행중' | '예정' | '종료'

export type EventSummary = {
  eventId?: string | number
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
  matchScore?: number
  bookmarked?: boolean
  rating?: number
  distanceKm?: number
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

export type EventDetail = EventSummary & {
  hall?: string
  fee?: string
  price?: string
  time?: string
  eventTime?: string
  url?: string
  homepageUrl?: string
  tag?: string[]
  tags?: string[]
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
  title?: string
  category?: string
  district?: string[]
  status?: EventStatus[]
  free?: boolean[]
  sort?: EventSearchSort
  lat?: number
  lng?: number
}

export type EventsResponse = {
  events: EventSummary[]
  totalCount?: number
}

export type EventSearchResponse = {
  events: EventSummary[]
  totalCount?: number
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

async function parseEventsResponse<T>(response: Response): Promise<T> {
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

function createOptionalAuthHeaders() {
  return createAuthorizationHeaders()
}

export async function getEvents(query: EventsQuery = {}) {
  const response = await fetch(`${API_BASE_URL}${EVENTS_API_PATH}${createQueryString(query)}`, {
    method: 'GET',
    headers: createOptionalAuthHeaders(),
  })

  return parseEventsResponse<EventsResponse | EventSummary[]>(response)
}

export async function searchEvents(query: EventSearchQuery = {}) {
  const response = await fetch(`${API_BASE_URL}${EVENTS_API_PATH}/search${createQueryString(query)}`, {
    method: 'GET',
    headers: createOptionalAuthHeaders(),
  })

  return parseEventsResponse<EventSearchResponse | EventSummary[]>(response)
}

export async function getEventDetail(eventId: string | number) {
  const response = await fetch(`${API_BASE_URL}${EVENTS_API_PATH}/${encodeURIComponent(eventId)}`, {
    method: 'GET',
    headers: createOptionalAuthHeaders(),
  })

  return parseEventsResponse<EventDetail>(response)
}

export async function createEventReview(eventId: string | number, request: CreateReviewRequest) {
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

  return parseEventsResponse<CreateReviewResponse>(response)
}
