import { type MouseEvent, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AppHeader from '../../../components/AppHeader'
import AppFooter from '../../../components/AppFooter'
import StatusMessage from '../../../components/StatusMessage'
import { readAccessToken } from '../../../api/authStorage'
import { ApiError } from '../../user/api/authApi'
import {
  deleteEventReview,
  getEventDetail,
  getEventReviews,
  recordHomepageClick,
  type EventDetail,
  type EventReviewListItem,
} from '../api/eventsApi'
import { addBookmark, removeBookmark } from '../api/bookmarksApi'
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
  const [isBookmarkPending, setIsBookmarkPending] = useState(false)
  const [pendingDeleteReviewIds, setPendingDeleteReviewIds] = useState<Set<string>>(() => new Set())
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

  const handleBookmarkToggle = async (isBookmarked: boolean) => {
    if (!eventId) {
      window.alert('이벤트 정보를 찾을 수 없습니다.')
      return
    }

    if (!readAccessToken()) {
      window.alert('로그인이 필요합니다.')
      return
    }

    setIsBookmarkPending(true)

    try {
      if (isBookmarked) {
        await removeBookmark(eventId)
      } else {
        await addBookmark(eventId)
      }

      setEventDetail((current) => (current ? { ...current, bookmarked: !isBookmarked } : current))
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setEventDetail((current) => (current ? { ...current, bookmarked: true } : current))
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
      setIsBookmarkPending(false)
    }
  }

  const handleReviewDelete = async (reviewId: string) => {
    if (!eventId) {
      window.alert('이벤트 정보를 찾을 수 없습니다.')
      return
    }

    if (!readAccessToken()) {
      window.alert('로그인이 필요합니다.')
      return
    }

    if (!window.confirm('이 리뷰를 삭제하시겠습니까?')) {
      return
    }

    setPendingDeleteReviewIds((current) => new Set(current).add(reviewId))

    try {
      await deleteEventReview(eventId, reviewId)
      setEventReviews((current) => current.filter((review) => String(review.id) !== reviewId))
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          window.alert('로그인이 필요합니다.')
          return
        }

        if (error.status === 403) {
          window.alert('본인이 작성한 리뷰만 삭제할 수 있습니다.')
          return
        }

        if (error.status === 404) {
          window.alert('이미 삭제되었거나 찾을 수 없는 리뷰입니다.')
          setEventReviews((current) => current.filter((review) => String(review.id) !== reviewId))
          return
        }
      }

      window.alert('리뷰를 삭제하지 못했습니다.')
    } finally {
      setPendingDeleteReviewIds((current) => {
        const next = new Set(current)
        next.delete(reviewId)
        return next
      })
    }
  }

  const handleHomepageClick = (event: MouseEvent<HTMLAnchorElement>, url: string) => {
    event.preventDefault()

    const normalizedUrl = normalizeExternalHomepageUrl(url)

    if (!normalizedUrl) {
      window.alert('홈페이지 주소가 없습니다.')
      return
    }

    if (eventId) {
      void recordHomepageClick(eventId).catch(() => undefined)
    }

    window.open(normalizedUrl, '_blank', 'noopener,noreferrer')
  }

  if (isLoading) {
    return (
      <main className="detail-page">
        <AppHeader />
        <section className="detail-loading">
          <StatusMessage>
            전시 정보를 불러오는 중입니다.
          </StatusMessage>
        </section>
      </main>
    )
  }

  if (isNotFound) {
    return (
      <main className="detail-page">
        <AppHeader />
        <DetailState title="전시를 찾을 수 없습니다." eyebrow="Not Found" />
      </main>
    )
  }

  if (errorMessage || !exhibition) {
    return (
      <main className="detail-page">
        <AppHeader />
        <DetailState
          title={errorMessage || '전시 상세 정보를 불러오지 못했습니다.'}
          eyebrow="Unavailable"
          role="alert"
        />
      </main>
    )
  }

  const renderHomepageButton = (label: string) => {
    const homepageUrl = normalizeExternalHomepageUrl(exhibition.url)

    if (!homepageUrl) {
      return (
        <span className="homepage-button is-disabled" aria-disabled="true" title="홈페이지 주소가 없습니다.">
          홈페이지 없음
          <ExternalLinkIcon />
        </span>
      )
    }

    return (
      <a
        className="homepage-button"
        href={homepageUrl}
        target="_blank"
        rel="noreferrer"
        onClick={(event) => {
          handleHomepageClick(event, homepageUrl)
        }}
      >
        {label}
        <ExternalLinkIcon />
      </a>
    )
  }

  return (
    <main className="detail-page" aria-label={`${exhibition.title} 상세`}>
      <AppHeader />

      <section className="detail-hero" aria-labelledby="detail-title">
        {exhibition.posterImageUrl && (
          <div
            className="detail-hero-bg"
            style={{ backgroundImage: `url(${exhibition.posterImageUrl})` }}
            aria-hidden="true"
          />
        )}
        <div className="detail-hero-overlay" aria-hidden="true" />

        <nav className="detail-breadcrumb" aria-label="탐색 경로">
          <Link to="/">홈</Link>
          <span>/</span>
          <Link to="/exhibitions/all">둘러보기</Link>
          <span>/</span>
          <strong>전시 상세</strong>
        </nav>

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
            <span className="detail-stars" aria-label={`평점 ${exhibition.rating.toFixed(1)}`}>
              <span>{'★'.repeat(getRoundedRating(exhibition.rating))}</span>
              <i>{'★'.repeat(5 - getRoundedRating(exhibition.rating))}</i>
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
                {exhibition.fee}
                {exhibition.priceUnit && <span>{exhibition.priceUnit}</span>}
              </dd>
            </div>
            <div>
              <dt>행사 시간</dt>
              <dd>{exhibition.time}</dd>
            </div>
            <div>
              <dt>태그</dt>
              <dd className="detail-tags">
                {exhibition.tags.length > 0 ? (
                  exhibition.tags.map((tag, index) => (
                    <span className={index > 1 ? 'is-outline' : undefined} key={tag}>
                      {tag}
                    </span>
                  ))
                ) : (
                  <span>전시</span>
                )}
              </dd>
            </div>
          </dl>

          <div className="detail-actions">
            {renderHomepageButton('홈페이지 이동하기')}
            <button
              className="bookmark-button"
              type="button"
              aria-pressed={exhibition.bookmarked}
              disabled={isBookmarkPending}
              onClick={() => void handleBookmarkToggle(exhibition.bookmarked)}
            >
              <BookmarkIcon />
              북마크
            </button>
          </div>
        </div>
      </section>

      <section className="review-section" aria-labelledby="review-title">
        <div className="review-heading">
          <div className="review-title-group">
            <span aria-hidden="true">Reviews</span>
            <h2 id="review-title">관람객 경험</h2>
          </div>
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
                <div className="review-card-top">
                  <div className="review-rating" aria-label={`별점 ${review.rating}`}>
                    <span>{'★'.repeat(review.rating)}</span>
                    <i>{'★'.repeat(5 - review.rating)}</i>
                  </div>
                  <button
                    className="review-delete-button"
                    type="button"
                    disabled={pendingDeleteReviewIds.has(review.id)}
                    onClick={() => void handleReviewDelete(review.id)}
                  >
                    <TrashIcon />
                    삭제
                  </button>
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

      <div className="sticky-detail-actions">
        {renderHomepageButton('홈페이지')}
        <button
          className="bookmark-button"
          type="button"
          aria-pressed={exhibition.bookmarked}
          disabled={isBookmarkPending}
          onClick={() => void handleBookmarkToggle(exhibition.bookmarked)}
        >
          <BookmarkIcon />
        </button>
      </div>
    </main>
  )
}

