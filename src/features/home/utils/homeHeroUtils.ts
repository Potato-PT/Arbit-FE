import type { RecommendedExhibition } from '../../../types/home'

export type HomeHeroSource = 'recommendation' | 'closing' | 'latest' | 'fallback'

type HomeHeroSelection = {
  event: RecommendedExhibition
  source: HomeHeroSource
}

type SelectHomeHeroEventOptions = {
  recommendations?: RecommendedExhibition[]
  closingSoon?: RecommendedExhibition[]
  latest?: RecommendedExhibition[]
  fallback?: RecommendedExhibition[]
}

export function selectHomeHeroEvent({
  recommendations = [],
  closingSoon = [],
  latest = [],
  fallback = [],
}: SelectHomeHeroEventOptions): HomeHeroSelection | null {
  const recommendation = recommendations[0]

  if (recommendation) {
    return {
      event: recommendation,
      source: 'recommendation',
    }
  }

  const closingSoonEvent = closingSoon[0]

  if (closingSoonEvent) {
    return {
      event: closingSoonEvent,
      source: 'closing',
    }
  }

  const latestEvent = latest[0]

  if (latestEvent) {
    return {
      event: latestEvent,
      source: 'latest',
    }
  }

  const fallbackEvent = fallback[0]

  return fallbackEvent
    ? {
      event: fallbackEvent,
      source: 'fallback',
    }
    : null
}

export function getHomeHeroLabel(source: HomeHeroSource) {
  const labels: Record<HomeHeroSource, string> = {
    recommendation: '회원님을 위한 추천',
    closing: '놓치면 아쉬운 전시·공연',
    latest: '새로 올라온 전시·공연',
    fallback: '오늘의 전시·공연',
  }

  return labels[source]
}
