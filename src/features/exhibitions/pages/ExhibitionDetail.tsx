import { Link, useParams } from 'react-router-dom'
import AppHeader from '../../../components/AppHeader'
import AppFooter from '../../../components/AppFooter'
import { getExhibitionDetail } from '../data/exhibitionDetails'
import '../styles/ExhibitionDetail.css'

function ExhibitionDetail() {
  const { id } = useParams()
  const exhibition = getExhibitionDetail(id)

  if (!exhibition) {
    return (
      <main className="detail-page">
        <AppHeader />
        <section className="detail-not-found">
          <h1>전시를 찾을 수 없습니다</h1>
          <Link to="/exhibitions/search">전시 검색으로 돌아가기</Link>
        </section>
      </main>
    )
  }

  return (
    <main className="detail-page" aria-label={`${exhibition.title} 상세`}>
      <AppHeader />

      <section className="detail-hero" aria-labelledby="detail-title">
        <div className={`detail-art detail-art-${exhibition.artwork}`} aria-hidden="true">
          <span className="vessel vessel-small" />
          <span className="vessel vessel-tall" />
          <span className="vessel vessel-ring" />
          <span className="vessel vessel-round" />
          <span className="detail-plinth" />
        </div>

        <div className="detail-summary">
          <div className="detail-kicker">
            <span>{exhibition.status}</span>
            <span className="detail-stars" aria-label={`평점 ${exhibition.rating}`}>
              ★★★★★
            </span>
            <strong>({exhibition.rating.toFixed(1)})</strong>
          </div>
          <h1 id="detail-title">{exhibition.title}</h1>

          <dl className="detail-info">
            <div>
              <dt>기간</dt>
              <dd>{exhibition.period}</dd>
            </div>
            <div>
              <dt>장소</dt>
              <dd>
                <PinIcon />
                {exhibition.venue}, {exhibition.hall}
              </dd>
            </div>
            <div>
              <dt>입장료</dt>
              <dd className="detail-price">
                {exhibition.price} <span>/ 1인</span>
              </dd>
            </div>
            <div>
              <dt>행사 시간</dt>
              <dd>{exhibition.eventTime}</dd>
            </div>
            <div>
              <dt>태그</dt>
              <dd className="detail-tags">
                {exhibition.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </dd>
            </div>
          </dl>

          <a className="homepage-button" href={exhibition.homepageUrl}>
            홈페이지 바로가기
          </a>
        </div>
      </section>

      <section className="review-section" aria-labelledby="review-title">
        <div className="review-heading">
          <h2 id="review-title">관람객 경험</h2>
          <Link to={`/exhibitions/${exhibition.id}/review`} className="review-write-link">
            후기 작성
            <PencilIcon />
          </Link>
        </div>
        <div className="review-grid">
          {exhibition.reviews.map((review) => (
            <article className="review-card" key={review.id}>
              <div className="review-rating" aria-label={`별점 ${review.rating}`}>
                {'★'.repeat(review.rating)}
                {'☆'.repeat(5 - review.rating)}
              </div>
              <p>{review.content}</p>
              <div className="reviewer">
                <span className={`avatar avatar-${review.tone}`} />
                <div>
                  <strong>
                    {review.author}
                    {!review.isPublic && <span className="private-review-badge">비공개</span>}
                  </strong>
                  <small>{review.visitedAt}</small>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <AppFooter />
    </main>
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

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m4 20 4.7-1 10-10a2.2 2.2 0 0 0-3.1-3.1l-10 10L4 20Z" />
      <path d="m13.8 7.7 2.5 2.5" />
    </svg>
  )
}

export default ExhibitionDetail
