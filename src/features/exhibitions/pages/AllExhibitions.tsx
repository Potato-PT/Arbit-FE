import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AppHeader from '../../../components/AppHeader'
import AppFooter from '../../../components/AppFooter'
import { readAccessToken } from '../../../api/authStorage'
import { hasValidAccessTokenForApi } from '../../../api/headers'
import {
  getEvents,
  getMatchedEvents,
  searchEvents,
  type EventsSort,
  type EventSearchSort,
  type EventSummary,
} from '../api/eventsApi'
import { ApiError } from '../../user/api/authApi'
import { addBookmark, removeBookmark } from '../api/bookmarksApi'
import type {
  AllExhibition,
  AllExhibitionPosterIcon,
  AllExhibitionPriceType,
} from '../types/allExhibitions'
import '../styles/AllExhibitions.css'

type SortOption = '추천순' | '마감 임박순' | '최신순' | '평점순' | '거리순'
type PeriodFilter = '진행중' | '예정'
type SetSearchParams = ReturnType<typeof useSearchParams>[1]

const sortOptions: SortOption[] = ['추천순', '마감 임박순', '최신순', '평점순', '거리순']
const periodFilters: PeriodFilter[] = ['진행중', '예정']
const priceFilters: AllExhibitionPriceType[] = ['무료', '유료']
const genreFilters = [
  '전체',
  '전시/미술',
  '클래식',
  '교육/체험',
  '설치 예술',
  '축제',
  '연극',
  '콘서트',
  '국악',
  '뮤지컬/오페라',
  '무용',
  '영화',
  '기타',
]
const districts = ['종로구', '중구', '용산구', '성동구', '마포구', '서초구', '강남구', '강서구', '송파구']
const initialDisplayCount = 20
const pageSize = 20
const dayInMs = 24 * 60 * 60 * 1000
const loginRequiredForMatchMessage = '추천순은 로그인 후 이용할 수 있습니다.'
const fallbackSortOption: SortOption = '마감 임박순'

