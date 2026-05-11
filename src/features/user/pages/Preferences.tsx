import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../../../assets/logo.png'
import {
  preferenceMediaCategories,
  type PreferenceDetailOption,
  type PreferenceMediaIcon,
} from '../data/preferenceCategories'
import { useAuthStatus } from '../../../hooks/useAuthStatus'
import '../styles/Preferences.css'

type Option = {
  id: string
  label: string
}

const moodOptions: Option[] = [
  { id: 'healing-emotional', label: '힐링/감성' },
  { id: 'lively-active', label: '신나는/활기찬' },
  { id: 'moving-grand', label: '감동/웅장' },
  { id: 'traditional-cultural', label: '전통/문화' },
  { id: 'family-friendly', label: '가족친화' },
  { id: 'academic-reflective', label: '학술/사색적' },
]

const audienceOptions: Option[] = [
  { id: 'kids-family', label: '아동/가족' },
  { id: 'teen', label: '청소년' },
  { id: 'adult', label: '성인' },
  { id: 'all', label: '전 연령' },
  { id: 'senior', label: '중장년/시니어' },
]

function Preferences() {
  const navigate = useNavigate()
  const { accountLabel, accountPath } = useAuthStatus()
  const defaultMediaId = preferenceMediaCategories[0]?.id ?? ''
  const [selectedMediaId, setSelectedMediaId] = useState(defaultMediaId)
  const [selectedDetailIdsByMedia, setSelectedDetailIdsByMedia] = useState<Record<string, string[]>>({
    [defaultMediaId]: [preferenceMediaCategories[0]?.details[0]?.id ?? ''].filter(Boolean),
  })
  const [selectedMoods, setSelectedMoods] = useState<string[]>(['healing-emotional'])
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>(['adult'])
  const [freeText, setFreeText] = useState('')
  const selectedMediaCategory =
    preferenceMediaCategories.find((category) => category.id === selectedMediaId) ??
    preferenceMediaCategories[0]
  const detailOptions = selectedMediaCategory?.details ?? []
  const selectedDetails = selectedDetailIdsByMedia[selectedMediaId] ?? []

  const toggleSelection = (
    id: string,
    selected: string[],
    setSelected: (nextSelected: string[]) => void,
  ) => {
    setSelected(
      selected.includes(id)
        ? selected.filter((selectedId) => selectedId !== id)
        : [...selected, id],
    )
  }

  const toggleAll = (
    options: Option[],
    selected: string[],
    setSelected: (nextSelected: string[]) => void,
  ) => {
    setSelected(selected.length === options.length ? [] : options.map((option) => option.id))
  }

  const toggleDetailSelection = (id: string) => {
    setSelectedDetailIdsByMedia((currentSelections) => {
      const currentSelectedDetails = currentSelections[selectedMediaId] ?? []
      const nextSelectedDetails = currentSelectedDetails.includes(id)
        ? currentSelectedDetails.filter((selectedId) => selectedId !== id)
        : [...currentSelectedDetails, id]

      return {
        ...currentSelections,
        [selectedMediaId]: nextSelectedDetails,
      }
    })
  }

  const toggleAllDetails = () => {
    setSelectedDetailIdsByMedia((currentSelections) => {
      const currentSelectedDetails = currentSelections[selectedMediaId] ?? []
      const nextSelectedDetails =
        currentSelectedDetails.length === detailOptions.length
          ? []
          : detailOptions.map((option) => option.id)

      return {
        ...currentSelections,
        [selectedMediaId]: nextSelectedDetails,
      }
    })
  }

  return (
    <main className="preferences-page" aria-label="취향 선택">
      <header className="preferences-header">
        <Link className="preferences-brand" to="/" aria-label="Arbit home">
          <img src={logo} alt="Arbit" />
        </Link>
        <Link className="preferences-user" to={accountPath} aria-label={accountLabel}>
          <UserIcon />
        </Link>
      </header>

      <div className="preferences-shell">
        <section className="preferences-hero" aria-labelledby="preferences-title">
          <h1 id="preferences-title">취향 선택</h1>
          <p>키워드를 선택하여 당신의 취향을 기록하세요.</p>
        </section>

        <section className="preferences-section" aria-labelledby="media-title">
          <h2 id="media-title">매체 선택</h2>
          <div className="media-scroll" aria-label="매체 옵션">
            {preferenceMediaCategories.map((option) => {
              const isSelected = selectedMediaId === option.id

              return (
                <button
                  className={isSelected ? 'media-card is-selected' : 'media-card'}
                  type="button"
                  aria-pressed={isSelected}
                  key={option.id}
                  onClick={() => setSelectedMediaId(option.id)}
                >
                  {isSelected && <CheckIcon />}
                  <MediaIcon type={option.icon} />
                  <span>{option.label}</span>
                </button>
              )
            })}
          </div>
        </section>

        <PreferenceGroup
          title="세부 매체 선택"
          options={detailOptions}
          selected={selectedDetails}
          onToggle={toggleDetailSelection}
          onToggleAll={toggleAllDetails}
          chipClassName="detail-chip"
        />

        <PreferenceGroup
          title="무드 선택"
          options={moodOptions}
          selected={selectedMoods}
          onToggle={(id) => toggleSelection(id, selectedMoods, setSelectedMoods)}
          onToggleAll={() => toggleAll(moodOptions, selectedMoods, setSelectedMoods)}
        />

        <PreferenceGroup
          title="관람자 선택"
          options={audienceOptions}
          selected={selectedAudiences}
          onToggle={(id) => toggleSelection(id, selectedAudiences, setSelectedAudiences)}
          onToggleAll={() => toggleAll(audienceOptions, selectedAudiences, setSelectedAudiences)}
        />

        <section className="preferences-section freeform-section" aria-labelledby="freeform-title">
          <h2 id="freeform-title">직접 입력</h2>
          <textarea
            value={freeText}
            onChange={(event) => setFreeText(event.target.value)}
            placeholder="원하시는 분위기나 특별한 취향을 자유롭게 입력해주세요."
            aria-label="직접 입력"
          />
        </section>

        <button className="preferences-submit" type="button" onClick={() => navigate('/')}>
          회원 가입하기
        </button>
      </div>
    </main>
  )
}

