import { Link } from 'react-router-dom'
import './styles/Home.css'
import { heroExhibition, recommendedExhibitions } from './data/homeMock'
import { useFavoriteExhibitions } from './hooks/useFavoriteExhibitions'
import AppHeader from './components/AppHeader'
import AppFooter from './components/AppFooter'

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={filled ? 'is-filled' : ''}>
      <path d="M12 20.2s-7.1-4.28-8.75-9A4.55 4.55 0 0 1 11.4 7.1l.6.83.6-.83a4.55 4.55 0 0 1 8.15 4.1c-1.65 4.72-8.75 9-8.75 9Z" />
    </svg>
  )
}

function App() {
  const heroDetailPath = `/exhibitions/${heroExhibition.id}`
  const { favoriteIdSet, toggleFavorite } = useFavoriteExhibitions()

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
          <Link to="/exhibitions/all" className="view-all">
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

      <AppFooter />
    </main>
  )
}

export default App