function AllExhibitions() {
  const [searchParams, setSearchParams] = useSearchParams()
  const sortQuery = searchParams.get('sort')
  const [activeFilter, setActiveFilter] = useState('전체')
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([])
  const [selectedPeriods, setSelectedPeriods] = useState<PeriodFilter[]>([])
  const [selectedPriceTypes, setSelectedPriceTypes] = useState<AllExhibitionPriceType[]>([])
  const [sortOption, setSortOption] = useState<SortOption>(() => getInitialSortOption(sortQuery))
  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [openCalendar, setOpenCalendar] = useState<'start' | 'end' | null>(null)
  const [showMoreFilters, setShowMoreFilters] = useState(false)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(initialDisplayCount)
  const [apiExhibitions, setApiExhibitions] = useState<EventSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [pendingBookmarkIds, setPendingBookmarkIds] = useState<Set<string>>(() => new Set())
  const nextCardRef = useRef<HTMLElement | null>(null)
  const previousSortOptionRef = useRef<SortOption>(sortOption)

  const visibleFilters = showMoreFilters ? genreFilters : genreFilters.slice(0, 4)
  const today = useMemo(() => startOfDay(new Date()), [])
  const normalizedExhibitions = useMemo(
    () =>
      apiExhibitions.length > 0
        ? apiExhibitions.map((item, index) => normalizeEventSummary(item, index))
        : [],
    [apiExhibitions],
  )
  const filteredExhibitions = useMemo(() => {
    return normalizedExhibitions
      .filter((item) => {
        const start = parseIsoDate(item.startDate)
        const end = parseIsoDate(item.endDate)
        const matchesStartDate = !startDate || end >= parseIsoDate(startDate)
        const matchesEndDate = !endDate || start <= parseIsoDate(endDate)
        const matchesPeriod = selectedPeriods.length === 0 || selectedPeriods.some((period) =>
          matchesPeriodFilter(item.status, period),
        )
        const matchesPrice = selectedPriceTypes.length === 0 || selectedPriceTypes.includes(item.priceType)

        return matchesStartDate && matchesEndDate && matchesPeriod && matchesPrice
      })
  }, [endDate, normalizedExhibitions, selectedPeriods, selectedPriceTypes, startDate])
  const visibleExhibitions = filteredExhibitions.slice(0, visibleCount)
  const remainingCount = Math.max(filteredExhibitions.length - visibleExhibitions.length, 0)
  const showMatchSortNotice = sortOption === '추천순'

  useEffect(() => {
    const nextSortOption = getSortOptionFromQuery(sortQuery)

    if (nextSortOption === '추천순' && !hasValidAccessTokenForApi()) {
      window.alert(loginRequiredForMatchMessage)
      const previousSortOption = getFallbackSortOption(previousSortOptionRef.current)
      setSortOption(previousSortOption)
      replaceSortSearchParam(previousSortOption, setSearchParams)
      setVisibleCount(initialDisplayCount)
      return
    }

    setSortOption(nextSortOption)
    previousSortOptionRef.current = nextSortOption
    setVisibleCount(initialDisplayCount)
  }, [setSearchParams, sortQuery])

  useEffect(() => {
    let ignore = false

    async function loadEvents() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const coordinates = sortOption === '거리순' ? await getCurrentCoordinates() : undefined

        if (sortOption === '거리순' && !coordinates) {
          throw new ApiError('거리순 정렬을 사용하려면 위치 권한이 필요합니다.', 400)
        }

        if (sortOption === '추천순' && !hasValidAccessTokenForApi()) {
          window.alert(loginRequiredForMatchMessage)
          const previousSortOption = getFallbackSortOption(previousSortOptionRef.current)
          setSortOption(previousSortOption)
          replaceSortSearchParam(previousSortOption, setSearchParams)
          setIsLoading(false)
          return
        }

        const trimmedSearchQuery = searchQuery.trim()
        const shouldUseSearchEndpoint = Boolean(trimmedSearchQuery) || sortOption === '거리순'
        let response: Awaited<ReturnType<typeof getEvents>> | Awaited<ReturnType<typeof searchEvents>>

        if (sortOption === '추천순') {
          response = await getMatchedEvents({
            category: activeFilter === '전체' ? undefined : activeFilter,
            district: selectedDistricts,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
          })
        } else if (shouldUseSearchEndpoint) {
          response = await searchEvents({
            keyword: trimmedSearchQuery || undefined,
            category: activeFilter === '전체' ? undefined : activeFilter,
            district: selectedDistricts,
            status: selectedPeriods.map(toSearchStatus),
            free: toSearchFree(selectedPriceTypes),
            sort: toSearchSort(sortOption),
            lat: coordinates?.lat,
            lng: coordinates?.lng,
            page: 0,
            size: pageSize,
          })
        } else {
          response = await getEvents({
            category: activeFilter === '전체' ? undefined : activeFilter,
            district: selectedDistricts,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            sort: toEventsSort(sortOption),
          })
        }

        if (!ignore) {
          setApiExhibitions(Array.isArray(response) ? response : response.events)
          setVisibleCount(initialDisplayCount)
        }
      } catch (error) {
        if (!ignore) {
          setApiExhibitions([])
          setErrorMessage(
            error instanceof ApiError && error.message
              ? error.message
              : '검색 결과를 불러오지 못했습니다.',
          )
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadEvents()

    return () => {
      ignore = true
    }
  }, [
    activeFilter,
    endDate,
    searchQuery,
    selectedDistricts,
    selectedPeriods,
    selectedPriceTypes,
    setSearchParams,
    sortOption,
    startDate,
  ])

  const resetFilters = () => {
    setActiveFilter('전체')
    setSelectedDistricts([])
    setSelectedPeriods([])
    setSelectedPriceTypes([])
    setStartDate('')
    setEndDate('')
    setVisibleCount(initialDisplayCount)
  }

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

  const showMoreExhibitions = () => {
    const nextStartIndex = visibleExhibitions.length
    setVisibleCount((current) => Math.min(current + pageSize, filteredExhibitions.length))
    requestAnimationFrame(() => {
      if (nextStartIndex < filteredExhibitions.length) {
        nextCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  }

  const handleBookmarkToggle = async (eventId: string, isBookmarked: boolean) => {
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

      setApiExhibitions((current) => updateEventBookmark(current, eventId, !isBookmarked))
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setApiExhibitions((current) => updateEventBookmark(current, eventId, true))
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
    <main className="all-page" aria-label="전시 전체보기">
      <AppHeader
        sectionLinks={[
          { label: '홈', to: '/' },
          { label: '둘러보기', to: '/exhibitions/all', isActive: true },
        ]}
      />

      <div className="all-shell">
        <section className="all-hero" aria-labelledby="all-title">
          <span>All Exhibitions</span>
          <div>
            <h1 id="all-title">
              지금 열리는
              <br />
              <em>모든 행사</em>
            </h1>
            <label className="all-search">
              <span className="all-visually-hidden">행사 검색</span>
              <input
                type="search"
                value={searchQuery}
                placeholder="전시 제목, 장소, 장르 검색..."
                onChange={(event) => {
                  setSearchQuery(event.target.value)
                  setVisibleCount(initialDisplayCount)
                }}
              />
              <SearchIcon />
            </label>
            <p>
              클래식, 전시, 연극, 무용, 축제까지.
              <br />
              큐레이팅된 행사 전체를 탐색하세요.
            </p>
          </div>
          <div className="all-active-tags" aria-label="활성 필터">
            {activeFilter !== '전체' && (
              <FilterTag label={activeFilter} onRemove={() => setActiveFilter('전체')} />
            )}
            {selectedDistricts.map((district) => (
              <FilterTag label={district} key={district} onRemove={() => toggleDistrict(district)} />
            ))}
            {selectedPeriods.map((period) => (
              <FilterTag label={period} key={period} onRemove={() => togglePeriod(period)} />
            ))}
            {selectedPriceTypes.map((priceType) => (
              <FilterTag label={priceType} key={priceType} onRemove={() => togglePriceType(priceType)} />
            ))}
            {startDate && <FilterTag label={`${startDate}부터`} onRemove={() => setStartDate('')} />}
            {endDate && <FilterTag label={`${endDate}까지`} onRemove={() => setEndDate('')} />}
          </div>
        </section>

        <div className="all-layout">
          <button
            className={isMobileFilterOpen ? 'all-filter-overlay is-open' : 'all-filter-overlay'}
            type="button"
            aria-label="필터 닫기"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <aside className={isMobileFilterOpen ? 'all-sidebar is-open' : 'all-sidebar'} aria-label="전시 필터">
            <div className="all-sidebar-title">
              <strong>필터</strong>
              <button type="button" aria-label="필터 닫기" onClick={() => setIsMobileFilterOpen(false)}>×</button>
            </div>
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

            <section className="all-filter-section">
              <h2>날짜 범위</h2>
              <div className="all-date-range">
                <DatePicker
                  label="시작일"
                  value={startDate}
                  isOpen={openCalendar === 'start'}
                  onChange={setStartDate}
                  onToggle={() => setOpenCalendar((current) => current === 'start' ? null : 'start')}
                />
                <DatePicker
                  label="종료일"
                  value={endDate}
                  isOpen={openCalendar === 'end'}
                  onChange={setEndDate}
                  onToggle={() => setOpenCalendar((current) => current === 'end' ? null : 'end')}
                />
              </div>
            </section>

            <button
              className="all-reset"
              type="button"
              onClick={resetFilters}
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
                    const nextSortOption = event.target.value as SortOption

                    if (nextSortOption === '추천순' && !hasValidAccessTokenForApi()) {
                      window.alert(loginRequiredForMatchMessage)
                      const previousSortOption = getFallbackSortOption(previousSortOptionRef.current)
                      setSortOption(previousSortOption)
                      replaceSortSearchParam(previousSortOption, setSearchParams)
                      setVisibleCount(initialDisplayCount)
                      return
                    }

                    setSortOption(nextSortOption)
                    previousSortOptionRef.current = nextSortOption
                    replaceSortSearchParam(nextSortOption, setSearchParams)
                    setVisibleCount(initialDisplayCount)
                  }}
                >
                  {sortOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>
            {showMatchSortNotice && (
              <p className="all-sort-notice">
                추천순은 취향 기반으로 최대 10개의 전시·공연만 표시됩니다.
              </p>
            )}
            <button className="all-mobile-filter-button" type="button" onClick={() => setIsMobileFilterOpen(true)}>
              <FilterIcon />
              필터
            </button>

            {isLoading && <div className="all-state" role="status">전시를 불러오는 중입니다.</div>}

            {!isLoading && errorMessage && (
              <div className="all-state is-error" role="alert">
                {errorMessage}
              </div>
            )}

            {!isLoading && !errorMessage && visibleExhibitions.length === 0 && (
              <div className="all-state">선택한 조건에 맞는 전시가 없습니다.</div>
            )}

            {!isLoading && !errorMessage && visibleExhibitions.length > 0 && (
              <div className="all-grid">
                {visibleExhibitions.map((item, index) => {
                  const isBookmarked = Boolean(item.bookmarked)
                  const isBookmarkPending = item.eventId ? pendingBookmarkIds.has(item.eventId) : false
                  const isBookmarkDisabled = !item.eventId || isBookmarkPending
                  const cardContent = (
                    <>
                      <div className={`all-poster poster-${item.icon}`}>
                        {item.posterImageUrl ? (
                          <img src={item.posterImageUrl} alt="" />
                        ) : (
                          <PosterIcon type={item.icon} />
                        )}
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
                          {item.district} · {item.venue}
                        </p>
                        <h3>{item.title}</h3>
                        <div className="all-card-foot">
                          <div className="all-card-tags">
                            <span className="all-category-chip">{item.category}</span>
                            <span className="all-price-chip">{item.priceType}</span>
                          </div>
                          <span className="all-card-distance">
                            {formatDistanceAndRating(item.distanceKm, item.rating)}
                          </span>
                        </div>
                      </div>
                    </>
                  )

                  return (
                    <article
                      className="all-card"
                      key={item.id || `${item.title}-${index}`}
                      ref={index === visibleCount - pageSize ? nextCardRef : null}
                    >
                      {item.eventId ? (
                        <Link className="all-card-link" to={`/exhibitions/${item.eventId}`}>
                          {cardContent}
                        </Link>
                      ) : (
                        <div className="all-card-link" aria-disabled="true">
                          {cardContent}
                        </div>
                      )}
                      <button
                        className={isBookmarked ? 'all-heart is-liked' : 'all-heart'}
                        type="button"
                        aria-label={isBookmarked ? `${item.title} 즐겨찾기 해제` : `${item.title} 즐겨찾기 추가`}
                        aria-pressed={isBookmarked}
                        disabled={isBookmarkDisabled}
                        onClick={() => {
                          if (item.eventId) {
                            void handleBookmarkToggle(item.eventId, isBookmarked)
                          }
                        }}
                      >
                        <HeartIcon filled={isBookmarked} />
                      </button>
                    </article>
                  )
                })}
              </div>
            )}

            {!isLoading && !errorMessage && visibleExhibitions.length > 0 && <div className="all-more">
              {remainingCount > 0 && (
                <button type="button" onClick={showMoreExhibitions}>
                  더 보기 ({remainingCount})
                </button>
              )}
              <span>
                {filteredExhibitions.length}개 중 {visibleExhibitions.length}개 표시 중
              </span>
            </div>}
          </section>
        </div>
      </div>

      <AppFooter />
    </main>
  )
}

function updateEventBookmark(events: EventSummary[], eventId: string, bookmarked: boolean) {
  return events.map((item) => {
    return getEventId(item) === eventId ? { ...item, bookmarked } : item
  })
}

function toggleListValue<T>(values: T[], value: T) {
  if (values.includes(value)) {
    return values.filter((item) => item !== value)
  }

  return [...values, value]
}

function getAvailabilityLabel(item: AllExhibition, today: Date) {
  const start = parseIsoDate(item.startDate)
  const end = parseIsoDate(item.endDate)

  if (end < today) {
    return '종료'
  }

  if (start > today) {
    return '예정'
  }

  if (isSameDay(end, today)) {
    return '오늘 마감'
  }

  const daysUntilEnd = getDayDifference(today, end)

  return daysUntilEnd <= 7 ? `D-${daysUntilEnd}` : '진행중'
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
  if (!year || !month || !day) {
    return startOfDay(new Date())
  }

  return createLocalDate(year, month, day)
}

function createLocalDate(year: number, month: number, day: number) {
  return new Date(year, month - 1, day)
}

function startOfDay(date: Date) {
  return createLocalDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

function getMonthStart(value = '') {
  const date = value ? parseIsoDate(value) : new Date()

  return createLocalDate(date.getFullYear(), date.getMonth() + 1, 1)
}

function addMonths(date: Date, amount: number) {
  return createLocalDate(date.getFullYear(), date.getMonth() + 1 + amount, 1)
}

function getCalendarDays(month: Date) {
  const firstDayIndex = month.getDay()
  const lastDate = createLocalDate(month.getFullYear(), month.getMonth() + 2, 0).getDate()

  return [
    ...Array.from({ length: firstDayIndex }, () => null),
    ...Array.from(
      { length: lastDate },
      (_, index) => createLocalDate(month.getFullYear(), month.getMonth() + 1, index + 1),
    ),
  ]
}

function formatDateInput(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getDayDifference(from: Date, to: Date) {
  return Math.max(0, Math.ceil((to.getTime() - from.getTime()) / dayInMs))
}

function isSameDay(a: Date, b: Date) {
  return a.getTime() === b.getTime()
}

function normalizeEventSummary(item: EventSummary, index: number): AllExhibition & {
  posterImageUrl?: string
  status: string
  url?: string
  rating?: number
  bookmarked?: boolean
} {
  const eventId = getEventId(item)
  const startDate = item.startDate ?? ''
  const endDate = item.endDate ?? ''
  const district = item.district ?? item.location ?? ''

  return {
    id: eventId ?? '',
    eventId,
    title: item.title ?? '제목 없는 전시',
    category: item.category ?? '전시',
    venue: item.venue ?? '',
    location: item.location ?? district,
    district,
    period: formatPeriod(startDate, endDate),
    startDate,
    endDate,
    priceType: item.free ? '무료' : '유료',
    distanceKm: item.distanceKm ?? item.distance ?? 0,
    icon: getFallbackPosterIcon(index),
    posterImageUrl: item.posterImageUrl,
    status: item.status ?? '',
    url: item.url,
    rating: item.rating ?? item.averageRating,
    bookmarked: item.bookmarked,
  }
}

function getEventId(item: EventSummary) {
  const eventId = item.eventId ?? item.event_id ?? item.id

  return eventId ? String(eventId) : undefined
}

function formatPeriod(startDate: string, endDate: string) {
  return [formatDate(startDate), formatDate(endDate)].filter(Boolean).join(' - ')
}

function formatDate(value: string) {
  return value.replaceAll('-', '.')
}

function getFallbackPosterIcon(index: number): AllExhibitionPosterIcon {
  const icons: AllExhibitionPosterIcon[] = ['filter', 'waves', 'music', 'palette', 'mind', 'dance']

  return icons[index % icons.length]
}

function toSearchSort(sortOption: SortOption): EventSearchSort | undefined {
  const sortByOption: Record<SortOption, EventSearchSort | undefined> = {
    추천순: undefined,
    '마감 임박순': 'deadline',
    최신순: 'latest',
    평점순: 'rating',
    거리순: 'distance',
  }

  return sortByOption[sortOption]
}

function toEventsSort(sortOption: SortOption): EventsSort | undefined {
  const sortByOption: Record<SortOption, EventsSort | undefined> = {
    추천순: undefined,
    '마감 임박순': 'deadline',
    최신순: 'latest',
    평점순: 'rating',
    거리순: undefined,
  }

  return sortByOption[sortOption]
}

function toQuerySort(sortOption: SortOption) {
  const sortByOption: Record<SortOption, string> = {
    추천순: 'match',
    '마감 임박순': 'deadline',
    최신순: 'latest',
    평점순: 'rating',
    거리순: 'distance',
  }

  return sortByOption[sortOption]
}

function replaceSortSearchParam(sortOption: SortOption, setSearchParams: SetSearchParams) {
  const nextSearchParams = new URLSearchParams(
    typeof window === 'undefined' ? undefined : window.location.search,
  )

  nextSearchParams.set('sort', toQuerySort(sortOption))
  setSearchParams(nextSearchParams, { replace: true })
}

function getInitialSortOption(sort: string | null) {
  const sortOption = getSortOptionFromQuery(sort)

  return sortOption === '추천순' && !hasValidAccessTokenForApi() ? fallbackSortOption : sortOption
}

function getSortOptionFromQuery(sort: string | null): SortOption {
  const sortByQuery: Record<string, SortOption> = {
    match: '추천순',
    deadline: '마감 임박순',
    latest: '최신순',
    rating: '평점순',
    distance: '거리순',
  }

  return sort ? sortByQuery[sort] ?? fallbackSortOption : getDefaultSortOption()
}

function getDefaultSortOption() {
  return hasValidAccessTokenForApi() ? '추천순' : fallbackSortOption
}

function getFallbackSortOption(sortOption: SortOption) {
  return sortOption === '추천순' ? fallbackSortOption : sortOption
}

function toSearchStatus(status: PeriodFilter) {
  return status === '진행중' ? 'ONGOING' : 'UPCOMING'
}

function toSearchFree(priceTypes: AllExhibitionPriceType[]) {
  if (priceTypes.length !== 1) {
    return undefined
  }

  return priceTypes[0] === '무료'
}

function matchesPeriodFilter(status: string, period: PeriodFilter) {
  const normalizedStatus = status.toUpperCase()

  if (period === '진행중') {
    return normalizedStatus === 'ONGOING' || status === '진행중'
  }

  return normalizedStatus === 'UPCOMING' || status === '예정'
}

function getCurrentCoordinates(): Promise<{ lat: number; lng: number } | undefined> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return Promise.resolve(undefined)
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      () => resolve(undefined),
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 8_000 },
    )
  })
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

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button type="button" onClick={onRemove}>
      {label}
      <span aria-hidden="true">×</span>
    </button>
  )
}