function normalizeEventDetail(item: EventDetail) {
  const id = item.eventId ?? ''
  const startDate = item.startDate ?? ''
  const endDate = item.endDate ?? ''
  const tags = item.keyword ?? []
  const rating = item.rating ?? 0
  const rawFee = item.price?.trim()
  const free = Boolean(item.free) || rawFee === '무료'
  const fee = rawFee || (free ? '무료' : '유료')
  const priceUnit = free ? '' : '/ 1인'

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
    priceUnit,
    time: item.time ?? item.eventTime ?? '',
    free,
    tags,
    status: item.status ?? '',
    rating,
    bookmarked: Boolean(item.bookmarked),
  }
}

function normalizeExternalHomepageUrl(url?: string | null) {
  const trimmedUrl = url?.trim()

  if (!trimmedUrl || trimmedUrl === '#') {
    return ''
  }

  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl
  }

  return `https://${trimmedUrl}`
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

function getRoundedRating(rating: number) {
  return Math.max(0, Math.min(5, Math.round(rating)))
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

function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
    </svg>
  )
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 21 12 17 5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6 18 20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  )
}

function DetailState({
  title,
  eyebrow,
  role,
}: {
  title: string
  eyebrow: string
  role?: 'status' | 'alert'
}) {
  return (
    <section className="detail-state" role={role}>
      <span>{eyebrow}</span>
      <h1>{title}</h1>
      {role !== 'status' && <Link to="/exhibitions/all">전시 목록으로 돌아가기</Link>}
    </section>
  )
}

export default ExhibitionDetail
