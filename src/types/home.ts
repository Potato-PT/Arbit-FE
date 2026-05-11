export type ExhibitionArtwork = 'hero' | 'portal' | 'tree' | 'glass' | 'media'

export interface Exhibition {
  id: string
  dday: string
  category: string
  title: string
  period: string
  venue: string
  artwork: ExhibitionArtwork
  liked: boolean
}

export interface HeroExhibition extends Exhibition {
  matchRate: number
  subtitle: string
  homepageUrl: string
}

export type RecommendedExhibition = Exhibition
