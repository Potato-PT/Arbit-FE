import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../../../styles/Home.css'
import { getHome } from '../../../api/homeApi'
import AppFooter from '../../../components/AppFooter'
import AppHeader from '../../../components/AppHeader'
import StatusMessage from '../../../components/StatusMessage'
import type { ExhibitionArtwork, HomeResponse, RecommendedExhibition } from '../../../types/home'
import HomeEventSection from '../components/HomeEventSection'
import { getDateTimestamp, getDaysUntilEnd } from '../utils/homeDateUtils'
import { getHomeHeroLabel, selectHomeHeroEvent } from '../utils/homeHeroUtils'

function GuestHome() {
  const navigate = useNavigate()
  const [homeData, setHomeData] = useState<HomeResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const exhibitions = useMemo(() => normalizePublicExhibitions(homeData), [homeData])
  const closingSoonExhibitions = useMemo(
    () =>
      [...exhibitions]
        .filter((item) => {
          const daysUntilEnd = getDaysUntilEnd(item.endDate)

          return Number.isFinite(daysUntilEnd) && daysUntilEnd >= 0
        })
        .sort((a, b) => getDaysUntilEnd(a.endDate) - getDaysUntilEnd(b.endDate))
        .slice(0, 10),
    [exhibitions],
  )
  const newExhibitions = useMemo(
    () =>
      [...exhibitions]
        .sort((a, b) => getDateTimestamp(b.startDate) - getDateTimestamp(a.startDate))
        .slice(0, 10),
    [exhibitions],
  )
  const currentHero = useMemo(
    () =>
      selectHomeHeroEvent({
        closingSoon: closingSoonExhibitions,
        latest: newExhibitions,
        fallback: exhibitions,
      }),
    [closingSoonExhibitions, exhibitions, newExhibitions],
  )
  const currentHeroExhibition = currentHero?.event
  const currentHeroLabel = currentHero ? getHomeHeroLabel(currentHero.source) : ''

  useEffect(() => {
    let ignore = false

    async function loadHome() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const home = await getHome()

        if (!ignore) {
          setHomeData(home)
        }
      } catch {
        if (!ignore) {
          setHomeData(null)
          setErrorMessage('홈 이벤트를 불러오지 못했습니다.')
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

  const handleGuestBookmark = () => {
    navigate('/user/login')
  }

  return (
    <main className="home-page" aria-label="Arbit home">
      <AppHeader variant="home" />

      {currentHeroExhibition && (
        <section className="hero guest-hero" aria-labelledby="guest-hero-title">
          <div className="hero-scene" aria-hidden="true">
            {currentHeroExhibition.posterImageUrl && (
              <img className="hero-artwork" src={currentHeroExhibition.posterImageUrl} alt="" />
            )}
          </div>
          <div className="hero-shade" />
          <div className="hero-copy">
            <div className="hero-badges">
              {currentHeroLabel && <span className="hero-badge">{currentHeroLabel}</span>}
              {currentHeroExhibition.status && <span className="hero-badge">{currentHeroExhibition.status}</span>}
            </div>
            <h1 className={getHeroTitleClassName(currentHeroExhibition.title)} id="guest-hero-title">
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
                <Link className="primary-link" to={`/exhibitions/${currentHeroExhibition.eventId}`}>
                  자세히 보기
                  <span aria-hidden="true">→</span>
                </Link>
              ) : (
                <span className="primary-link is-disabled" aria-disabled="true">
                  자세히 보기
                </span>
              )}
              <Link className="ghost-link" to="/user/signup">
                회원가입하고 시작하기
              </Link>
            </div>
          </div>
        </section>
      )}

      <div className="home-content">
        {isLoading && (
          <StatusMessage className="home-state">
            홈 이벤트를 불러오는 중입니다.
          </StatusMessage>
        )}

        {!isLoading && errorMessage && (
          <StatusMessage className="home-state" role="alert" tone="error">
            {errorMessage}
          </StatusMessage>
        )}

        {!isLoading && !errorMessage && closingSoonExhibitions.length > 0 && (
          <HomeEventSection
            eyebrow="Closing Soon"
            id="closing-title"
            items={closingSoonExhibitions}
            title="지금 놓치면 아쉬운 행사"
            variant="closing"
            onBookmarkToggle={handleGuestBookmark}
          />
        )}

        {!isLoading && !errorMessage && newExhibitions.length > 0 && (
          <HomeEventSection
            eyebrow="Just Added"
            id="new-title"
            items={newExhibitions}
            title="새로 올라온 행사"
            variant="new"
            onBookmarkToggle={handleGuestBookmark}
          />
        )}
      </div>

      <AppFooter />
    </main>
  )
}

function normalizePublicExhibitions(data: HomeResponse | null) {
  const events = Array.isArray(data) ? data : data?.events ?? []

  return events.map(normalizePublicExhibition)
}

function normalizePublicExhibition(item: RecommendedExhibition, index: number): RecommendedExhibition {
  return {
    ...item,
    id: item.id === undefined || item.id === null ? '' : String(item.id),
    eventId: getHomeEventId(item),
    dday: item.dday ?? item.status ?? '',
    category: item.category ?? '전시',
    title: item.title ?? '제목 없는 이벤트',
    period: item.period ?? formatPeriod(item.startDate, item.endDate),
    venue: item.venue ?? '',
    artwork: item.artwork ?? getFallbackArtwork(index),
    liked: false,
  }
}

function getHomeEventId(item: RecommendedExhibition) {
  const eventId = item.eventId ?? item.event_id ?? item.id

  return eventId ? String(eventId) : undefined
}

function formatPeriod(startDate?: string, endDate?: string) {
  return [formatDate(startDate), formatDate(endDate)].filter(Boolean).join(' - ')
}

function formatDate(date?: string) {
  return date ? date.replaceAll('-', '.') : ''
}

function getHeroTitleClassName(title: string) {
  const titleLength = title.replace(/\s/g, '').length

  if (titleLength > 38) {
    return 'is-very-long-title'
  }

  return titleLength > 24 ? 'is-long-title' : undefined
}

function getFallbackArtwork(index: number): ExhibitionArtwork {
  const artworks: ExhibitionArtwork[] = ['portal', 'tree', 'glass', 'media']

  return artworks[index % artworks.length]
}

export default GuestHome
