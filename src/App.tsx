import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './styles/Home.css'
import AppHeader from './components/AppHeader'
import AppFooter from './components/AppFooter'
import { getHome, getHomeRecommendations } from './api/homeApi'
import { readAccessToken, readRecommendationEventIds } from './api/authStorage'
import { hasValidAccessTokenForApi } from './api/headers'
import { ApiError } from './features/user/api/authApi'
import { addBookmark, removeBookmark } from './features/exhibitions/api/bookmarksApi'
import type {
  ExhibitionArtwork,
  HeroExhibition,
  HomeResponse,
  RecommendationApiItem,
  RecommendedExhibition,
} from './types/home'

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={filled ? 'is-filled' : ''}>
      <path d="M12 20.2s-7.1-4.28-8.75-9A4.55 4.55 0 0 1 11.4 7.1l.6.83.6-.83a4.55 4.55 0 0 1 8.15 4.1c-1.65 4.72-8.75 9-8.75 9Z" />
    </svg>
  )
}

function App() {
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
            nextRecommendationMessage = '취향 설정에서 추천 이벤트를 먼저 선택해 주세요.'
          } else {
            try {
              nextHomeData = mergeHomeRecommendations(
                home,
                await getHomeRecommendations(eventIds),
              )
            } catch (error) {
              if (error instanceof ApiError && error.status === 400) {
                nextRecommendationMessage = '취향 설정에서 추천 이벤트를 먼저 선택해 주세요.'
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
      setRecommendationMessage('취향 설정에서 추천 이벤트를 먼저 선택해 주세요.')
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
        setRecommendationMessage('취향 설정에서 추천 이벤트를 먼저 선택해 주세요.')
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
      <AppHeader variant="home" onBrandClick={() => void handleBrandClick()} />

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
            <p className="hero-eyebrow">
              <span>Featured exhibition</span>
              {currentHeroExhibition.category}
            </p>
            <h1 id="hero-title">
              {currentHeroExhibition.title}
              {currentHeroExhibition.subtitle && <span>: {currentHeroExhibition.subtitle}</span>}
            </h1>
            {(currentHeroExhibition.period || currentHeroExhibition.venue) && (
              <p className="hero-meta">
                {currentHeroExhibition.period}
                {currentHeroExhibition.period && currentHeroExhibition.venue && <i />}
                {currentHeroExhibition.venue}
              </p>
            )}
            <div className="hero-buttons">
              {currentHeroExhibition.homepageUrl && currentHeroExhibition.homepageUrl !== '#' && (
                <a href={currentHeroExhibition.homepageUrl} className="primary-link">
                  홈페이지 바로가기
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 17 17 7" />
                    <path d="M9 7h8v8" />
                  </svg>
                </a>
              )}
              {currentHeroExhibition.eventId ? (
                <Link to={`/exhibitions/${currentHeroExhibition.eventId}`} className="ghost-link">
                  자세히 보기
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 12h13" />
                    <path d="m13 7 5 5-5 5" />
                  </svg>
                </Link>
              ) : (
                <span className="ghost-link is-disabled" aria-disabled="true">
                  자세히 보기
                </span>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="recommendations" aria-labelledby="recommend-title">
        <div className="section-heading">
          <div>
            <h2 id="recommend-title">당신의 추천</h2>
            <p>큐레이터가 엄선한 당신만을 위한 맞춤형 문화생활 리스트입니다.</p>
          </div>
          <Link to="/exhibitions/all" className="view-all">
            전체보기
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h13" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </Link>
        </div>

        {!isLoading && recommendationMessage && (
          <div className="home-notice" role="status">
            <span>{recommendationMessage}</span>
            <Link to={recommendationMessage.startsWith('취향 설정') ? '/user/preferences' : '/user/login'}>
              {recommendationMessage.startsWith('취향 설정') ? '취향 설정하기' : '로그인하기'}
            </Link>
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
          <div className="card-grid">
            {currentRecommendedExhibitions.map((item) => {
              const isFavorite = item.bookmarked ?? item.liked
              const isBookmarkPending = item.eventId ? pendingBookmarkIds.has(item.eventId) : false
              const isBookmarkDisabled = !item.eventId || isBookmarkPending
              const cardContent = (
                <>
                  <div className={`poster poster-${item.artwork}`}>
                    {item.posterImageUrl ? <img src={item.posterImageUrl} alt="" /> : <span className="poster-art" />}
                    <span className={`dday ${item.status ? '' : 'muted'}`}>{item.status ?? item.dday}</span>
                    {typeof item.matchScore === 'number' && (
                      <span className="card-match-badge">{item.matchScore}% Match</span>
                    )}
                  </div>
                  <span className="category">
                    {item.category}
                    {typeof item.free === 'boolean' ? ` · ${item.free ? '무료' : '유료'}` : ''}
                  </span>
                  <h3>{item.title}</h3>
                  <p className="meta calendar">{item.period}</p>
                  <p className="meta pin">{item.venue}</p>
                </>
              )

              return (
                <article className="exhibition-card" key={item.id || item.title}>
                  {item.eventId ? (
                    <Link className="exhibition-card-link" to={`/exhibitions/${item.eventId}`}>
                      {cardContent}
                    </Link>
                  ) : (
                    <div className="exhibition-card-link" aria-disabled="true">
                      {cardContent}
                    </div>
                  )}
                  <button
                    aria-label={isFavorite ? `${item.title} 즐겨찾기 해제` : `${item.title} 즐겨찾기 추가`}
                    aria-pressed={isFavorite}
                    className="heart-button"
                    disabled={isBookmarkDisabled}
                    onClick={() => void handleBookmarkToggle(item, isFavorite)}
                    type="button"
                  >
                    <HeartIcon filled={isFavorite} />
                  </button>
                </article>
              )
            })}
          </div>
        )}
      </section>

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

export default App
