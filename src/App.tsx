import { Link } from 'react-router-dom'
import './styles/Home.css'
import logo from './assets/logo.png'
import { heroExhibition, recommendedExhibitions } from './data/homeMock'
import { useAuthStatus } from './hooks/useAuthStatus'
import { useFavoriteExhibitions } from './hooks/useFavoriteExhibitions'

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.6" cy="10.6" r="5.7" />
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

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={filled ? 'is-filled' : ''}>
      <path d="M12 20.2s-7.1-4.28-8.75-9A4.55 4.55 0 0 1 11.4 7.1l.6.83.6-.83a4.55 4.55 0 0 1 8.15 4.1c-1.65 4.72-8.75 9-8.75 9Z" />
    </svg>
  )
}

function App() {
  const heroDetailPath = `/exhibitions/${heroExhibition.id}`
  const { accountLabel, accountPath } = useAuthStatus()
  const { favoriteIdSet, toggleFavorite } = useFavoriteExhibitions()

  return (
    <main className="home-page" aria-label="Arbit home">
      <header className="site-header">
        <Link className="brand" to="/" aria-label="Arbit home">
          <img src={logo} alt="Arbit" />
        </Link>
        <nav className="header-actions" aria-label="Primary">
          <Link to="/exhibitions/search" aria-label="검색">
            <SearchIcon />
          </Link>
          <Link to={accountPath} aria-label={accountLabel}>
            <UserIcon />
          </Link>
        </nav>
      </header>

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
            {heroExhibition.matchRate}% Match
          </span>
          <h1 id="hero-title">
            {heroExhibition.title}
            <span>: {heroExhibition.subtitle}</span>
          </h1>
          <div className="hero-buttons">
            <a href={heroExhibition.homepageUrl} className="primary-link">
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
          <Link to="/exhibitions/search" className="view-all">
            전체보기
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h13" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </Link>
        </div>

        <div className="card-grid">
          {recommendedExhibitions.map((item) => {
            const isFavorite = favoriteIdSet.has(item.id)

            return (
              <article className="exhibition-card" key={item.id}>
                <Link className="exhibition-card-link" to={`/exhibitions/${item.id}`}>
                  <div className={`poster poster-${item.artwork}`}>
                    <span className={`dday ${item.dday === 'D-64' ? 'muted' : ''}`}>{item.dday}</span>
                    <span className="poster-art" />
                  </div>
                  <span className="category">{item.category}</span>
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
      </section>

      <footer className="site-footer">
        <nav aria-label="Footer">
          <a href="/">Privacy</a>
          <a href="/">Terms</a>
          <a href="/">Exhibition Guidelines</a>
          <a href="/">Press</a>
        </nav>
        <p>© 2026 Arbit. All rights reserved.</p>
      </footer>
    </main>
  )
}

export default App