function PreferenceGroup({
  title,
  options,
  selected,
  onToggle,
  onToggleAll,
  chipClassName = '',
}: {
  title: string
  options: Option[] | PreferenceDetailOption[]
  selected: string[]
  onToggle: (id: string) => void
  onToggleAll: () => void
  chipClassName?: string
}) {
  return (
    <section className="preferences-section" aria-labelledby={`${title}-title`}>
      <div className="section-title-row">
        <h2 id={`${title}-title`}>{title}</h2>
        <button type="button" onClick={onToggleAll}>
          전체 선택
        </button>
      </div>
      <div className="chip-list">
        {options.map((option) => {
          const isSelected = selected.includes(option.id)

          return (
            <button
              className={[
                'preference-chip',
                chipClassName,
                isSelected ? 'is-selected' : '',
              ].filter(Boolean).join(' ')}
              type="button"
              aria-pressed={isSelected}
              key={option.id}
              onClick={() => onToggle(option.id)}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </section>
  )
}

function MediaIcon({ type }: { type: PreferenceMediaIcon }) {
  if (type === 'art') {
    return (
      <svg viewBox="0 0 72 72" aria-hidden="true">
        <rect x="14" y="16" width="34" height="40" rx="3" />
        <path d="M22 45c5-9 9-11 14-5 3-5 6-7 12-1" />
        <circle cx="35" cy="28" r="4" />
        <path d="M53 22h5v36H24v-5" />
      </svg>
    )
  }

  if (type === 'theater') {
    return (
      <svg viewBox="0 0 72 72" aria-hidden="true">
        <path d="M18 28h26v15c0 8-6 14-13 14s-13-6-13-14V28Z" />
        <path d="M30 20h26v15c0 8-6 14-13 14" />
        <path d="M26 38h.1" />
        <path d="M36 38h.1" />
        <path d="M25 47c4 3 8 3 12 0" />
        <path d="M38 30h.1" />
        <path d="M48 30h.1" />
      </svg>
    )
  }

  if (type === 'concert') {
    return (
      <svg viewBox="0 0 72 72" aria-hidden="true">
        <path d="M22 34v8a14 14 0 0 0 28 0v-8" />
        <rect x="29" y="14" width="14" height="31" rx="7" />
        <path d="M36 56v-9" />
        <path d="M27 58h18" />
        <path d="M18 25c-4 5-4 14 0 19" />
        <path d="M54 25c4 5 4 14 0 19" />
      </svg>
    )
  }

  if (type === 'classic') {
    return (
      <svg viewBox="0 0 72 72" aria-hidden="true">
        <path d="M24 18v34" />
        <path d="M48 18v34" />
        <path d="M24 22c8-6 16-6 24 0" />
        <path d="M24 34c8-5 16-5 24 0" />
        <path d="M18 52h36" />
        <path d="M30 18v34" />
        <path d="M42 18v34" />
      </svg>
    )
  }

  if (type === 'education') {
    return (
      <svg viewBox="0 0 72 72" aria-hidden="true">
        <path d="M16 20h18a8 8 0 0 1 8 8v30H24a8 8 0 0 0-8 8V20Z" />
        <path d="M42 28a8 8 0 0 1 8-8h6v38H42" />
        <path d="M23 31h10" />
        <path d="M23 40h10" />
        <path d="M50 31h6" />
      </svg>
    )
  }

  if (type === 'festival') {
    return (
      <svg viewBox="0 0 72 72" aria-hidden="true">
        <path d="M15 20c7 6 14 6 21 0s14-6 21 0v20c-7-6-14-6-21 0s-14 6-21 0V20Z" />
        <path d="M15 40v18" />
        <path d="M20 58h30" />
        <path d="M24 50h.1" />
        <path d="M36 48h.1" />
        <path d="M48 50h.1" />
      </svg>
    )
  }

  if (type === 'koreanTraditional') {
    return (
      <svg viewBox="0 0 72 72" aria-hidden="true">
        <circle cx="36" cy="36" r="21" />
        <path d="M36 15c7 6 7 15 0 21s-7 15 0 21" />
        <path d="M36 36c-7 6-14 6-21 0" />
        <path d="M36 36c7-6 14-6 21 0" />
        <path d="M20 20 52 52" />
      </svg>
    )
  }

  if (type === 'musicalOpera') {
    return (
      <svg viewBox="0 0 72 72" aria-hidden="true">
        <path d="M20 18h32l-4 29c-1 8-6 13-12 13s-11-5-12-13L20 18Z" />
        <path d="M27 30h.1" />
        <path d="M45 30h.1" />
        <path d="M28 45c5 4 11 4 16 0" />
        <path d="M18 18h36" />
        <path d="M24 12h24" />
      </svg>
    )
  }

  if (type === 'dance') {
    return (
      <svg viewBox="0 0 72 72" aria-hidden="true">
        <circle cx="36" cy="16" r="5" />
        <path d="M36 22 25 34l11 8 12-13" />
        <path d="M25 34 16 28" />
        <path d="M48 29 56 36" />
        <path d="M36 42 28 58" />
        <path d="M36 42 51 58" />
        <path d="M22 58h13" />
        <path d="M46 58h12" />
      </svg>
    )
  }

  if (type === 'film') {
    return (
      <svg viewBox="0 0 72 72" aria-hidden="true">
        <rect x="14" y="20" width="44" height="32" rx="4" />
        <path d="M14 30h44" />
        <path d="M24 20v32" />
        <path d="M48 20v32" />
        <path d="m33 35 10 5-10 5V35Z" />
        <path d="M18 26h4" />
        <path d="M50 26h4" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 72 72" aria-hidden="true">
      <circle cx="36" cy="36" r="22" />
      <path d="M36 46v-.2" />
      <path d="M28 28c1.6-5 6-8 11-7 5 .9 8 5 7 10-.8 4-4 6-7 8-2 1.4-3 2.7-3 5" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <span className="media-check" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path d="m7 12 3 3 7-7" />
      </svg>
    </span>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8.3" r="3" />
      <path d="M7.1 17.2c.85-2.45 2.48-3.68 4.9-3.68s4.05 1.23 4.9 3.68" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  )
}

export default Preferences
