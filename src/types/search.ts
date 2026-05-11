export type SearchArtwork =
  | 'pastel'
  | 'soft-shape'
  | 'light-bunker'
  | 'flame'
  | 'rose'
  | 'busan-sea'

export interface SearchExhibition {
  id: string
  badge?: string
  category: string
  location: string
  district: string
  periodStatus: '진행중' | '예정'
  priceType: '무료' | '유료'
  distanceKm: number
  title: string
  venue: string
  price: string
  artwork: SearchArtwork
  liked: boolean
}
