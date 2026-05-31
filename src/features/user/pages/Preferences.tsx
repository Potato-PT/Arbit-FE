import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../../../components/AppHeader'
import AppFooter from '../../../components/AppFooter'
import { ApiError } from '../api/authApi'
import {
  getPreferenceCategories,
  savePreferences,
  type PreferenceSeedEvent,
} from '../api/preferencesApi'
import '../styles/Preferences.css'

const MIN_SELECTED_EVENT_COUNT = 4
const MAX_SELECTED_EVENT_COUNT = 5
const VISIBLE_EVENT_COUNT = 3
const FILM_HOLE_COUNT = 10

function Preferences() {
  const navigate = useNavigate()
  const [seedEvents, setSeedEvents] = useState<PreferenceSeedEvent[]>([])
  const [selectedEventIds, setSelectedEventIds] = useState<number[]>([])
  const [failedImageIds, setFailedImageIds] = useState<number[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const maxStartIndex = Math.max(0, seedEvents.length - VISIBLE_EVENT_COUNT)
  const selectedEvents = useMemo(
    () => seedEvents.filter((seedEvent) => selectedEventIds.includes(seedEvent.event_id)),
    [seedEvents, selectedEventIds],
  )

  useEffect(() => {
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
  }, [])

  useEffect(() => {
    setCurrentIndex((index) => Math.min(index, maxStartIndex))
  }, [maxStartIndex])

  const toggleSeedEvent = (eventId: number) => {
    setSelectedEventIds((currentEventIds) => {
      if (currentEventIds.includes(eventId)) {
        return currentEventIds.filter((selectedEventId) => selectedEventId !== eventId)
      }

      return currentEventIds.length < MAX_SELECTED_EVENT_COUNT
        ? [...currentEventIds, eventId]
        : currentEventIds
    })
  }

  const handleImageError = (eventId: number) => {
    setFailedImageIds((currentIds) =>
      currentIds.includes(eventId) ? currentIds : [...currentIds, eventId],
    )
  }

  const handleSubmit = async () => {
    if (isSubmitting || selectedEventIds.length < MIN_SELECTED_EVENT_COUNT) {
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      await savePreferences(selectedEventIds)
      navigate('/', { state: { recommendationEventIds: selectedEventIds } })
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

  return (
    <main className="preferences-page" aria-label="취향 선택">
      <AppHeader variant="warm" />

      <div className="preferences-shell">
        <div className="preferences-progress" aria-label="회원가입 진행 단계">
          <span className="is-active" />
          <span className="is-active" />
          <span />
        </div>

        <section className="preferences-hero" aria-labelledby="preferences-title">
          <span className="preferences-overline">Curating Your Vision</span>
          <h1 id="preferences-title">
            마음에 드는 전시·공연을
            <br />
            <em>골라주세요.</em>
          </h1>
          <p>
            예전에 관람했거나, 아직 관람하지 않았지만 마음에 드는 작품을 선택해 주세요.
            <br />
            관심 있는 전시·공연을 4~5개 선택하면 맞춤 추천을 준비해 드립니다.
          </p>
        </section>

        {isLoadingCategories ? (
          <PreferencesStatus>취향 선택 이벤트를 불러오는 중입니다.</PreferencesStatus>
        ) : (
          <>
            {errorMessage && <PreferencesStatus isError>{errorMessage}</PreferencesStatus>}

            {!errorMessage && seedEvents.length === 0 && (
              <PreferencesStatus>선택 가능한 이벤트가 없습니다.</PreferencesStatus>
            )}

            {seedEvents.length > 0 && (
              <section className="preferences-selection" aria-labelledby="seed-events-title">
                <div className="preferences-section-header">
                  <h2 id="seed-events-title">
                    <span>02</span>
                    전시·공연 선택
                  </h2>
                  <p>
                    <strong>{selectedEventIds.length}</strong> / {MAX_SELECTED_EVENT_COUNT} 선택됨
                  </p>
                </div>

                <div className="preferences-film-viewer">
                  <button
                    className="preferences-film-arrow is-left"
                    type="button"
                    aria-label="이전 이벤트 보기"
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
                  >
                    ‹
                  </button>
                  <button
                    className="preferences-film-arrow is-right"
                    type="button"
                    aria-label="다음 이벤트 보기"
                    disabled={currentIndex === maxStartIndex}
                    onClick={() => setCurrentIndex((index) => Math.min(maxStartIndex, index + 1))}
                  >
                    ›
                  </button>

                  <div className="preferences-film-outer">
                    <FilmHoles position="top" />
                    <div className="preferences-film-viewport">
                      <div
                        className="preferences-film-track"
                        style={{ transform: `translateX(-${currentIndex * (100 / VISIBLE_EVENT_COUNT)}%)` }}
                      >
                        {seedEvents.map((seedEvent, index) => {
                          const isSelected = selectedEventIds.includes(seedEvent.event_id)
                          const isDisabled =
                            !isSelected && selectedEventIds.length >= MAX_SELECTED_EVENT_COUNT
                          const hasPoster =
                            Boolean(seedEvent.posterImage) &&
                            !failedImageIds.includes(seedEvent.event_id)

                          return (
                            <button
                              className={[
                                'preferences-film-frame',
                                isSelected ? 'is-selected' : '',
                                isDisabled ? 'is-dimmed' : '',
                              ].filter(Boolean).join(' ')}
                              type="button"
                              aria-pressed={isSelected}
                              disabled={isDisabled}
                              key={seedEvent.event_id}
                              onClick={() => toggleSeedEvent(seedEvent.event_id)}
                            >
                              <span className="preferences-frame-poster">
                                {hasPoster ? (
                                  <img
                                    src={seedEvent.posterImage}
                                    alt=""
                                    onError={() => handleImageError(seedEvent.event_id)}
                                  />
                                ) : (
                                  <span className="preferences-frame-placeholder">
                                    <span aria-hidden="true">◇</span>
                                    <small>Poster</small>
                                  </span>
                                )}
                              </span>
                              <span className="preferences-frame-badge" aria-hidden="true">✦</span>
                              <span className="preferences-frame-meta">
                                <small>{String(index + 1).padStart(3, '0')}</small>
                                <strong>{seedEvent.title}</strong>
                                <em>{seedEvent.genre}</em>
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    <FilmHoles position="bottom" />
                  </div>
                </div>

                <div className="preferences-film-index" aria-label="이벤트 목록 위치">
                  {Array.from({ length: maxStartIndex + 1 }, (_, index) => {
                    const hasSelectedEvent = seedEvents
                      .slice(index, index + VISIBLE_EVENT_COUNT)
                      .some((seedEvent) => selectedEventIds.includes(seedEvent.event_id))

                    return (
                      <button
                        className={[
                          'preferences-film-dot',
                          index === currentIndex ? 'is-active' : '',
                          hasSelectedEvent ? 'has-selection' : '',
                        ].filter(Boolean).join(' ')}
                        type="button"
                        aria-label={`${index + 1}번째 이벤트 묶음 보기`}
                        aria-current={index === currentIndex ? 'true' : undefined}
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                      />
                    )
                  })}
                </div>

                <div className="preferences-counter-bar">
                  <span>내 컬렉션</span>
                  <div>
                    {Array.from({ length: MAX_SELECTED_EVENT_COUNT }, (_, index) => (
                      <i
                        className={index < selectedEventIds.length ? 'is-filled' : ''}
                        aria-hidden="true"
                        key={index}
                      />
                    ))}
                  </div>
                </div>

                {selectedEvents.length > 0 && (
                  <div className="preferences-summary">
                    <h3>선택한 전시·공연</h3>
                    <div>
                      {selectedEvents.map((seedEvent) => (
                        <span key={seedEvent.event_id}>
                          {seedEvent.title}
                          <button
                            type="button"
                            title={`${seedEvent.title} 제거`}
                            aria-label={`${seedEvent.title} 제거`}
                            onClick={() => toggleSeedEvent(seedEvent.event_id)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}
          </>
        )}

        <div className="preferences-cta">
          <button
            type="button"
            disabled={
              isLoadingCategories ||
              isSubmitting ||
              selectedEventIds.length < MIN_SELECTED_EVENT_COUNT
            }
            onClick={handleSubmit}
          >
            {isSubmitting ? '저장 중' : '선택 완료'}
          </button>
          <p>
            {selectedEventIds.length < MIN_SELECTED_EVENT_COUNT
              ? `관심 있는 전시·공연을 4~5개 선택해주세요. 현재 ${selectedEventIds.length}개 선택했습니다.`
              : '취향 정보는 언제든 수정할 수 있습니다'}
          </p>
        </div>
      </div>
      <AppFooter />
    </main>
  )
}

function FilmHoles({ position }: { position: 'top' | 'bottom' }) {
  return (
    <div className={`preferences-film-holes is-${position}`} aria-hidden="true">
      {Array.from({ length: FILM_HOLE_COUNT }, (_, index) => <span key={index} />)}
    </div>
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