function DatePicker({
  label,
  value,
  isOpen,
  onChange,
  onToggle,
}: {
  label: string
  value: string
  isOpen: boolean
  onChange: (value: string) => void
  onToggle: () => void
}) {
  const [visibleMonth, setVisibleMonth] = useState(() => getMonthStart(value))
  const days = getCalendarDays(visibleMonth)

  const handleToggle = () => {
    if (!isOpen) {
      setVisibleMonth(getMonthStart(value))
    }

    onToggle()
  }

  return (
    <div className="all-date-picker">
      <span>{label}</span>
      <button className="all-date-trigger" type="button" aria-expanded={isOpen} onClick={handleToggle}>
        {value ? formatDate(value) : '날짜 선택'}
        <CalendarIcon />
      </button>
      {isOpen && (
        <div className="all-calendar" role="dialog" aria-label={`${label} 선택`}>
          <div className="all-calendar-head">
            <button
              type="button"
              aria-label="이전 달"
              onClick={() => setVisibleMonth((month) => addMonths(month, -1))}
            >
              ‹
            </button>
            <strong>{visibleMonth.getFullYear()}년 {visibleMonth.getMonth() + 1}월</strong>
            <button
              type="button"
              aria-label="다음 달"
              onClick={() => setVisibleMonth((month) => addMonths(month, 1))}
            >
              ›
            </button>
          </div>
          <div className="all-calendar-weekdays" aria-hidden="true">
            {['일', '월', '화', '수', '목', '금', '토'].map((weekday) => <span key={weekday}>{weekday}</span>)}
          </div>
          <div className="all-calendar-days">
            {days.map((day, index) => day ? (
              <button
                className={formatDateInput(day) === value ? 'is-selected' : ''}
                type="button"
                key={formatDateInput(day)}
                onClick={() => {
                  onChange(formatDateInput(day))
                  onToggle()
                }}
              >
                {day.getDate()}
              </button>
            ) : <span key={`empty-${index}`} />)}
          </div>
        </div>
      )}
    </div>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="5.5" />
      <path d="m15 15 4 4" />
    </svg>
  )
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16" />
      <path d="M7 12h10" />
      <path d="M10 17h4" />
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
