import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import AppHeader from '../../../components/AppHeader'
import AppFooter from '../../../components/AppFooter'
import { allExhibitionsMock } from '../data/allExhibitionsMock'
import type {
  AllExhibition,
  AllExhibitionPosterIcon,
  AllExhibitionPriceType,
} from '../types/allExhibitions'
import '../styles/AllExhibitions.css'

type SortOption = '마감 임박순' | '거리순'
type PeriodFilter = '진행중' | '예정'

const sortOptions: SortOption[] = ['마감 임박순', '거리순']
const periodFilters: PeriodFilter[] = ['진행중', '예정']
const priceFilters: AllExhibitionPriceType[] = ['무료', '유료']
const dayInMs = 24 * 60 * 60 * 1000

function AllExhibitions() {
  const { districts, exhibitions, initiallyLikedIds, initialDisplayCount, pageSize, genreFilters } =
    allExhibitionsMock
  const [activeFilter, setActiveFilter] = useState('전체')
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([])
  const [selectedPeriods, setSelectedPeriods] = useState<PeriodFilter[]>([])
  const [selectedPriceTypes, setSelectedPriceTypes] = useState<AllExhibitionPriceType[]>([])
  const [sortOption, setSortOption] = useState<SortOption>('마감 임박순')
  const [showMoreFilters, setShowMoreFilters] = useState(false)
  const [visibleCount, setVisibleCount] = useState(initialDisplayCount)
  const [likedIds, setLikedIds] = useState<Set<string>>(() => new Set(initiallyLikedIds))
  const nextCardRef = useRef<HTMLElement | null>(null)

  const visibleFilters = showMoreFilters ? genreFilters : genreFilters.slice(0, 4)
  const today = useMemo(() => startOfDay(new Date()), [])
  const filteredExhibitions = useMemo(() => {
    return exhibitions
      .filter((item) => {
        const matchesFilter = activeFilter === '전체' || item.category === activeFilter
        const matchesDistrict =
          selectedDistricts.length === 0 || selectedDistricts.includes(item.district)
        const periodStatus = getPeriodStatus(item, today)
        const matchesPeriod =
          selectedPeriods.length === 0 ||
          (periodStatus !== '종료' && selectedPeriods.includes(periodStatus))
        const matchesPrice =
          selectedPriceTypes.length === 0 || selectedPriceTypes.includes(item.priceType)

        return matchesFilter && matchesDistrict && matchesPeriod && matchesPrice
      })
      .sort((a, b) => compareExhibitions(a, b, sortOption, today))
  }, [activeFilter, exhibitions, selectedDistricts, selectedPeriods, selectedPriceTypes, sortOption, today])
  const visibleExhibitions = filteredExhibitions.slice(0, visibleCount)
  const remainingCount = Math.max(filteredExhibitions.length - visibleExhibitions.length, 0)

  const toggleDistrict = (district: string) => {
    setVisibleCount(initialDisplayCount)
    setSelectedDistricts((current) =>
      current.includes(district)
        ? current.filter((item) => item !== district)
        : [...current, district],
    )
  }

  const togglePeriod = (period: PeriodFilter) => {
    setVisibleCount(initialDisplayCount)
    setSelectedPeriods((current) => toggleListValue(current, period))
  }

  const togglePriceType = (priceType: AllExhibitionPriceType) => {
    setVisibleCount(initialDisplayCount)
    setSelectedPriceTypes((current) => toggleListValue(current, priceType))
  }

  const toggleLike = (id: string) => {
    setLikedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const showMoreExhibitions = () => {
    const nextStartIndex = visibleExhibitions.length
    setVisibleCount((current) => Math.min(current + pageSize, filteredExhibitions.length))
    requestAnimationFrame(() => {
      if (nextStartIndex < filteredExhibitions.length) {
        nextCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  }

  return (
    <main className="all-page" aria-label="전시 전체보기">
      <AppHeader
        sectionLinks={[
          { label: '홈', to: '/' },
          { label: '둘러보기', to: '/exhibitions/all', isActive: true },
        ]}
        showAccountLabel
      />

      <div className="all-shell">
        <section className="all-hero" aria-labelledby="all-title">
          <span>All Exhibitions</span>
          <div>
            <h1 id="all-title">
              지금 열리는
              <br />
              <em>모든 전시</em>
            </h1>
            <p>
              시각 예술, 퍼포먼스, 몰입형 설치까지.
              <br />
              큐레이팅된 전시 전체를 탐색하세요.
            </p>
          </div>
        </section>

        <div className="all-layout">
          <aside className="all-sidebar" aria-label="전시 필터">
            <section className="all-filter-section">
              <h2>장르</h2>
              <div className="all-filter-list">
                {visibleFilters.map((filter) => (
                  <button
                    className={activeFilter === filter ? 'is-active' : ''}
                    type="button"
                    key={filter}
                    onClick={() => {
                      setActiveFilter(filter)
                      setVisibleCount(initialDisplayCount)
                    }}
                  >
                    {filter}
                  </button>
                ))}
                <button
                  className="all-filter-toggle"
                  type="button"
                  onClick={() => setShowMoreFilters((current) => !current)}
                >
                  {showMoreFilters ? '접기' : '더 보기'}
                  <ChevronIcon open={showMoreFilters} />
                </button>
              </div>
            </section>

            <section className="all-filter-section">
              <h2>지역</h2>
              <div className="all-check-list">
                {districts.map((district) => (
                  <label key={district}>
                    <input
                      type="checkbox"
                      checked={selectedDistricts.includes(district)}
                      onChange={() => toggleDistrict(district)}
                    />
                    <span>{district}</span>
                  </label>
                ))}
              </div>
            </section>

            <section className="all-filter-section">
              <h2>기간</h2>
              <div className="all-check-list">
                {periodFilters.map((period) => (
                  <label key={period}>
                    <input
                      type="checkbox"
                      checked={selectedPeriods.includes(period)}
                      onChange={() => togglePeriod(period)}
                    />
                    <span>{period}</span>
                  </label>
                ))}
              </div>
            </section>

            <section className="all-filter-section">
              <h2>관람료</h2>
              <div className="all-check-list">
                {priceFilters.map((priceType) => (
                  <label key={priceType}>
                    <input
                      type="checkbox"
                      checked={selectedPriceTypes.includes(priceType)}
                      onChange={() => togglePriceType(priceType)}
                    />
                    <span>{priceType}</span>
                  </label>
                ))}
              </div>
            </section>

            <button
              className="all-reset"
              type="button"
              onClick={() => {
                setActiveFilter('전체')
                setSelectedDistricts([])
                setSelectedPeriods([])
                setSelectedPriceTypes([])
                setVisibleCount(initialDisplayCount)
              }}
            >
              필터 초기화
            </button>
          </aside>

          <section className="all-results" aria-label="전시 목록">
            <div className="all-results-bar">
              <span>
                총 <strong>{filteredExhibitions.length}</strong>개의 전시
              </span>
              <label>
                정렬
                <select
                  value={sortOption}
                  onChange={(event) => {
                    setSortOption(event.target.value as SortOption)
                    setVisibleCount(initialDisplayCount)
                  }}
                >
                  {sortOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="all-grid">
              {visibleExhibitions.map((item, index) => (
                <article
                  className="all-card"
                  key={item.id}
                  ref={index === visibleCount - pageSize ? nextCardRef : null}
                >
                  <Link className="all-card-link" to={`/exhibitions/${item.id}`}>
                    <div className={`all-poster poster-${item.icon}`}>
                      <PosterIcon type={item.icon} />
                      <span className={`all-badge ${getBadgeClassName(item, today)}`}>
                        {getAvailabilityLabel(item, today)}
                      </span>
                    </div>
                    <div className="all-card-body">
                      <p className="all-meta">
                        <CalendarIcon />
                        {item.period}
                      </p>
                      <p className="all-meta">
                        <PinIcon />
                        {item.location} · {item.venue}
                      </p>
                      <h3>{item.title}</h3>
                      <div className="all-card-foot">
                        <div className="all-card-tags">
                          <span className="all-category-chip">{item.category}</span>
                          <span className="all-price-chip">{item.priceType}</span>
                        </div>
                        <span className="all-card-distance">{item.distanceKm.toFixed(1)}km</span>
                      </div>
                    </div>
                  </Link>
                  <button
                    className={likedIds.has(item.id) ? 'all-heart is-liked' : 'all-heart'}
                    type="button"
                    aria-label={likedIds.has(item.id) ? `${item.title} 즐겨찾기 해제` : `${item.title} 즐겨찾기 추가`}
                    aria-pressed={likedIds.has(item.id)}
                    onClick={() => toggleLike(item.id)}
                  >
                    <HeartIcon filled={likedIds.has(item.id)} />
                  </button>
                </article>
              ))}
            </div>

            <div className="all-more">
              {remainingCount > 0 && (
                <button type="button" onClick={showMoreExhibitions}>
                  더 보기 ({remainingCount})
                </button>
              )}
              <span>
                {filteredExhibitions.length}개 중 {visibleExhibitions.length}개 표시 중
              </span>
            </div>
          </section>
        </div>
      </div>

      <AppFooter />
    </main>
  )
}

function toggleListValue<T>(values: T[], value: T) {
  if (values.includes(value)) {
    return values.filter((item) => item !== value)
  }

  return [...values, value]
}

function compareExhibitions(
  a: AllExhibition,
  b: AllExhibition,
  sortOption: SortOption,
  today: Date,
) {
  if (sortOption === '거리순') {
    return a.distanceKm - b.distanceKm
  }

  return getDeadlineSortTime(a, today) - getDeadlineSortTime(b, today)
}

function getDeadlineSortTime(item: AllExhibition, today: Date) {
  const end = parseIsoDate(item.endDate)
  return end < today ? Number.MAX_SAFE_INTEGER : end.getTime()
}

function getPeriodStatus(item: AllExhibition, today: Date): PeriodFilter | '종료' {
  const start = parseIsoDate(item.startDate)
  const end = parseIsoDate(item.endDate)

  if (end < today) {
    return '종료'
  }

  return start > today ? '예정' : '진행중'
}

function getAvailabilityLabel(item: AllExhibition, today: Date) {
  const start = parseIsoDate(item.startDate)
  const end = parseIsoDate(item.endDate)

  if (end < today) {
    return '종료'
  }

  if (start > today) {
    return `${getDayDifference(today, start)}일 후 관람 가능`
  }

  if (isSameDay(end, today)) {
    return '오늘 마감'
  }

  return `D-day ${getDayDifference(today, end)}`
}

function getBadgeClassName(item: AllExhibition, today: Date) {
  const start = parseIsoDate(item.startDate)
  const end = parseIsoDate(item.endDate)

  if (end < today) {
    return 'status-ended'
  }

  if (start > today) {
    return 'status-upcoming'
  }

  if (isSameDay(end, today)) {
    return 'status-today'
  }

  return 'status-ongoing'
}

function parseIsoDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return createLocalDate(year, month, day)
}

function createLocalDate(year: number, month: number, day: number) {
  return new Date(year, month - 1, day)
}

function startOfDay(date: Date) {
  return createLocalDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

function getDayDifference(from: Date, to: Date) {
  return Math.max(0, Math.ceil((to.getTime() - from.getTime()) / dayInMs))
}

function isSameDay(a: Date, b: Date) {
  return a.getTime() === b.getTime()
}

function PosterIcon({ type }: { type: AllExhibitionPosterIcon }) {
  const iconByType: Record<AllExhibitionPosterIcon, string> = {
    filter: '✦',
    waves: '≈',
    music: '♪',
    palette: '◐',
    mind: '⌁',
    dance: '◇',
    arch: '△',
    theater: '◒',
    image: '□',
    brush: '╱',
  }

  return <span className="all-poster-icon">{iconByType[type]}</span>
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={open ? 'is-open' : ''}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3v3" />
      <path d="M17 3v3" />
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M4 10h16" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s6-5.2 6-11a6 6 0 0 0-12 0c0 5.8 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2" />
    </svg>
  )
}

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={filled ? 'is-filled' : ''}>
      <path d="M12 20.2s-7.1-4.28-8.75-9A4.55 4.55 0 0 1 11.4 7.1l.6.83.6-.83a4.55 4.55 0 0 1 8.15 4.1c-1.65 4.72-8.75 9-8.75 9Z" />
    </svg>
  )
}

export default AllExhibitions
