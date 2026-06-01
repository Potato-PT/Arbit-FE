import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import '../../../styles/Home.css'
import AppHeader from '../../../components/AppHeader'
import AppFooter from '../../../components/AppFooter'
import { getHome, getHomeRecommendations } from '../../../api/homeApi'
import { readAccessToken, readRecommendationEventIds } from '../../../api/authStorage'
import { hasValidAccessTokenForApi } from '../../../api/headers'
import { ApiError } from '../../user/api/authApi'
import { addBookmark, removeBookmark } from '../../exhibitions/api/bookmarksApi'
import HomeEventSection from '../components/HomeEventSection'
import { getDateTimestamp, getDaysUntilEnd } from '../utils/homeDateUtils'
import type {
  ExhibitionArtwork,
  HeroExhibition,
  HomeResponse,
  RecommendationApiItem,
  RecommendedExhibition,
} from '../../../types/home'

const missingPreferencesMessage = '회원가입 시 저장된 취향 추천 정보가 없습니다.'

function LoggedInHome() {
  const location = useLocation()
  const initialRecommendations = getInitialRecommendations(location.state)
  const initialRecommendationMessage = getInitialRecommendationMessage(location.state)
  const [homeData, setHomeData] = useState<HomeResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [recommendationMessage, setRecommendationMessage] = useState('')
  const [pendingBookmarkIds, setPendingBookmarkIds] = useState<Set<string>>(() => new Set())
  const normalizedHome = useMemo(() => normalizeHomeData(homeData), [homeData])
  const currentHeroExhibition = normalizedHome.heroExhibition
  const currentRecommendedExhibitions = normalizedHome.recommendedExhibitions
  const closingSoonExhibitions = useMemo(
    () =>
      [...normalizedHome.baseExhibitions]
        .filter((item) => {
          const daysUntilEnd = getDaysUntilEnd(item.endDate)

          return Number.isFinite(daysUntilEnd) && daysUntilEnd >= 0
        })
        .sort((a, b) => getDaysUntilEnd(a.endDate) - getDaysUntilEnd(b.endDate))
        .slice(0, 10),
    [normalizedHome.baseExhibitions],
  )
  const newExhibitions = useMemo(
    () =>
      [...normalizedHome.baseExhibitions]
        .sort((a, b) => getDateTimestamp(b.startDate) - getDateTimestamp(a.startDate))
        .slice(0, 10),
    [normalizedHome.baseExhibitions],
  )

  useEffect(() => {
    let ignore = false

    async function loadHome() {
      setIsLoading(true)
      setErrorMessage('')
      setRecommendationMessage('')

      try {
        const home = await getHome()
        let nextHomeData: HomeResponse = initialRecommendations
          ? mergeHomeRecommendations(home, initialRecommendations)
          : home
        let nextRecommendationMessage = initialRecommendationMessage

        if (
          hasValidAccessTokenForApi() &&
          !initialRecommendations &&
          !initialRecommendationMessage
        ) {
          const eventIds = readRecommendationEventIds()

          if (eventIds.length === 0) {
            nextRecommendationMessage = missingPreferencesMessage
          } else {
            try {
              nextHomeData = mergeHomeRecommendations(
                home,
                await getHomeRecommendations(eventIds),
              )
            } catch (error) {
              if (error instanceof ApiError && error.status === 400) {
                nextRecommendationMessage = missingPreferencesMessage
              } else if (error instanceof ApiError && error.status === 401) {
                nextRecommendationMessage = '로그인이 만료되었습니다. 다시 로그인하면 맞춤 추천을 확인할 수 있습니다.'
              } else {
                throw error
              }
            }
          }
        }

        if (!ignore) {
          setHomeData(nextHomeData)
          setRecommendationMessage(nextRecommendationMessage)
        }
      } catch {
        if (!ignore) {
          setErrorMessage('홈 이벤트를 불러오지 못했습니다.')
          setHomeData(null)
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadHome()

    return () => {
      ignore = true
    }
  }, [initialRecommendationMessage, initialRecommendations])

  const handleBrandClick = async () => {
    if (!hasValidAccessTokenForApi()) {
      setRecommendationMessage('로그인 후 취향에 맞춘 추천 이벤트를 확인할 수 있습니다.')
      return
    }

    const eventIds = readRecommendationEventIds()

    if (eventIds.length === 0) {
      setRecommendationMessage(missingPreferencesMessage)
      return
    }

    setIsLoading(true)
    setErrorMessage('')
    setRecommendationMessage('')

    try {
      const recommendations = await getHomeRecommendations(eventIds)

      setHomeData((current) =>
        current ? mergeHomeRecommendations(current, recommendations) : current,
      )
    } catch (error) {
      console.error('Failed to load home recommendations from the brand logo.', error)

      if (error instanceof ApiError && error.status === 401) {
        setRecommendationMessage('로그인이 만료되었습니다. 다시 로그인하면 맞춤 추천을 확인할 수 있습니다.')
        return
      }

      if (error instanceof ApiError && error.status === 400) {
        setRecommendationMessage(missingPreferencesMessage)
        return
      }

      setErrorMessage(
        error instanceof ApiError
          ? `추천 이벤트를 불러오지 못했습니다. (${error.status}: ${error.message})`
          : '추천 이벤트를 불러오지 못했습니다. 브라우저 콘솔을 확인해 주세요.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookmarkToggle = async (item: RecommendedExhibition, isBookmarked: boolean) => {
    const eventId = item.eventId

    if (!eventId) {
      window.alert('이벤트 정보를 찾을 수 없습니다.')
      return
    }

    if (!readAccessToken()) {
      window.alert('로그인이 필요합니다.')
      return
    }

    setPendingBookmarkIds((current) => new Set(current).add(eventId))

    try {
      if (isBookmarked) {
        await removeBookmark(eventId)
      } else {
        await addBookmark(eventId)
      }

      setHomeData((current) => updateHomeBookmark(current, eventId, !isBookmarked))
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setHomeData((current) => updateHomeBookmark(current, eventId, true))
        return
      }

      if (error instanceof ApiError && error.status === 404) {
        window.alert('이벤트 정보를 찾을 수 없습니다.')
        return
      }

      if (error instanceof ApiError && error.status === 401) {
        window.alert('로그인이 필요합니다.')
        return
      }

      window.alert('북마크 처리 중 오류가 발생했습니다.')
    } finally {
      setPendingBookmarkIds((current) => {
        const next = new Set(current)
        next.delete(eventId)
        return next
      })
    }
  }

  return (
    <main className="home-page" aria-label="Arbit home">
      <AppHeader
        variant="home"
        onBrandClick={() => void handleBrandClick()}
      />

      {currentHeroExhibition && (
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-scene" aria-hidden="true">
            {currentHeroExhibition.posterImageUrl && (
              <img
                className="hero-artwork"
                src={currentHeroExhibition.posterImageUrl}
                alt=""
              />
            )}
          </div>
          <div className="hero-shade" />
          <div className="hero-copy">
            <div className="hero-badges">
              {currentHeroExhibition.matchRate > 0 && (
                <span className="hero-badge is-match">{currentHeroExhibition.matchRate}% 일치</span>
              )}
              {currentHeroExhibition.status && <span className="hero-badge">{currentHeroExhibition.status}</span>}
            </div>
            <h1 className={getHeroTitleClassName(currentHeroExhibition.title)} id="hero-title">
              {currentHeroExhibition.title}
            </h1>
            {(currentHeroExhibition.period || currentHeroExhibition.venue) && (
              <p className="hero-meta">
                {currentHeroExhibition.venue}
                {currentHeroExhibition.period && currentHeroExhibition.venue && <i />}
                {currentHeroExhibition.period}
              </p>
            )}
            <div className="hero-buttons">
              {currentHeroExhibition.eventId ? (
                <Link to={`/exhibitions/${currentHeroExhibition.eventId}`} className="primary-link">
                  자세히 보기
                  <span aria-hidden="true">→</span>
                </Link>
              ) : (
                <span className="primary-link is-disabled" aria-disabled="true">
                  자세히 보기
                </span>
              )}
              {currentHeroExhibition.homepageUrl && currentHeroExhibition.homepageUrl !== '#' && (
                <a href={currentHeroExhibition.homepageUrl} className="ghost-link">
                  홈페이지
                  <span aria-hidden="true">→</span>
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      <div className="home-content">
        {!isLoading && recommendationMessage && (
          <div className="home-notice" role="status">
            <span>{recommendationMessage}</span>
            {recommendationMessage.includes('로그인') && <Link to="/user/login">로그인하기</Link>}
          </div>
        )}

        {isLoading && (
          <div className="home-state" role="status">
            홈 이벤트를 불러오는 중입니다.
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="home-state is-error" role="alert">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && currentRecommendedExhibitions.length === 0 && (
          <div className="home-state">표시할 추천 이벤트가 없습니다.</div>
        )}

        {!isLoading && !errorMessage && currentRecommendedExhibitions.length > 0 && (
          <HomeEventSection
            eyebrow="Personalised"
            id="recommend-title"
            items={currentRecommendedExhibitions}
            pendingBookmarkIds={pendingBookmarkIds}
            title="회원님을 위한 추천"
            variant="match"
            onBookmarkToggle={handleBookmarkToggle}
          />
        )}

        {!isLoading && !errorMessage && closingSoonExhibitions.length > 0 && (
          <HomeEventSection
            eyebrow="Closing Soon"
            id="closing-title"
            items={closingSoonExhibitions}
            pendingBookmarkIds={pendingBookmarkIds}
            title="지금 놓치면 아쉬운 행사"
            variant="closing"
            onBookmarkToggle={handleBookmarkToggle}
          />
        )}

        {!isLoading && !errorMessage && newExhibitions.length > 0 && (
          <HomeEventSection
            eyebrow="Just Added"
            id="new-title"
            items={newExhibitions}
            pendingBookmarkIds={pendingBookmarkIds}
            title="새로 올라온 행사"
            variant="new"
            onBookmarkToggle={handleBookmarkToggle}
          />
        )}
      </div>

      <AppFooter />
    </main>
  )
}

function getInitialRecommendations(state: unknown) {
  if (
    typeof state !== 'object' ||
    state === null ||
    !('recommendations' in state) ||
    !Array.isArray(state.recommendations)
  ) {
    return undefined
  }

  return state.recommendations as RecommendationApiItem[]
}

function getInitialRecommendationMessage(state: unknown) {
  if (
    typeof state !== 'object' ||
    state === null ||
    !('recommendationMessage' in state) ||
    typeof state.recommendationMessage !== 'string'
  ) {
    return ''
  }

  return state.recommendationMessage
}

function updateHomeBookmark(data: HomeResponse | null, eventId: string, bookmarked: boolean): HomeResponse | null {
  if (!data) {
    return data
  }

  if (Array.isArray(data)) {
    return data.map((item) => updateRecommendedBookmark(item, eventId, bookmarked))
  }

  return {
    ...data,
    heroExhibition: data.heroExhibition
      ? updateRecommendedBookmark(data.heroExhibition, eventId, bookmarked)
      : data.heroExhibition,
    hero: data.hero ? updateRecommendedBookmark(data.hero, eventId, bookmarked) : data.hero,
    recommendedExhibitions: data.recommendedExhibitions?.map((item) =>
      updateRecommendedBookmark(item, eventId, bookmarked),
    ),
    recommendations: data.recommendations?.map((item) =>
      updateRecommendedBookmark(item, eventId, bookmarked),
    ),
    events: data.events?.map((item) => updateRecommendedBookmark(item, eventId, bookmarked)),
  }
}

function mergeHomeRecommendations(home: HomeResponse, recommendations: RecommendationApiItem[]): HomeResponse {
  return {
    ...(Array.isArray(home) ? { events: home } : home),
    recommendedExhibitions: recommendations.map(toRecommendedExhibition),
  }
}

function toRecommendedExhibition(item: RecommendationApiItem): RecommendedExhibition {
  return {
    ...item,
    id: '',
    dday: item.status,
    period: formatPeriod(item.startDate, item.endDate),
    venue: item.venue ?? undefined,
    artwork: 'portal',
    liked: item.bookmarked,
    posterImageUrl: item.posterImageUrl ?? undefined,
  }
}

function updateRecommendedBookmark<T extends RecommendedExhibition>(
  item: T,
  eventId: string,
  bookmarked: boolean,
): T {
  return item.eventId === eventId ? { ...item, bookmarked, liked: bookmarked } : item
}

function normalizeHomeData(data: HomeResponse | null) {
  if (Array.isArray(data)) {
    return {
      heroExhibition: null,
      baseExhibitions: data.map((item, index) =>
        normalizeRecommendedExhibition(item, index),
      ),
      recommendedExhibitions: data.map((item, index) =>
        normalizeRecommendedExhibition(item, index),
      ),
    }
  }

  const events = data?.events ?? []
  const recommendationEvents = data?.recommendedExhibitions ?? data?.recommendations
  const recommendations = recommendationEvents ?? events
  const hero =
    getHighestMatchScoreExhibition(recommendationEvents) ??
    data?.heroExhibition ??
    data?.hero ??
    events[0] ??
    null

  return {
    heroExhibition: hero ? normalizeHeroExhibition(hero) : null,
    baseExhibitions: events.map((item, index) =>
      normalizeRecommendedExhibition(item, index),
    ),
    recommendedExhibitions: recommendations.map((item, index) =>
      normalizeRecommendedExhibition(item, index, Boolean(recommendationEvents)),
    ),
  }
}

function getHighestMatchScoreExhibition(exhibitions?: RecommendedExhibition[]) {
  return exhibitions?.reduce<RecommendedExhibition | null>((highest, item) => {
    if (typeof item.matchScore !== 'number' || !Number.isFinite(item.matchScore)) {
      return highest
    }

    return !highest || item.matchScore > (highest.matchScore ?? -Infinity) ? item : highest
  }, null)
}

function getHeroTitleClassName(title: string) {
  const titleLength = title.replace(/\s/g, '').length

  if (titleLength > 38) {
    return 'is-very-long-title'
  }

  return titleLength > 24 ? 'is-long-title' : undefined
}

function normalizeHeroExhibition(item: RecommendedExhibition): HeroExhibition {
  const normalizedItem = normalizeRecommendedExhibition(item)
  const matchRate = item.matchScore ?? item.matchRate ?? 0

  return {
    ...normalizedItem,
    matchRate,
    subtitle: item.subtitle ?? item.category ?? '',
    homepageUrl: item.homepageUrl ?? item.url ?? '#',
  }
}

function normalizeRecommendedExhibition(
  item: RecommendedExhibition,
  index = 0,
  includeMatchScore = false,
): RecommendedExhibition {
  const startDate = item.startDate
  const endDate = item.endDate
  const matchScore =
    includeMatchScore &&
    typeof item.matchScore === 'number' &&
    Number.isFinite(item.matchScore)
      ? item.matchScore
      : undefined

  return {
    ...item,
    id: item.id === undefined || item.id === null ? '' : String(item.id),
    eventId: item.eventId ? String(item.eventId) : undefined,
    dday: item.dday ?? item.status ?? '',
    category: item.category ?? '전시',
    title: item.title ?? '제목 없는 이벤트',
    period: item.period ?? formatPeriod(startDate, endDate),
    venue: item.venue ?? '',
    artwork: item.artwork ?? getFallbackArtwork(index),
    liked: item.bookmarked ?? item.liked ?? false,
    matchScore,
  }
}

function formatPeriod(startDate?: string, endDate?: string) {
  if (!startDate && !endDate) {
    return ''
  }

  return [formatDate(startDate), formatDate(endDate)].filter(Boolean).join(' - ')
}

function formatDate(date?: string) {
  if (!date) {
    return ''
  }

  return date.replaceAll('-', '.')
}

function getFallbackArtwork(index: number): ExhibitionArtwork {
  const artworks: ExhibitionArtwork[] = ['portal', 'tree', 'glass', 'media']

  return artworks[index % artworks.length]
}

export default LoggedInHome
