export interface ExhibitionReview {
  id: string
  rating: number
  content: string
  author: string
  visitedAt: string
  tone: 'warm' | 'soft' | 'blush'
  isPublic: boolean
}

export interface ExhibitionReviewInput {
  rating: number
  content: string
  visitedAt: string
  isPublic: boolean
}

export interface ExhibitionDetail {
  id: string
  status: '현재 전시 중' | '전시 예정'
  rating: number
  title: string
  period: string
  venue: string
  hall: string
  price: string
  eventTime: string
  category: string
  location: string
  tags: string[]
  homepageUrl: string
  artwork: 'sculpture' | 'gallery' | 'light' | 'painting'
  reviews: ExhibitionReview[]
}
