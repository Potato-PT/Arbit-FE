import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AppHeader from '../../../components/AppHeader'
import AppFooter from '../../../components/AppFooter'
import { beginPreferencesOnboarding, clearAuthStorage } from '../../../api/authStorage'
import {
  deleteMyReview,
  getMyBookmarks,
  getMyProfile,
  getMyReviews,
  updateNickname,
  updateProfileImage,
} from '../api/myPageApi'
import { ApiError, logout } from '../api/authApi'
import type {
  MyBookmark,
  MyProfile,
  MyReview as ApiMyReview,
} from '../types/myPageApi'
import '../styles/MyPage.css'

type MyPageTab = 'favorites' | 'reviews'

const tabs: { id: MyPageTab; label: string }[] = [
  { id: 'favorites', label: '즐겨찾기' },
  { id: 'reviews', label: '나의 후기' },
]

function MyPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<MyPageTab>(() =>
    getMyPageTab(searchParams.get('tab')),
  )
  const [profile, setProfile] = useState<MyProfile | null>(null)
  const [isProfileLoading, setIsProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState('')
  const [isEditingNickname, setIsEditingNickname] = useState(false)
  const [nicknameInput, setNicknameInput] = useState('')
  const [nicknameError, setNicknameError] = useState('')
  const [isNicknameSaving, setIsNicknameSaving] = useState(false)
  const [profileImageError, setProfileImageError] = useState('')
  const [isProfileImageSaving, setIsProfileImageSaving] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const profileImageInputRef = useRef<HTMLInputElement>(null)
  const tasteKeywords = profile?.tasteKeywords ?? []

  useEffect(() => {
    const nextTab = getMyPageTab(searchParams.get('tab'))
    setActiveTab(nextTab)
  }, [searchParams])

  useEffect(() => {
    let isMounted = true

    async function loadProfile() {
      setIsProfileLoading(true)
      setProfileError('')

      try {
        const nextProfile = await getMyProfile()

        if (isMounted) {
          setProfile(nextProfile)
          setNicknameInput(nextProfile.nickname)
        }
      } catch (error) {
        if (isMounted && !(error instanceof ApiError && error.status === 401)) {
          setProfileError('프로필 정보를 불러오지 못했습니다.')
        }
      } finally {
        if (isMounted) {
          setIsProfileLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [])

  const refreshProfile = async () => {
    const nextProfile = await getMyProfile()

    setProfile(nextProfile)
    setNicknameInput(nextProfile.nickname)

    return nextProfile
  }

  const handleStartNicknameEdit = () => {
    setNicknameInput(profile?.nickname ?? '')
    setNicknameError('')
    setIsEditingNickname(true)
  }

  const handleCancelNicknameEdit = () => {
    setNicknameInput(profile?.nickname ?? '')
    setNicknameError('')
    setIsEditingNickname(false)
  }

  const handleNicknameSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextNickname = nicknameInput.trim()

    if (!nextNickname) {
      setNicknameError('닉네임을 다시 확인해주세요.')
      return
    }

    setNicknameError('')
    setIsNicknameSaving(true)

    try {
      const nextNicknameResponse = await updateNickname(nextNickname)
      const updatedNickname = nextNicknameResponse?.nickname

      if (updatedNickname) {
        setProfile((currentProfile) =>
          currentProfile ? { ...currentProfile, nickname: updatedNickname } : currentProfile,
        )
        setNicknameInput(updatedNickname)
      } else {
        await refreshProfile()
      }

      setIsEditingNickname(false)
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        return
      }

      setNicknameError(
        error instanceof ApiError && error.status === 400
          ? '닉네임을 다시 확인해주세요.'
          : '닉네임 변경 중 오류가 발생했습니다.',
      )
    } finally {
      setIsNicknameSaving(false)
    }
  }

  const handleProfileImageButtonClick = () => {
    setProfileImageError('')
    profileImageInputRef.current?.click()
  }

  const handleProfileImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setProfileImageError('이미지 파일만 업로드할 수 있습니다.')
      return
    }

    setProfileImageError('')
    setIsProfileImageSaving(true)

    try {
      const nextProfileImage = await updateProfileImage(file)
      const updatedProfileImageUrl = nextProfileImage?.profileImageUrl

      if (updatedProfileImageUrl) {
        setProfile((currentProfile) =>
          currentProfile
            ? { ...currentProfile, profileImageUrl: updatedProfileImageUrl }
            : currentProfile,
        )
      } else {
        await refreshProfile()
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        return
      }

      setProfileImageError('프로필 이미지 변경 중 오류가 발생했습니다.')
    } finally {
      setIsProfileImageSaving(false)
    }
  }

  const handleLogout = async () => {
    if (isLoggingOut) {
      return
    }

    setLogoutError('')
    setIsLoggingOut(true)

    try {
      await logout()
      clearAuthStorage()
      navigate('/user/login', { replace: true })
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearAuthStorage()
        navigate('/user/login', { replace: true })
        return
      }

      setLogoutError('로그아웃 중 오류가 발생했습니다.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleOpenPreferencesTest = () => {
    beginPreferencesOnboarding()
    navigate('/user/preferences', { state: { fromSignup: true } })
  }

  const handleTabChange = (tabId: MyPageTab) => {
    setActiveTab(tabId)
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams)
      nextParams.set('tab', tabId)
      return nextParams
    })
  }

  return (
    <main className="mypage" aria-label="마이페이지">
      <AppHeader />

      <section className="profile-section" aria-labelledby="profile-name">
        <div
          className="profile-avatar"
          role="img"
          aria-label={profile ? `${profile.nickname} 프로필 사진` : '프로필 사진'}
        >
          {profile?.profileImageUrl ? (
            <img className="profile-avatar-image" src={profile.profileImageUrl} alt="" />
          ) : (
            <span className="avatar-face" />
          )}
          <button
            className="avatar-edit"
            type="button"
            aria-label="프로필 이미지 수정"
            onClick={handleProfileImageButtonClick}
            disabled={isProfileLoading || isProfileImageSaving}
          >
            <PencilIcon />
          </button>
          <input
            ref={profileImageInputRef}
            className="profile-image-input"
            type="file"
            accept="image/*"
            onChange={handleProfileImageChange}
            tabIndex={-1}
          />
        </div>
        <div>
          {isEditingNickname ? (
            <form className="nickname-form" onSubmit={handleNicknameSubmit}>
              <label className="nickname-field" htmlFor="mypage-nickname">
                <span>닉네임</span>
                <input
                  id="mypage-nickname"
                  type="text"
                  value={nicknameInput}
                  onChange={(event) => setNicknameInput(event.target.value)}
                  disabled={isNicknameSaving}
                  required
                />
              </label>
              <div className="nickname-actions">
                <button type="submit" disabled={isNicknameSaving}>
                  {isNicknameSaving ? '저장 중' : '저장'}
                </button>
                <button type="button" onClick={handleCancelNicknameEdit} disabled={isNicknameSaving}>
                  취소
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-name-row">
              <h1 id="profile-name">{profile?.nickname ?? '마이페이지'}</h1>
              <button
                className="nickname-edit"
                type="button"
                aria-label="닉네임 수정"
                onClick={handleStartNicknameEdit}
                disabled={isProfileLoading || isNicknameSaving}
              >
                <PencilIcon />
              </button>
            </div>
          )}
          {isProfileLoading ? (
            <p role="status">프로필 정보를 불러오는 중입니다.</p>
          ) : profileError ? (
            <p className="profile-error" role="alert">
              {profileError}
            </p>
          ) : (
            <p>가입일: {formatDisplayDate(profile?.subscribedAt)}</p>
          )}
          {nicknameError && (
            <p className="profile-error" role="alert">
              {nicknameError}
            </p>
          )}
          {isProfileImageSaving && <p role="status">프로필 이미지를 변경하는 중입니다.</p>}
          {profileImageError && (
            <p className="profile-error" role="alert">
              {profileImageError}
            </p>
          )}
          <div className="account-session-zone">
            <button
              className="account-logout-button"
              type="button"
              onClick={handleLogout}
              disabled={isProfileLoading || isLoggingOut}
            >
              {isLoggingOut ? '로그아웃 중' : '로그아웃'}
            </button>
            {logoutError && (
              <p className="profile-error" role="alert">
                {logoutError}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mypage-content" aria-label="마이페이지 콘텐츠">
        <div className="mypage-tabs" role="tablist" aria-label="마이페이지 탭">
          {tabs.map((tab) => (
            <button
              className={activeTab === tab.id ? 'mypage-tab is-active' : 'mypage-tab'}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
          <button
            className="mypage-tab is-test"
            type="button"
            onClick={handleOpenPreferencesTest}
          >
            취향 설정
          </button>
        </div>

        {activeTab === 'favorites' && (
          <FavoritesPanel tasteKeywords={tasteKeywords} />
        )}
        {activeTab === 'reviews' && <ReviewsPanel tasteKeywords={tasteKeywords} />}
      </section>

      <AppFooter />
    </main>
  )
}

function formatDisplayDate(dateText?: string) {
  if (!dateText) {
    return '-'
  }

  const date = new Date(dateText)

  if (Number.isNaN(date.getTime())) {
    return dateText
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

function getMyPageTab(value: string | null): MyPageTab {
  return tabs.some((tab) => tab.id === value) ? (value as MyPageTab) : 'favorites'
}

function PreferenceTags({ tasteKeywords }: { tasteKeywords: string[] }) {
  if (tasteKeywords.length === 0) {
    return <p className="preference-empty">설정된 취향 키워드가 없습니다.</p>
  }

  return (
    <div className="preference-tags">
      {tasteKeywords.map((tag) => (
        <span key={tag}>#{tag}</span>
      ))}
    </div>
  )
}

function ReviewsPanel({ tasteKeywords }: { tasteKeywords: string[] }) {
  const [reviews, setReviews] = useState<ApiMyReview[]>([])
  const [isReviewsLoading, setIsReviewsLoading] = useState(true)
  const [reviewsError, setReviewsError] = useState('')
  const [pendingDeleteReviewIds, setPendingDeleteReviewIds] = useState<Set<number>>(() => new Set())

  useEffect(() => {
    let isMounted = true

    async function loadReviews() {
      setIsReviewsLoading(true)
      setReviewsError('')

      try {
        const nextReviews = await getMyReviews()

        if (isMounted) {
          setReviews(nextReviews)
        }
      } catch (error) {
        if (isMounted && !(error instanceof ApiError && error.status === 401)) {
          setReviewsError('리뷰 목록을 불러오지 못했습니다.')
        }
      } finally {
        if (isMounted) {
          setIsReviewsLoading(false)
        }
      }
    }

    loadReviews()

    return () => {
      isMounted = false
    }
  }, [])

  const handleReviewDelete = async (review: ApiMyReview) => {
    if (!review.event_id) {
      window.alert('리뷰에 연결된 이벤트 정보를 찾을 수 없어 삭제할 수 없습니다.')
      return
    }

    if (!window.confirm('이 리뷰를 삭제하시겠습니까?')) {
      return
    }

    setPendingDeleteReviewIds((current) => new Set(current).add(review.reviewId))

    try {
      await deleteMyReview(review.event_id, review.reviewId)
      setReviews((currentReviews) =>
        currentReviews.filter((currentReview) => currentReview.reviewId !== review.reviewId),
      )
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        return
      }

      if (error instanceof ApiError && error.status === 404) {
        window.alert('이미 삭제되었거나 찾을 수 없는 리뷰입니다.')
        setReviews((currentReviews) =>
          currentReviews.filter((currentReview) => currentReview.reviewId !== review.reviewId),
        )
        return
      }

      window.alert('리뷰를 삭제하지 못했습니다.')
    } finally {
      setPendingDeleteReviewIds((current) => {
        const next = new Set(current)
        next.delete(review.reviewId)
        return next
      })
    }
  }

  return (
    <div className="reviews-panel" role="tabpanel" aria-label="나의 후기">
      <section className="preference-block" aria-labelledby="review-preference-title">
        <h2 id="review-preference-title">나의 취향</h2>
        <PreferenceTags tasteKeywords={tasteKeywords} />
      </section>

      {isReviewsLoading && (
        <div className="review-status" role="status">
          리뷰 목록을 불러오는 중입니다.
        </div>
      )}

      {reviewsError && (
        <div className="review-status is-error" role="alert">
          {reviewsError}
        </div>
      )}

      {!isReviewsLoading && !reviewsError && reviews.length === 0 && (
        <div className="review-status">작성한 리뷰가 없습니다.</div>
      )}

      <div className="review-list">
        {reviews.map((review) => (
          <article className="my-review-card" key={review.reviewId}>
            <div className="review-poster" aria-hidden="true">
              {review.posterImageUrl ? (
                <img className="review-poster-image" src={review.posterImageUrl} alt="" />
              ) : (
                <span className="review-poster-placeholder">EXHIBITION</span>
              )}
            </div>

            <div className="review-card-body">
              <div className="review-card-head">
                <div>
                  <h3>{review.title}</h3>
                  <StarRating rating={review.starScore} />
                </div>
              </div>

              <p className="review-copy">{review.content}</p>

              <div className="review-card-foot">
                <span>{formatDisplayDate(review.createdAt)}</span>
                <div className="review-actions">
                  <button type="button" aria-label={`${review.title} 후기 공유`}>
                    <ShareIcon />
                  </button>
                  <button
                    className="review-delete"
                    type="button"
                    aria-label={`${review.title} 후기 삭제`}
                    disabled={!review.event_id || pendingDeleteReviewIds.has(review.reviewId)}
                    onClick={() => void handleReviewDelete(review)}
                  >
                    <TrashIcon />
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

function StarRating({ rating }: { rating: number }) {
  const normalizedRating = Math.max(0, Math.min(5, Math.round(rating)))

  return (
    <div className="my-review-rating" aria-label={`별점 ${rating}점`}>
      {'★'.repeat(normalizedRating)}
      {'☆'.repeat(5 - normalizedRating)}
    </div>
  )
}

function FavoritesPanel({ tasteKeywords }: { tasteKeywords: string[] }) {
  const [bookmarks, setBookmarks] = useState<MyBookmark[]>([])
  const [isBookmarksLoading, setIsBookmarksLoading] = useState(true)
  const [bookmarksError, setBookmarksError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadBookmarks() {
      setIsBookmarksLoading(true)
      setBookmarksError('')

      try {
        const nextBookmarks = await getMyBookmarks()

        if (isMounted) {
          setBookmarks(nextBookmarks)
        }
      } catch (error) {
        if (isMounted && !(error instanceof ApiError && error.status === 401)) {
          setBookmarksError('북마크 목록을 불러오지 못했습니다.')
        }
      } finally {
        if (isMounted) {
          setIsBookmarksLoading(false)
        }
      }
    }

    loadBookmarks()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="favorites-panel" role="tabpanel">
      <section className="preference-block" aria-labelledby="preference-title">
        <h2 id="preference-title">나의 취향</h2>
        <PreferenceTags tasteKeywords={tasteKeywords} />
      </section>

      {isBookmarksLoading && (
        <div className="favorite-empty" role="status">
          <p>북마크 목록을 불러오는 중입니다.</p>
        </div>
      )}

      {bookmarksError && (
        <div className="favorite-empty is-error" role="alert">
          <p>{bookmarksError}</p>
        </div>
      )}

      <div className="favorite-grid">
        {bookmarks.map((item, index) => (
          <FavoriteCard item={item} key={getBookmarkEventId(item) ?? `${item.title}-${index}`} />
        ))}
      </div>

      {!isBookmarksLoading && !bookmarksError && bookmarks.length === 0 && (
        <div className="favorite-empty" role="status">
          <p>북마크한 행사가 없습니다.</p>
          <Link to="/exhibitions/all">행사 목록으로 이동</Link>
        </div>
      )}
    </div>
  )
}

function FavoriteCard({ item }: { item: MyBookmark }) {
  const eventId = getBookmarkEventId(item)
  const cardContent = (
    <>
      <div className="favorite-poster">
        {item.posterImageUrl ? (
          <img className="favorite-poster-image" src={item.posterImageUrl} alt="" />
        ) : (
          <span className="favorite-art" />
        )}
      </div>
      <span className="favorite-category">{item.category}</span>
      <h3>{item.title}</h3>
      <p className="favorite-meta">
        <CalendarIcon />
        {formatDateRange(item.startDate, item.endDate)}
      </p>
      <p className="favorite-meta">
        <PinIcon />
        {item.venue}
      </p>
      {item.price && <p className="favorite-meta">가격: {item.price}</p>}
      <p className="favorite-meta">북마크: {formatDisplayDate(item.bookmarkedAt)}</p>
    </>
  )

  return (
    <article className="favorite-card">
      {eventId ? (
        <Link className="favorite-card-link" to={`/exhibitions/${eventId}`}>
          {cardContent}
        </Link>
      ) : (
        <div className="favorite-card-link" aria-disabled="true">
          {cardContent}
          <p className="favorite-meta">상세 이동에 필요한 이벤트 ID가 없습니다.</p>
        </div>
      )}
      <button
        aria-label={`${item.title} 북마크됨`}
        aria-pressed={true}
        className="favorite-heart"
        type="button"
      >
        <HeartIcon filled />
      </button>
    </article>
  )
}

function getBookmarkEventId(item: MyBookmark) {
  const eventId = item.eventId ?? item.event_id

  return eventId ? String(eventId) : undefined
}

function formatDateRange(startDate: string, endDate: string) {
  return `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`
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

export default MyPage
