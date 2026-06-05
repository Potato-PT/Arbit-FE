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

function GuestHome() {
  const navigate = useNavigate()
  const [homeData, setHomeData] = useState<HomeResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const exhibitions = useMemo(() => normalizePublicExhibitions(homeData), [homeData])
  const heroArtwork = exhibitions[0]?.posterImageUrl
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

      <section className="hero guest-hero" aria-labelledby="guest-hero-title">
        <div className="hero-scene" aria-hidden="true">
          {heroArtwork && <img className="hero-artwork" src={heroArtwork} alt="" />}
        </div>
        <div className="hero-shade" />
        <div className="hero-copy">
          <span className="guest-hero-eyebrow">Culture Recommendation</span>
          <h1 id="guest-hero-title">
            취향을 말하면,
            <br />
            <em>문화의 다음 장면</em>을
            <br />
            찾아드립니다.
          </h1>
          <p className="guest-hero-description">
            전시, 공연, 축제 사이에서 당신이 오래 머물 행사를 골라주는 문화 추천 서비스.
          </p>
          <div className="hero-buttons">
            <Link className="primary-link" to="/user/signup">
              회원가입하고 시작하기
              <span aria-hidden="true">→</span>
            </Link>
            <Link className="ghost-link" to="/exhibitions/all">
              행사 둘러보기
            </Link>
          </div>
        </div>
      </section>

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

function getFallbackArtwork(index: number): ExhibitionArtwork {
  const artworks: ExhibitionArtwork[] = ['portal', 'tree', 'glass', 'media']

  return artworks[index % artworks.length]
}

export default GuestHome
