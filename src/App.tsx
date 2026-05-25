import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import './styles/Home.css'
import { heroExhibition, recommendedExhibitions } from './data/homeMock'
import { useFavoriteExhibitions } from './hooks/useFavoriteExhibitions'
import AppHeader from './components/AppHeader'
import AppFooter from './components/AppFooter'
import { getHome, getHomeRecommendations } from './api/homeApi'
import { readAccessToken } from './api/authStorage'
import type { ExhibitionArtwork, HeroExhibition, HomeResponse, RecommendedExhibition } from './types/home'

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={filled ? 'is-filled' : ''}>
      <path d="M12 20.2s-7.1-4.28-8.75-9A4.55 4.55 0 0 1 11.4 7.1l.6.83.6-.83a4.55 4.55 0 0 1 8.15 4.1c-1.65 4.72-8.75 9-8.75 9Z" />
    </svg>
  )
}

function App() {
  const [homeData, setHomeData] = useState<HomeResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const { favoriteIdSet, toggleFavorite } = useFavoriteExhibitions()
  const normalizedHome = useMemo(() => normalizeHomeData(homeData), [homeData])
  const currentHeroExhibition = normalizedHome.heroExhibition
  const currentRecommendedExhibitions = normalizedHome.recommendedExhibitions
  const heroDetailPath = `/exhibitions/${currentHeroExhibition.id}`
  const heroMatchScore = currentHeroExhibition.matchScore ?? currentHeroExhibition.matchRate

  useEffect(() => {
    let ignore = false

    async function loadHome() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const nextHomeData = readAccessToken() ? await getHomeRecommendations() : await getHome()

        if (!ignore) {
          setHomeData(nextHomeData)
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
  }, [])

  return (
    <main className="home-page" aria-label="Arbit home">
      <AppHeader variant="home" />

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-scene" aria-hidden="true">
          <div className="window window-left" />
          <div className="window window-right" />
          <div className="painting" />
          <div className="sculptures">
            <span className="sculpture bronze-one" />
            <span className="sculpture bronze-two" />
            <span className="sculpture black-one" />
          </div>
        </div>
        <div className="hero-shade" />
        <div className="hero-copy">
          <span className="match-badge">
            <HeartIcon filled />
            {heroMatchScore}% Match
          </span>
          <h1 id="hero-title">
            {currentHeroExhibition.title}
            <span>: {currentHeroExhibition.subtitle}</span>
          </h1>
          <div className="hero-buttons">
            <a href={currentHeroExhibition.homepageUrl} className="primary-link">
              홈페이지 바로가기
            </a>
            <Link to={heroDetailPath} className="ghost-link">
              자세히 보기
            </Link>
          </div>
        </div>
      </section>

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
              const isFavorite = item.bookmarked ?? (item.liked || favoriteIdSet.has(item.id))

              return (
                <article className="exhibition-card" key={item.id}>
                  <Link className="exhibition-card-link" to={`/exhibitions/${item.id}`}>
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
                  </Link>
                  <button
                    aria-label={isFavorite ? `${item.title} 즐겨찾기 해제` : `${item.title} 즐겨찾기 추가`}
                    aria-pressed={isFavorite}
                    className="heart-button"
                    onClick={() => toggleFavorite(item.id)}
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

function normalizeHomeData(data: HomeResponse | null) {
  if (Array.isArray(data)) {
    return {
      heroExhibition,
      recommendedExhibitions: data.map(normalizeRecommendedExhibition),
    }
  }

  const hero = data?.heroExhibition ?? data?.hero ?? heroExhibition
  const recommendations =
    data?.recommendedExhibitions ?? data?.recommendations ?? data?.events ?? recommendedExhibitions

  return {
    heroExhibition: normalizeHeroExhibition(hero),
    recommendedExhibitions: recommendations.map(normalizeRecommendedExhibition),
  }
}

function normalizeHeroExhibition(item: HeroExhibition): HeroExhibition {
  const normalizedItem = normalizeRecommendedExhibition(item)
  const matchRate = item.matchScore ?? item.matchRate ?? heroExhibition.matchRate

  return {
    ...normalizedItem,
    matchRate,
    subtitle: item.subtitle ?? item.category ?? heroExhibition.subtitle,
    homepageUrl: item.homepageUrl ?? '#',
  }
}

function normalizeRecommendedExhibition(
  item: RecommendedExhibition,
  index = 0,
): RecommendedExhibition {
  const startDate = item.startDate
  const endDate = item.endDate

  return {
    ...item,
    id: String(item.id),
    dday: item.dday ?? item.status ?? '',
    category: item.category ?? '전시',
    title: item.title ?? '제목 없는 이벤트',
    period: item.period ?? formatPeriod(startDate, endDate),
    venue: item.venue ?? '',
    artwork: item.artwork ?? getFallbackArtwork(index),
    liked: item.bookmarked ?? item.liked ?? false,
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
