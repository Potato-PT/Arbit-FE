import { Link } from 'react-router-dom'
import type { RecommendedExhibition } from '../../../types/home'
import { getDaysUntilEnd } from '../utils/homeDateUtils'

export type HomeEventVariant = 'match' | 'closing' | 'new'

type HomeEventSectionProps = {
  eyebrow: string
  id: string
  items: RecommendedExhibition[]
  pendingBookmarkIds?: Set<string>
  title: string
  variant: HomeEventVariant
  onBookmarkToggle: (item: RecommendedExhibition, isBookmarked: boolean) => void
}

function HomeEventSection({
  eyebrow,
  id,
  items,
  pendingBookmarkIds = new Set(),
  title,
  variant,
  onBookmarkToggle,
}: HomeEventSectionProps) {
  return (
    <section className={variant === 'closing' ? 'home-event-section is-alt' : 'home-event-section'} aria-labelledby={id}>
      <div className="home-section-inner">
        <span className="home-eyebrow">{eyebrow}</span>
        <h2 id={id}>{title}</h2>
        <div className="home-horizontal-wrap">
          <div className="home-event-row">
            {items.map((item, index) => {
              const isFavorite = item.bookmarked ?? item.liked
              const isBookmarkPending = item.eventId ? pendingBookmarkIds.has(item.eventId) : false
              const cardContent = (
                <>
                  <div className={`home-event-image poster-${item.artwork}`}>
                    {item.posterImageUrl ? <img src={item.posterImageUrl} alt="" /> : <span className="poster-art" />}
                  </div>
                  <div className="home-event-card-content">
                    <div className="home-event-topline">
                      <span className={`home-event-tag is-${variant}`}>{getCardTag(item, variant)}</span>
                      <span className="home-event-type">{item.category}</span>
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.venue}</p>
                    <p>{item.period}</p>
                  </div>
                </>
              )

              return (
                <article className="home-event-card" key={item.eventId ?? item.id ?? `${item.title}-${index}`}>
                  {item.eventId ? (
                    <Link className="home-event-card-link" to={`/exhibitions/${item.eventId}`}>
                      {cardContent}
                    </Link>
                  ) : (
                    <div className="home-event-card-link" aria-disabled="true">
                      {cardContent}
                    </div>
                  )}
                  <button
                    aria-label={isFavorite ? `${item.title} 즐겨찾기 해제` : `${item.title} 즐겨찾기 추가`}
                    aria-pressed={isFavorite}
                    className="heart-button"
                    disabled={isBookmarkPending}
                    onClick={() => onBookmarkToggle(item, isFavorite)}
                    type="button"
                  >
                    <HeartIcon filled={isFavorite} />
                  </button>
                </article>
              )
            })}
          </div>
          <Link className="home-more-card" to={`/exhibitions/all?sort=${getAllExhibitionsSort(variant)}`}>
            <span>더 보고 싶다면</span>
            <strong>전체보기</strong>
            <b aria-hidden="true">→</b>
          </Link>
        </div>
      </div>
    </section>
  )
}

function getAllExhibitionsSort(variant: HomeEventVariant) {
  const sortByVariant: Record<HomeEventVariant, 'match' | 'deadline' | 'latest'> = {
    match: 'match',
    closing: 'deadline',
    new: 'latest',
  }

  return sortByVariant[variant]
}

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={filled ? 'is-filled' : ''}>
      <path d="M12 20.2s-7.1-4.28-8.75-9A4.55 4.55 0 0 1 11.4 7.1l.6.83.6-.83a4.55 4.55 0 0 1 8.15 4.1c-1.65 4.72-8.75 9-8.75 9Z" />
    </svg>
  )
}

function getCardTag(item: RecommendedExhibition, variant: HomeEventVariant) {
  if (variant === 'match' && typeof item.matchScore === 'number') {
    return `${item.matchScore}%`
  }

  if (variant === 'closing') {
    const daysUntilEnd = getDaysUntilEnd(item.endDate)

    return daysUntilEnd === 0 ? '오늘 마감' : `D-${daysUntilEnd}`
  }

  return variant === 'new' ? '신규' : item.status ?? ''
}

export default HomeEventSection
