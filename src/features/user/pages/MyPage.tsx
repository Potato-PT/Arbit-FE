import { useState } from 'react'
import { Link } from 'react-router-dom'
import AppHeader from '../../../components/AppHeader'
import AppFooter from '../../../components/AppFooter'
import {
  favoriteExhibitions,
  myReviews,
  preferenceTags,
  profile,
  type FavoriteExhibition,
  type MyPageTab,
  type MyReview,
} from '../data/myPageMock'
import { useFavoriteExhibitions } from '../../../hooks/useFavoriteExhibitions'
import '../styles/MyPage.css'

const tabs: { id: MyPageTab; label: string }[] = [
  { id: 'favorites', label: '즐겨찾기' },
  { id: 'reviews', label: '나의 후기' },
  { id: 'preferences', label: '취향 설정' },
]

function MyPage() {
  const [activeTab, setActiveTab] = useState<MyPageTab>('favorites')
  const { favoriteIdSet, toggleFavorite } = useFavoriteExhibitions()

  return (
    <main className="mypage" aria-label="마이페이지">
      <AppHeader />

      <section className="profile-section" aria-labelledby="profile-name">
        <div className="profile-avatar" role="img" aria-label={profile.avatarAlt}>
          <span className="avatar-face" />
          <button className="avatar-edit" type="button" aria-label="프로필 수정">
            <PencilIcon />
          </button>
        </div>
        <div>
          <h1 id="profile-name">{profile.name}</h1>
          <p>가입일: {profile.joinedAt}</p>
        </div>
      </section>

      <section className="mypage-content" aria-label="마이페이지 콘텐츠">
        <div className="mypage-tabs" role="tablist" aria-label="마이페이지 탭">
          {tabs.map((tab) => (
            tab.id === 'preferences' ? (
              <Link className="mypage-tab" role="tab" aria-selected="false" key={tab.id} to="/user/preferences">
                {tab.label}
              </Link>
            ) : (
              <button
                className={activeTab === tab.id ? 'mypage-tab is-active' : 'mypage-tab'}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            )
          ))}
        </div>

        {activeTab === 'favorites' && (
          <FavoritesPanel favoriteIdSet={favoriteIdSet} onToggleFavorite={toggleFavorite} />
        )}
        {activeTab === 'reviews' && <ReviewsPanel />}
        {activeTab === 'preferences' && (
          <div className="mypage-empty" role="tabpanel">
            <p>취향 설정 화면은 기존 구조를 유지합니다.</p>
          </div>
        )}
      </section>

      <AppFooter />
    </main>
  )
}

function ReviewsPanel() {
  return (
    <div className="reviews-panel" role="tabpanel" aria-label="나의 후기">
      <section className="preference-block" aria-labelledby="review-preference-title">
        <h2 id="review-preference-title">나의 취향</h2>
        <div className="preference-tags">
          {preferenceTags.map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>
      </section>

      <div className="review-list">
        {myReviews.map((review) => (
          <article className="my-review-card" key={review.id}>
            <div className={`review-poster review-poster-${review.posterTone}`} aria-hidden="true">
              <span className="review-poster-sheet">
                <span className="review-poster-title">{getPosterTitle(review.posterTone)}</span>
                <span className="review-poster-subtitle">EXHIBITION</span>
                <span className="review-poster-lines" />
              </span>
            </div>

            <div className="review-card-body">
              <div className="review-card-head">
                <div>
                  <h3>{review.title}</h3>
                  <StarRating rating={review.rating} />
                </div>
                {review.isPublic && <span className="review-public-badge">PUBLIC</span>}
              </div>

              <p className="review-copy">{review.content}</p>

              <div className="review-card-foot">
                <span>{review.visitedAt}</span>
                <div className="review-actions">
                  <span>
                    <ThumbIcon />
                    {review.likes}
                  </span>
                  <button type="button" aria-label={`${review.title} 후기 공유`}>
                    <ShareIcon />
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function getPosterTitle(tone: MyReview['posterTone']) {
  if (tone === 'mint') {
    return 'JOURNEY'
  }

  if (tone === 'mono') {
    return 'POSTER'
  }

  return 'LIGHT'
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="my-review-rating" aria-label={`별점 ${rating}점`}>
      {'★'.repeat(rating)}
      {'☆'.repeat(5 - rating)}
    </div>
  )
}

interface FavoritesPanelProps {
  favoriteIdSet: Set<string>
  onToggleFavorite: (id: string) => void
}

function FavoritesPanel({ favoriteIdSet, onToggleFavorite }: FavoritesPanelProps) {
  const visibleFavoriteExhibitions = favoriteExhibitions.filter((item) => favoriteIdSet.has(item.id))

  return (
    <div className="favorites-panel" role="tabpanel">
      <section className="preference-block" aria-labelledby="preference-title">
        <h2 id="preference-title">나의 취향</h2>
        <div className="preference-tags">
          {preferenceTags.map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>
      </section>

      <div className="favorite-grid">
        {visibleFavoriteExhibitions.map((item) => (
          <FavoriteCard item={item} key={item.id} onToggleFavorite={onToggleFavorite} />
        ))}
      </div>

      {visibleFavoriteExhibitions.length === 0 && (
        <div className="favorite-empty" role="status">
          <p>즐겨찾기한 전시가 없습니다.</p>
          <Link to="/exhibitions/search">전시 검색으로 이동</Link>
        </div>
      )}
    </div>
  )
}

function FavoriteCard({
  item,
  onToggleFavorite,
}: {
  item: FavoriteExhibition
  onToggleFavorite: (id: string) => void
}) {
  return (
    <article className="favorite-card">
      <Link className="favorite-card-link" to={`/exhibitions/${item.id}`}>
        <div className={`favorite-poster favorite-poster-${item.artwork}`}>
          <span className="favorite-dday">{item.dday}</span>
          <span className="favorite-art" />
        </div>
        <span className="favorite-category">{item.category}</span>
        <h3>{item.title}</h3>
        <p className="favorite-meta">
          <CalendarIcon />
          {item.period}
        </p>
        <p className="favorite-meta">
          <PinIcon />
          {item.venue}
        </p>
      </Link>
      <button
        aria-label={`${item.title} 즐겨찾기 해제`}
        aria-pressed={true}
        className="favorite-heart"
        onClick={() => onToggleFavorite(item.id)}
        type="button"
      >
        <HeartIcon filled />
      </button>
    </article>
  )
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m4 20 4.7-1 10-10a2.2 2.2 0 0 0-3.1-3.1l-10 10L4 20Z" />
      <path d="m13.8 7.7 2.5 2.5" />
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

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3v3" />
      <path d="M17 3v3" />
      <path d="M5 8h14" />
      <path d="M6 5h12a1 1 0 0 1 1 1v13H5V6a1 1 0 0 1 1-1Z" />
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

function ThumbIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.8 20H5a1.5 1.5 0 0 1-1.5-1.5v-6A1.5 1.5 0 0 1 5 11h2.8" />
      <path d="M7.8 11 11 4.7c.35-.7 1.2-1 1.9-.65.52.25.85.78.82 1.36L13.5 10h5.2a1.8 1.8 0 0 1 1.76 2.16l-1.02 5A3.5 3.5 0 0 1 16 20H7.8V11Z" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="18" cy="5" r="2.4" />
      <circle cx="6" cy="12" r="2.4" />
      <circle cx="18" cy="19" r="2.4" />
      <path d="m8.2 10.9 7.6-4.8" />
      <path d="m8.2 13.1 7.6 4.8" />
    </svg>
  )
}

export default MyPage
