import { useMemo, useState, type ComponentProps } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AppHeader from '../../../components/AppHeader'
import AppFooter from '../../../components/AppFooter'
import { readAccessToken } from '../../../api/authStorage'
import { ApiError } from '../../user/api/authApi'
import { createEventReview } from '../api/eventsApi'
import { getExhibitionDetail } from '../data/exhibitionDetails'
import '../styles/ReviewWrite.css'

type FormSubmitHandler = NonNullable<ComponentProps<'form'>['onSubmit']>

const visitYears = ['2026', '2025', '2024', '2023', '2022']
const visitMonths = Array.from({ length: 12 }, (_, index) => String(index + 1))

function ReviewWrite() {
  const { id } = useParams()
  const navigate = useNavigate()
  const exhibition = getExhibitionDetail(id)
  const exhibitionTitle = exhibition?.title ?? '이벤트'
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [verificationImageUrl, setVerificationImageUrl] = useState('')
  const [visitedYear, setVisitedYear] = useState('')
  const [visitedMonth, setVisitedMonth] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formattedVisit = useMemo(() => {
    if (!visitedYear || !visitedMonth) {
      return ''
    }

    return `${visitedYear}년 ${Number(visitedMonth)}월 방문`
  }, [visitedMonth, visitedYear])

  if (!id) {
    return (
      <main className="review-write-page">
        <AppHeader />
        <section className="review-write-missing">
          <h1>전시를 찾을 수 없습니다</h1>
          <Link to="/exhibitions/search">전시 검색으로 돌아가기</Link>
        </section>
      </main>
    )
  }

  const exhibitionId = id
  const detailPath = `/exhibitions/${exhibitionId}`

  const handleSubmit: FormSubmitHandler = async (event) => {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    if (!readAccessToken()) {
      setError('로그인이 필요합니다.')
      setSuccessMessage('')
      return
    }

    if (!content.trim()) {
      setError('후기 내용을 입력해 주세요.')
      setSuccessMessage('')
      return
    }

    if (!formattedVisit) {
      setError('방문 시점을 선택해 주세요.')
      setSuccessMessage('')
      return
    }

    if (!verificationImageUrl.trim()) {
      setError('인증 이미지 URL을 입력해 주세요.')
      setSuccessMessage('')
      return
    }

    setIsSubmitting(true)
    setError('')
    setSuccessMessage('')

    try {
      await createEventReview(exhibitionId, {
        rating,
        content: content.trim(),
        verificationImageUrl: verificationImageUrl.trim(),
      })
      setSuccessMessage('리뷰 작성이 완료되었습니다.')
      window.setTimeout(() => navigate(detailPath), 900)
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setError('로그인이 필요합니다.')
      } else {
        setError('리뷰를 저장하지 못했습니다.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="review-write-page" aria-label={`${exhibitionTitle} 후기 작성`}>
      <AppHeader />

      <section className="review-write-shell" aria-labelledby="review-write-title">
        <div className="review-write-intro">
          <span>Review</span>
          <h1 id="review-write-title">후기 작성</h1>
          <p>{exhibitionTitle}</p>
        </div>

        <form className="review-write-form" onSubmit={handleSubmit}>
          <fieldset className="review-rating-field">
            <legend>별점</legend>
            <div className="star-picker" role="radiogroup" aria-label="별점 선택">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  aria-checked={rating === score}
                  aria-label={`${score}점`}
                  className={score <= rating ? 'is-selected' : ''}
                  key={score}
                  onClick={() => setRating(score)}
                  role="radio"
                  disabled={isSubmitting}
                  type="button"
                >
                  <StarIcon />
                </button>
              ))}
            </div>
          </fieldset>

          <label className="review-field">
            <span>후기 본문</span>
            <textarea
              maxLength={600}
              onChange={(event) => {
                setContent(event.target.value)
                setError('')
                setSuccessMessage('')
              }}
              placeholder="전시에서 인상 깊었던 작품, 공간, 관람 경험을 남겨주세요."
              value={content}
              disabled={isSubmitting}
            />
          </label>

          <label className="review-field">
            <span>인증 이미지 URL</span>
            <input
              onChange={(event) => {
                setVerificationImageUrl(event.target.value)
                setError('')
                setSuccessMessage('')
              }}
              placeholder="관람 인증 이미지 URL을 입력해주세요."
              type="url"
              value={verificationImageUrl}
              disabled={isSubmitting}
            />
          </label>

          <fieldset className="review-visit-field">
            <legend>방문 시점</legend>
            <div className="visit-selects">
              <label>
                <span>연도</span>
                <select
                  onChange={(event) => setVisitedYear(event.target.value)}
                  value={visitedYear}
                  disabled={isSubmitting}
                >
                  <option value="">선택</option>
                  {visitYears.map((year) => (
                    <option key={year} value={year}>
                      {year}년
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>월</span>
                <select
                  onChange={(event) => setVisitedMonth(event.target.value)}
                  value={visitedMonth}
                  disabled={isSubmitting}
                >
                  <option value="">선택</option>
                  {visitMonths.map((month) => (
                    <option key={month} value={month}>
                      {month}월
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </fieldset>

          <fieldset className="review-public-field">
            <legend>공개 여부</legend>
            <label>
              <input
                checked={isPublic}
                name="visibility"
                onChange={() => setIsPublic(true)}
                disabled={isSubmitting}
                type="radio"
              />
              공개
            </label>
            <label>
              <input
                checked={!isPublic}
                name="visibility"
                onChange={() => setIsPublic(false)}
                disabled={isSubmitting}
                type="radio"
              />
              비공개
            </label>
          </fieldset>

          {error && <p className="review-error">{error}</p>}
          {successMessage && <p className="review-success">{successMessage}</p>}

          <div className="review-write-actions">
            <button className="review-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? '제출 중' : '제출'}
            </button>
            <button
              className="review-cancel"
              onClick={() => navigate(detailPath)}
              type="button"
              disabled={isSubmitting}
            >
              취소
            </button>
          </div>
        </form>
      </section>
      <AppFooter />
    </main>
  )
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 3.1 2.58 5.48 5.82.89-4.22 4.27.99 6.02L12 16.9l-5.17 2.86.99-6.02L3.6 9.47l5.82-.89L12 3.1Z" />
    </svg>
  )
}

export default ReviewWrite
