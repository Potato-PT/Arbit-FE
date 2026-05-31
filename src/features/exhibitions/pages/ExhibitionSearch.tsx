import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import AppHeader from '../../../components/AppHeader'
import AppFooter from '../../../components/AppFooter'
import { searchEvents, type EventSearchSort, type EventSummary } from '../api/eventsApi'
import type { SearchArtwork, SearchExhibition } from '../types/search'
import '../styles/ExhibitionSearch.css'

type SortOption = '거리순' | '마감 임박순' | '예정순'

const periodFilters = ['진행중', '예정'] as const
const priceFilters = ['무료', '유료'] as const
const sortOptions: SortOption[] = ['거리순', '마감 임박순', '예정순']
const seoulDistricts = ['강남구', '마포구', '종로구', '성동구', '송파구', '용산구']
const genreFilters = ['사진/영상', '회화', '미디어아트', '체험형']

function ExhibitionSearch() {
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>(['마포구'])
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['사진/영상'])
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>(['진행중'])
  const [selectedPriceTypes, setSelectedPriceTypes] = useState<string[]>(['무료', '유료'])
  const [districtQuery, setDistrictQuery] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState<SortOption>('거리순')
  const [events, setEvents] = useState<EventSummary[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const filteredExhibitions = useMemo(
    () => events.map((event, index) => normalizeSearchEvent(event, index)),
    [events],
  )

  useEffect(() => {
    if (sortOption !== '거리순' || userLocation || typeof navigator === 'undefined') {
      return
    }

    navigator.geolocation?.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      () => undefined,
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 },
    )
  }, [sortOption, userLocation])

  useEffect(() => {
    let ignore = false
    const districtValues = [...selectedDistricts, districtQuery.trim()].filter(Boolean)
    const searchSort = toSearchSort(sortOption)
    const shouldIncludeLocation = searchSort === 'distance' && userLocation

    async function loadSearchEvents() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const response = await searchEvents({
          title: searchQuery.trim() || undefined,
          category: selectedGenres.length === 1 ? selectedGenres[0] : undefined,
          district: districtValues,
          status: selectedPeriods.map(toApiStatus),
          free: selectedPriceTypes.map((priceType) => priceType === '무료'),
          sort: searchSort,
          lat: shouldIncludeLocation ? userLocation.lat : undefined,
          lng: shouldIncludeLocation ? userLocation.lng : undefined,
        })
        const nextEvents = Array.isArray(response) ? response : response.events

        if (!ignore) {
          setEvents(nextEvents)
        }
      } catch {
        if (!ignore) {
          setEvents([])
          setErrorMessage('검색 결과를 불러오지 못했습니다.')
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadSearchEvents()

    return () => {
      ignore = true
    }
  }, [
    districtQuery,
    searchQuery,
    selectedDistricts,
    selectedGenres,
    selectedPeriods,
    selectedPriceTypes,
    sortOption,
    userLocation,
  ])

  const toggleDistrict = (district: string) => {
    setSelectedDistricts((current) => toggleListValue(current, district))
  }

  const toggleGenre = (genre: string) => {
    setSelectedGenres((current) => (current.includes(genre) ? [] : [genre]))
  }

  const togglePeriod = (period: string) => {
    setSelectedPeriods((current) => toggleListValue(current, period))
  }

  const togglePriceType = (priceType: string) => {
    setSelectedPriceTypes((current) => toggleListValue(current, priceType))
  }

  const handleSortClick = () => {
    setSortOption((current) => sortOptions[(sortOptions.indexOf(current) + 1) % sortOptions.length])
  }

  return (
    <main className="search-page" aria-label="전시 검색">
      <AppHeader />

      <div className="search-shell">
        <aside className="filter-panel" aria-label="전시 필터">
          <h1>필터</h1>

          <FilterSection title="지역">
            <label className="location-input">
              <PinIcon />
              <input
                type="text"
                placeholder="지역 직접 입력 (예: 강남구)"
                value={districtQuery}
                onChange={(event) => setDistrictQuery(event.target.value)}
              />
            </label>
            <p className="filter-caption">서울 주요 지역</p>
            <div className="chip-grid">
              {seoulDistricts.map((district) => (
                <button
                  className={selectedDistricts.includes(district) ? 'chip is-active' : 'chip'}
                  type="button"
                  key={district}
                  aria-pressed={selectedDistricts.includes(district)}
                  onClick={() => toggleDistrict(district)}
                >
                  {district}
                </button>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="장르">
            <div className="chip-grid genre-grid">
              {genreFilters.map((genre) => (
                <button
                  className={selectedGenres.includes(genre) ? 'chip is-active' : 'chip'}
                  type="button"
                  key={genre}
                  aria-pressed={selectedGenres.includes(genre)}
                  onClick={() => toggleGenre(genre)}
                >
                  {genre}
                </button>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="기간">
            {periodFilters.map((period) => (
              <label
                className={selectedPeriods.includes(period) ? 'check-row is-active' : 'check-row'}
                key={period}
              >
                <input
                  type="checkbox"
                  checked={selectedPeriods.includes(period)}
                  onChange={() => togglePeriod(period)}
                />
                <span>{period}</span>
              </label>
            ))}
          </FilterSection>

          <FilterSection title="가격" isLast>
            {priceFilters.map((priceType) => (
              <label
                className={
                  selectedPriceTypes.includes(priceType) ? 'check-row is-active' : 'check-row'
                }
                key={priceType}
              >
                <input
                  type="checkbox"
                  checked={selectedPriceTypes.includes(priceType)}
                  onChange={() => togglePriceType(priceType)}
                />
                <span>{priceType}</span>
              </label>
            ))}
          </FilterSection>
        </aside>

        <section className="search-results" aria-labelledby="search-result-title">
          <div className="search-toolbar">
            <label className="search-input">
              <SearchIcon />
              <input
                type="search"
                placeholder="어떤 전시를 찾으시나요?"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>
            <button className="sort-button" type="button" onClick={handleSortClick}>
              {sortOption}
              <ChevronDownIcon />
            </button>
          </div>

          <p className="result-count" id="search-result-title">
            총 <strong>{filteredExhibitions.length}개</strong>의 전시가 있습니다
          </p>

          {isLoading && (
            <div className="empty-results" role="status">
              <p>검색 결과를 불러오는 중입니다.</p>
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="empty-results is-error" role="alert">
              <p>{errorMessage}</p>
            </div>
          )}

          {!isLoading && !errorMessage && filteredExhibitions.length > 0 ? (
            <div className="result-grid">
              {filteredExhibitions.map((item, index) => {
                const cardContent = (
                  <>
                    <div className={`result-art result-art-${item.artwork}`}>
                      {item.posterImageUrl ? <img src={item.posterImageUrl} alt="" /> : <span className="art-shape" />}
                      {item.badge ? <span className="result-badge">{item.badge}</span> : null}
                    </div>
                    <div className="result-body">
                      <p className="result-meta">
                        {item.category} · {item.district}
                      </p>
                      <h2>{item.title}</h2>
                      <p className="result-venue">
                        {item.venue} · {item.period}
                      </p>
                      <div className="result-footer">
                        <strong>{item.price}</strong>
                        <span className="result-detail-meta">
                          {formatDistanceAndRating(item.distanceKm, item.rating)}
                        </span>
                        <span
                          className={item.liked ? 'result-heart is-liked' : 'result-heart'}
                          aria-label={`${item.title} 찜하기`}
                          role="img"
                        >
                          <HeartIcon filled={item.liked} />
                        </span>
                      </div>
                    </div>
                  </>
                )

                return item.eventId ? (
                  <Link className="result-card" key={item.eventId} to={`/exhibitions/${item.eventId}`}>
                    {cardContent}
                  </Link>
                ) : (
                  <div className="result-card" key={`${item.title}-${index}`} aria-disabled="true">
                    {cardContent}
                  </div>
                )
              })}
            </div>
          ) : null}

          {!isLoading && !errorMessage && filteredExhibitions.length === 0 && (
            <div className="empty-results">
              <p>선택한 조건에 맞는 전시가 없습니다</p>
            </div>
          )}

          {!isLoading && !errorMessage && filteredExhibitions.length > 0 && <button className="load-more" type="button">
            전시 더보기
          </button>}
        </section>
      </div>
      <AppFooter />
    </main>
  )
}

function toggleListValue(values: string[], value: string) {
  if (values.includes(value)) {
    return values.filter((item) => item !== value)
  }

  return [...values, value]
}

function FilterSection({
  title,
  children,
  isLast = false,
}: {
  title: string
  children: ReactNode
  isLast?: boolean
}) {
  return (
    <section className={isLast ? 'filter-section is-last' : 'filter-section'}>
      <button className="filter-title" type="button">
        <span>{title}</span>
        <ChevronUpIcon />
      </button>
      {children}
    </section>
  )
}

function normalizeSearchEvent(item: EventSummary, index: number): SearchExhibition & {
  posterImageUrl?: string
  period: string
  rating?: number
} {
  const eventId = item.eventId ? String(item.eventId) : undefined
  const startDate = item.startDate ?? ''
  const endDate = item.endDate ?? ''
  const district = item.district ?? item.location ?? ''
  const free = Boolean(item.free)

  return {
    id: eventId ?? '',
    eventId,
    badge: item.status,
    category: item.category ?? '전시',
    location: item.location ?? district,
    district,
    periodStatus: item.status === '예정' || item.status === 'upcoming' ? '예정' : '진행중',
    priceType: free ? '무료' : '유료',
    distanceKm: item.distanceKm ?? 0,
    title: item.title ?? '제목 없는 전시',
    venue: item.venue ?? '',
    price: free ? '무료' : '유료',
    artwork: getFallbackArtwork(index),
    liked: Boolean(item.bookmarked),
    posterImageUrl: item.posterImageUrl,
    period: formatPeriod(startDate, endDate),
    rating: item.rating,
  }
}

function formatPeriod(startDate: string, endDate: string) {
  return [formatDate(startDate), formatDate(endDate)].filter(Boolean).join(' - ')
}

function formatDate(value: string) {
  return value.replaceAll('-', '.')
}

function getFallbackArtwork(index: number): SearchArtwork {
  const artworks: SearchArtwork[] = ['pastel', 'soft-shape', 'light-bunker', 'flame', 'rose', 'busan-sea']

  return artworks[index % artworks.length]
}

function toSearchSort(sortOption: SortOption): EventSearchSort {
  const sortByOption: Record<SortOption, EventSearchSort> = {
    거리순: 'distance',
    '마감 임박순': 'deadline',
    예정순: 'upcoming',
  }

  return sortByOption[sortOption]
}

function toApiStatus(status: string) {
  return status === '진행중' ? 'ongoing' : 'upcoming'
}

function formatDistanceAndRating(distanceKm: number, rating?: number) {
  const parts = []

  if (distanceKm > 0) {
    parts.push(`${distanceKm.toFixed(1)}km`)
  }

  if (typeof rating === 'number') {
    parts.push(`★ ${rating.toFixed(1)}`)
  }

  return parts.join(' · ')
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.7" cy="10.7" r="5.6" />
      <path d="m15 15 4.2 4.2" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s6-5.3 6-11A6 6 0 0 0 6 10c0 5.7 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2" />
    </svg>
  )
}

function ChevronUpIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 15 6-6 6 6" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
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

export default ExhibitionSearch
