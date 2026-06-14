import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AppHeader from '../../../components/AppHeader'
import {
  completePreferencesOnboarding,
  hasStoredLoginStatus,
  hasPreferencesOnboarding,
  saveRecommendationEventIds,
} from '../../../api/authStorage'
import { ApiError } from '../api/authApi'
import {
  getPreferenceCategories,
  savePreferences,
  type PreferenceSeedEvent,
} from '../api/preferencesApi'
import '../styles/Preferences.css'

const MIN_SELECTED_EVENT_COUNT = 5
const SEED_EVENT_COUNT = 20
const MAX_SELECTED_EVENT_COUNT = SEED_EVENT_COUNT

function Preferences() {
  const location = useLocation()
  const navigate = useNavigate()
  const isSignupOnboarding =
    isSignupOnboardingState(location.state) &&
    hasPreferencesOnboarding()
  const canAccessPreferences = isSignupOnboarding || hasStoredLoginStatus()
  const [seedEvents, setSeedEvents] = useState<PreferenceSeedEvent[]>([])
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([])
  const [failedImageIds, setFailedImageIds] = useState<string[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const hasMetMinimum = selectedEventIds.length >= MIN_SELECTED_EVENT_COUNT

  useEffect(() => {
    if (!canAccessPreferences) {
      navigate('/user/login', { replace: true })
      return
    }

    let ignore = false

    async function loadPreferenceCategories() {
      setIsLoadingCategories(true)
      setErrorMessage('')

      try {
        const nextSeedEvents = await getPreferenceCategories()

        if (!ignore) {
          setSeedEvents(nextSeedEvents)
        }
      } catch (error) {
        if (!ignore) {
          setSeedEvents([])
          setErrorMessage(
            error instanceof ApiError && error.status === 401
              ? '로그인이 필요합니다.'
              : '취향 선택 이벤트를 불러오지 못했습니다.',
          )
        }
      } finally {
        if (!ignore) {
          setIsLoadingCategories(false)
        }
      }
    }

    void loadPreferenceCategories()

    return () => {
      ignore = true
    }
  }, [canAccessPreferences, navigate])

  const toggleSeedEvent = (eventId: string) => {
    setSelectedEventIds((currentEventIds) => {
      if (currentEventIds.includes(eventId)) {
        return currentEventIds.filter((selectedEventId) => selectedEventId !== eventId)
      }

      return currentEventIds.length < MAX_SELECTED_EVENT_COUNT
        ? [...currentEventIds, eventId]
        : currentEventIds
    })
  }

  const handleImageError = (eventId: string) => {
    setFailedImageIds((currentIds) =>
      currentIds.includes(eventId) ? currentIds : [...currentIds, eventId],
    )
  }

  const handleSubmit = async () => {
    if (isSubmitting || !hasMetMinimum) {
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const eventIds = await savePreferences(selectedEventIds)

      const didCacheRecommendationEventIds = saveRecommendationEventIds(eventIds)

      if (!didCacheRecommendationEventIds) {
        console.warn('Recommendation event IDs were not cached after saving preferences.')
      }

      if (isSignupOnboarding) {
        completePreferencesOnboarding()
      }
      navigate('/', { replace: true })
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) {
        setErrorMessage(error.message)
      } else if (error instanceof ApiError && error.status === 401) {
        setErrorMessage('로그인이 필요합니다.')
      } else {
        setErrorMessage('취향 정보를 저장하지 못했습니다.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!canAccessPreferences) {
    return null
  }

  return (
    <main className="preferences-page" aria-label="취향 선택">
      <AppHeader variant="warm" />

      <div className="preferences-shell">
        <section className="preferences-intro" aria-labelledby="preferences-title">
          <div>
            <h1 id="preferences-title">
              당신의 취향이 될
              <br />
              전시·공연을 선택해 주세요
            </h1>
          </div>
          <span className={hasMetMinimum ? 'preferences-count is-ready' : 'preferences-count'}>
            <HeartIcon />
            {selectedEventIds.length}개 선택
          </span>
        </section>

        <p className="preferences-description">
          추천 후보 {SEED_EVENT_COUNT}개 중 마음에 드는 항목을 <strong>{MIN_SELECTED_EVENT_COUNT}개 이상</strong> 선택해 주세요.
          선택하신 취향을 바탕으로 당신만의 큐레이션이 시작됩니다.
        </p>

        {isLoadingCategories ? (
          <PreferencesStatus>취향 선택 이벤트를 불러오는 중입니다.</PreferencesStatus>
        ) : (
          <>
            {errorMessage && <PreferencesStatus isError>{errorMessage}</PreferencesStatus>}

            {!errorMessage && seedEvents.length === 0 && (
              <PreferencesStatus>선택 가능한 이벤트가 없습니다.</PreferencesStatus>
            )}

            {seedEvents.length > 0 && (
              <>
                <section className="preferences-grid" aria-label="전시·공연 목록">
                  {seedEvents.map((seedEvent) => {
                    const isSelected = selectedEventIds.includes(seedEvent.event_id)
                    const hasPoster =
                      Boolean(seedEvent.posterImage) &&
                      !failedImageIds.includes(seedEvent.event_id)

                    return (
                      <button
                        className={[
                          'preferences-card',
                          isSelected ? 'is-selected' : '',
                        ].filter(Boolean).join(' ')}
                        type="button"
                        aria-pressed={isSelected}
                        key={seedEvent.event_id}
                        onClick={() => toggleSeedEvent(seedEvent.event_id)}
                      >
                        <span className="preferences-card-poster">
                          {hasPoster ? (
                            <img
                              src={seedEvent.posterImage}
                              alt=""
                              onError={() => handleImageError(seedEvent.event_id)}
                            />
                          ) : (
                            <span className="preferences-card-placeholder">
                              <span aria-hidden="true">◇</span>
                              <small>Poster</small>
                            </span>
                          )}
                          <span className="preferences-card-overlay" />
                          <span className="preferences-card-check" aria-hidden="true">✓</span>
                        </span>
                        <span className="preferences-card-info">
                          <small>{seedEvent.genre}</small>
                          <strong>{seedEvent.title}</strong>
                        </span>
                      </button>
                    )
                  })}
                </section>

              </>
            )}
          </>
        )}
      </div>

      <div className="preferences-bottom-bar">
        <div className="preferences-bottom-inner">
          <div className="preferences-bottom-status">
            <div className="preferences-dots" aria-hidden="true">
              {Array.from({ length: MAX_SELECTED_EVENT_COUNT }, (_, index) => (
                <i
                  className={[
                    index < selectedEventIds.length ? 'is-filled' : '',
                    hasMetMinimum ? 'is-ready' : '',
                  ].filter(Boolean).join(' ')}
                  key={index}
                />
              ))}
            </div>
            <span>{getSelectionHint(selectedEventIds.length)}</span>
          </div>
          <button
            className="preferences-submit"
            type="button"
            disabled={isLoadingCategories || isSubmitting || !hasMetMinimum}
            onClick={handleSubmit}
          >
            {isSubmitting ? '저장 중...' : '큐레이션 시작하기'}
          </button>
        </div>
      </div>
    </main>
  )
}

function isSignupOnboardingState(state: unknown) {
  return (
    typeof state === 'object' &&
    state !== null &&
    'fromSignup' in state &&
    state.fromSignup === true
  )
}

function getSelectionHint(selectedCount: number) {
  if (selectedCount === 0) {
    return `최소 ${MIN_SELECTED_EVENT_COUNT}개 이상 선택해 주세요`
  }

  if (selectedCount < MIN_SELECTED_EVENT_COUNT) {
    return `${MIN_SELECTED_EVENT_COUNT - selectedCount}개 더 선택해 주세요`
  }

  return `${selectedCount}개 선택 완료`
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 20.2 4.3 12.7C-.1 8.3 6.2 1.9 10.6 6.3L12 7.7l1.4-1.4c4.4-4.4 10.7 2 6.3 6.4Z" />
    </svg>
  )
}

function PreferencesStatus({
  children,
  isError = false,
}: {
  children: string
  isError?: boolean
}) {
  return (
    <div className={isError ? 'preferences-status is-error' : 'preferences-status'} role={isError ? 'alert' : 'status'}>
      {children}
    </div>
  )
}

export default Preferences
