import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AppHeader from '../../../components/AppHeader'
import AppFooter from '../../../components/AppFooter'
import { ApiError } from '../../user/api/authApi'
import {
  getEventDetail,
  getEventReviews,
  type EventDetail,
  type EventReviewListItem,
} from '../api/eventsApi'
import '../styles/ExhibitionDetail.css'

function ExhibitionDetail() {
  const { id } = useParams()
  const eventId = id
  const [eventDetail, setEventDetail] = useState<EventDetail | null>(null)
  const [eventReviews, setEventReviews] = useState<EventReviewListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [reviewsErrorMessage, setReviewsErrorMessage] = useState('')
  const [isNotFound, setIsNotFound] = useState(false)
  const exhibition = useMemo(
    () => (eventDetail ? normalizeEventDetail(eventDetail) : null),
    [eventDetail],
  )
  const reviews = useMemo(() => eventReviews.map(normalizeReview), [eventReviews])

  useEffect(() => {
    let ignore = false

    async function loadEventDetail(eventId: string) {
      setIsLoading(true)
      setErrorMessage('')
      setReviewsErrorMessage('')
      setIsNotFound(false)

      try {
        const [detailResult, reviewsResult] = await Promise.allSettled([
          getEventDetail(eventId),
          getEventReviews(eventId),
        ])

        if (detailResult.status === 'rejected') {
          throw detailResult.reason
        }

        if (
          reviewsResult.status === 'rejected' &&
          reviewsResult.reason instanceof ApiError &&
          reviewsResult.reason.status === 404
        ) {
          throw reviewsResult.reason
        }

        if (!ignore) {
          setEventDetail(detailResult.value)

          if (reviewsResult.status === 'fulfilled') {
            setEventReviews(reviewsResult.value)
          } else {
            setEventReviews([])
            setReviewsErrorMessage('리뷰 목록을 불러오지 못했습니다.')
          }
        }
      } catch (error) {
        if (ignore) {
          return
        }

        setEventDetail(null)
        setEventReviews([])

        if (error instanceof ApiError && error.status === 404) {
          setIsNotFound(true)
        } else {
          setErrorMessage('이벤트 상세 정보를 불러오지 못했습니다.')
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    if (eventId) {
      void loadEventDetail(eventId)
    } else {
      setIsLoading(false)
      setIsNotFound(true)
    }

    return () => {
      ignore = true
    }
  }, [eventId])

  if (isLoading) {
    return (
      <main className="detail-page">
        <AppHeader />
        <section className="detail-not-found" role="status">
          <h1>이벤트를 불러오는 중입니다.</h1>
        </section>
      </main>
    )
  }

  if (isNotFound) {
    return (
      <main className="detail-page">
        <AppHeader />
        <section className="detail-not-found">
          <h1>이벤트를 찾을 수 없습니다.</h1>
          <Link to="/exhibitions/all">행사 목록으로 돌아가기</Link>
        </section>
      </main>
    )
  }

  if (errorMessage || !exhibition) {
    return (
      <main className="detail-page">
        <AppHeader />
        <section className="detail-not-found" role="alert">
          <h1>{errorMessage || '이벤트 상세 정보를 불러오지 못했습니다.'}</h1>
          <Link to="/exhibitions/all">행사 목록으로 돌아가기</Link>
        </section>
      </main>
    )
  }

  return (
    <main className="detail-page" aria-label={`${exhibition.title} 상세`}>
      <AppHeader />

      <section className="detail-hero" aria-labelledby="detail-title">
        <div className="detail-art" aria-hidden="true">
          {exhibition.posterImageUrl ? (
            <img src={exhibition.posterImageUrl} alt="" />
          ) : (
            <>
              <span className="vessel vessel-small" />
              <span className="vessel vessel-tall" />
              <span className="vessel vessel-ring" />
              <span className="vessel vessel-round" />
              <span className="detail-plinth" />
            </>
          )}
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
                {exhibition.district} · {exhibition.venue}
              </dd>
            </div>
            <div>
              <dt>입장료</dt>
              <dd className="detail-price">
                {exhibition.fee} <span>{exhibition.free ? '/ 무료' : '/ 1인'}</span>
              </dd>
            </div>
            <div>
              <dt>행사 시간</dt>
              <dd>{exhibition.time}</dd>
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

          <a className="homepage-button" href={exhibition.url}>
            홈페이지 바로가기
          </a>
        </div>
      </section>

      <section className="review-section" aria-labelledby="review-title">
        <div className="review-heading">
          <h2 id="review-title">관람객 경험</h2>
          {eventId ? (
            <Link to={`/exhibitions/${eventId}/review`} className="review-write-link">
              후기 작성
              <PencilIcon />
            </Link>
          ) : (
            <span className="review-write-link is-disabled" aria-disabled="true">
              후기 작성
              <PencilIcon />
            </span>
          )}
        </div>

        {reviewsErrorMessage && (
          <div className="review-state is-error" role="alert">
            {reviewsErrorMessage}
          </div>
        )}

        {!reviewsErrorMessage && reviews.length === 0 && (
          <div className="review-state">아직 작성된 리뷰가 없습니다.</div>
        )}

        {!reviewsErrorMessage && reviews.length > 0 && (
          <div className="review-grid">
            {reviews.map((review) => (
              <article className="review-card" key={review.id}>
                <div className="review-rating" aria-label={`별점 ${review.rating}`}>
                  {'★'.repeat(review.rating)}
                  {'☆'.repeat(5 - review.rating)}
                </div>
                {review.verificationImageUrl && (
                  <img className="review-image" src={review.verificationImageUrl} alt="" />
                )}
                <p>{review.content}</p>
                <div className="reviewer">
                  <span className={`avatar avatar-${review.tone}`} />
                  <div>
                    <strong>관람객 리뷰</strong>
                    <small>{review.createdAt}</small>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <AppFooter />
    </main>
  )
}

function normalizeEventDetail(item: EventDetail) {
  const id = item.eventId ?? ''
  const startDate = item.startDate ?? ''
  const endDate = item.endDate ?? ''
  const tags = item.keyword ?? []
  const rating = item.rating ?? 0
  const fee = item.price ?? (item.free ? '무료' : '유료')

  return {
    id,
    title: item.title ?? '제목 없는 이벤트',
    category: item.category ?? '전시',
    posterImageUrl: item.posterImageUrl,
    url: item.url ?? item.homepageUrl ?? '#',
    district: item.district ?? item.location ?? '',
    venue: item.venue ?? '',
    period: formatPeriod(startDate, endDate),
    startDate,
    endDate,
    fee,
    time: item.time ?? item.eventTime ?? '',
    free: Boolean(item.free),
    tags,
    status: item.status ?? '',
    rating,
    bookmarked: Boolean(item.bookmarked),
  }
}

function normalizeReview(review: EventReviewListItem, index: number) {
  const rating = review.rating ?? 0

  return {
    id: String(review.id ?? index),
    rating: Math.max(0, Math.min(5, Math.round(rating))),
    content: review.content ?? '',
    verificationImageUrl: review.verificationImageUrl ?? '',
    createdAt: formatReviewDate(review.createdAt),
    tone: (['warm', 'soft', 'blush'] as const)[index % 3],
  }
}

function formatPeriod(startDate: string, endDate: string) {
  return [formatDate(startDate), formatDate(endDate)].filter(Boolean).join(' - ')
}

function formatDate(value: string) {
  return value.replaceAll('-', '.')
}

function formatReviewDate(value: string) {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value.replace('T', ' ').slice(0, 16)
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
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
