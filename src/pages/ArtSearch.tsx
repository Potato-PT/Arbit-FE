import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import logo from '../assets/logo.png'
import { genreFilters, searchExhibitions, seoulDistricts } from '../data/searchMock'
import '../styles/ArtSearch.css'

type SortOption = '거리순' | '낮은 가격순'

const periodFilters = ['진행중', '예정'] as const
const priceFilters = ['무료', '유료'] as const

function ArtSearch() {
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>(['마포구'])
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['사진/영상'])
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>(['진행중'])
  const [selectedPriceTypes, setSelectedPriceTypes] = useState<string[]>(['무료', '유료'])
  const [districtQuery, setDistrictQuery] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState<SortOption>('거리순')

  const filteredExhibitions = useMemo(() => {
    const normalizedDistrictQuery = districtQuery.trim().toLowerCase()
    const normalizedSearchQuery = searchQuery.trim().toLowerCase()

    return searchExhibitions
      .filter((item) => {
        const matchesDistrict =
          selectedDistricts.length === 0 ||
          selectedDistricts.includes(item.district) ||
          selectedDistricts.includes(item.location)
        const matchesDistrictQuery =
          normalizedDistrictQuery.length === 0 ||
          item.district.toLowerCase().includes(normalizedDistrictQuery) ||
          item.location.toLowerCase().includes(normalizedDistrictQuery)
        const matchesGenre =
          selectedGenres.length === 0 || selectedGenres.includes(item.category)
        const matchesPeriod =
          selectedPeriods.length === 0 || selectedPeriods.includes(item.periodStatus)
        const matchesPrice =
          selectedPriceTypes.length === 0 || selectedPriceTypes.includes(item.priceType)
        const matchesSearch =
          normalizedSearchQuery.length === 0 ||
          item.title.toLowerCase().includes(normalizedSearchQuery) ||
          item.venue.toLowerCase().includes(normalizedSearchQuery) ||
          item.category.toLowerCase().includes(normalizedSearchQuery)

        return (
          matchesDistrict &&
          matchesDistrictQuery &&
          matchesGenre &&
          matchesPeriod &&
          matchesPrice &&
          matchesSearch
        )
      })
      .sort((a, b) => {
        if (sortOption === '낮은 가격순') {
          return getPriceValue(a.price) - getPriceValue(b.price)
        }

        return a.distanceKm - b.distanceKm
      })
  }, [
    districtQuery,
    searchQuery,
    selectedDistricts,
    selectedGenres,
    selectedPeriods,
    selectedPriceTypes,
    sortOption,
  ])

  const toggleDistrict = (district: string) => {
    setSelectedDistricts((current) => toggleListValue(current, district))
  }

  const toggleGenre = (genre: string) => {
    setSelectedGenres((current) => toggleListValue(current, genre))
  }

  const togglePeriod = (period: string) => {
    setSelectedPeriods((current) => toggleListValue(current, period))
  }

  const togglePriceType = (priceType: string) => {
    setSelectedPriceTypes((current) => toggleListValue(current, priceType))
  }

  const handleSortClick = () => {
    setSortOption((current) => (current === '거리순' ? '낮은 가격순' : '거리순'))
  }

  return (
    <main className="search-page" aria-label="전시 검색">
      <header className="search-header">
        <Link className="search-brand" to="/" aria-label="Arbit home">
          <img src={logo} alt="Arbit" />
        </Link>
        <nav className="search-header-actions" aria-label="Primary">
          <button type="button" aria-label="검색">
            <SearchIcon />
          </button>
          <Link to="/login" aria-label="로그인">
            <UserIcon />
          </Link>
        </nav>
      </header>

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

          {filteredExhibitions.length > 0 ? (
            <div className="result-grid">
              {filteredExhibitions.map((item) => (
                <Link className="result-card" key={item.id} to={`/exhibitions/${item.id}`}>
                  <div className={`result-art result-art-${item.artwork}`}>
                    {item.badge ? <span className="result-badge">{item.badge}</span> : null}
                    <span className="art-shape" />
                  </div>
                  <div className="result-body">
                    <p className="result-meta">
                      {item.category} · {item.location}
                    </p>
                    <h2>{item.title}</h2>
                    <p className="result-venue">{item.venue}</p>
                    <div className="result-footer">
                      <strong>{item.price}</strong>
                      <span
                        className={item.liked ? 'result-heart is-liked' : 'result-heart'}
                        aria-label={`${item.title} 찜하기`}
                        role="img"
                      >
                        <HeartIcon filled={item.liked} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-results">
              <p>선택한 조건에 맞는 전시가 없습니다</p>
            </div>
          )}

          <button className="load-more" type="button">
            전시 더보기
          </button>
        </section>
      </div>
    </main>
  )
}

function toggleListValue(values: string[], value: string) {
  if (values.includes(value)) {
    return values.filter((item) => item !== value)
  }

  return [...values, value]
}

function getPriceValue(price: string) {
  if (price === '무료') {
    return 0
  }

  return Number(price.replace(/[^0-9]/g, '')) || 0
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

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.7" cy="10.7" r="5.6" />
      <path d="m15 15 4.2 4.2" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8.3" r="3" />
      <path d="M7.1 17.2c.85-2.45 2.48-3.68 4.9-3.68s4.05 1.23 4.9 3.68" />
      <circle cx="12" cy="12" r="9" />
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

export default ArtSearch
