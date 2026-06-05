export type ApiResponse<T> = {
  success: boolean
  data: T
  error: ApiErrorResponse | null
}

export type ApiErrorResponse = {
  code: string
  message: string
}

export type MyProfile = {
  profileImageUrl: string
  nickname: string
  subscribedAt: string
  tasteKeywords: string[]
}

export type MyReview = {
  reviewId: number
  title: string
  posterImageUrl: string
  starScore: number
  content: string
  createdAt: string
}

export type MyBookmark = {
  eventId?: string
  event_id?: string
  title: string
  posterImageUrl: string
  category: string
  venue: string
  startDate: string
  endDate: string
  bookmarkedAt: string
  price?: string | null
}

export type UpdateNicknameRequest = {
  nickname: string
}

export type UpdateNicknameResponse = {
  nickname?: string
}

export type UpdateProfileImageResponse = {
  profileImageUrl?: string
}
