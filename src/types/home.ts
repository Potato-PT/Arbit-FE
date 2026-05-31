export type ExhibitionArtwork = 'hero' | 'portal' | 'tree' | 'glass' | 'media'

export interface Exhibition {
  id: string
  eventId?: string
  dday: string
  category: string
  title: string
  period: string
  venue?: string
  artwork: ExhibitionArtwork
  liked: boolean
  posterImageUrl?: string
  startDate?: string
  endDate?: string
  free?: boolean
  status?: string
  matchScore?: number
  bookmarked?: boolean
  matchRate?: number
  subtitle?: string
  homepageUrl?: string
  url?: string
}

export interface HeroExhibition extends Exhibition {
  matchRate: number
  subtitle: string
  homepageUrl: string
}

export type RecommendedExhibition = Exhibition

export type RecommendationApiItem = {
  title: string
  category: string
  posterImageUrl: string | null
  venue: string | null
  district: string
  startDate: string
  endDate: string
  free: boolean
  status: string
  matchScore: number
  bookmarked: boolean
}

export type HomePayload = {
  heroExhibition?: HeroExhibition
  hero?: HeroExhibition
  recommendedExhibitions?: RecommendedExhibition[]
  recommendations?: RecommendedExhibition[]
  events?: RecommendedExhibition[]
}

export type HomeResponse = HomePayload | RecommendedExhibition[]
