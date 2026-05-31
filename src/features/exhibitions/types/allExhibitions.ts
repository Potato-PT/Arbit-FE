export type AllExhibitionPriceType = '무료' | '유료'

export type AllExhibitionPosterIcon =
  | 'filter'
  | 'waves'
  | 'music'
  | 'palette'
  | 'mind'
  | 'dance'
  | 'arch'
  | 'theater'
  | 'image'
  | 'brush'

export interface AllExhibition {
  id: string
  eventId?: string
  title: string
  category: string
  venue: string
  location: string
  district: string
  period: string
  startDate: string
  endDate: string
  priceType: AllExhibitionPriceType
  distanceKm: number
  icon: AllExhibitionPosterIcon
}
