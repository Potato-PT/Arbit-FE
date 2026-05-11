import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'
import {
  preferenceMediaCategories,
  type PreferenceDetailOption,
  type PreferenceMediaIcon,
} from '../data/preferenceCategories'
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
        <Link className="preferences-user" to="/mypage" aria-label="마이페이지">
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

        <button className="preferences-submit" type="button">
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

  if (type === 'musical') {
    return (
      <svg viewBox="0 0 72 72" aria-hidden="true">
        <path d="M25 28c7 3 15 3 22 0" />
        <path d="M36 28v28" />
        <path d="M27 56h.1" />
        <path d="M36 60h.1" />
        <path d="M45 56h.1" />
        <circle cx="36" cy="19" r="5" />
        <path d="M28 32v17" />
        <path d="M44 32v17" />
      </svg>
    )
  }

  if (type === 'classic') {
    return (
      <svg viewBox="0 0 72 72" aria-hidden="true">
        <path d="M24 16 29 29 42 34 29 39 24 52 19 39 6 34 19 29 24 16Z" />
        <path d="M50 14 53 22 61 25 53 28 50 36 47 28 39 25 47 22 50 14Z" />
        <path d="M51 43 54 50 61 53 54 56 51 63 48 56 41 53 48 50 51 43Z" />
      </svg>
    )
  }

  if (type === 'camera') {
    return (
      <svg viewBox="0 0 72 72" aria-hidden="true">
        <path d="M18 25h10l5-7h12l5 7h4a6 6 0 0 1 6 6v22a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6V31a6 6 0 0 1 6-6Z" />
        <circle cx="36" cy="42" r="10" />
        <path d="M51 33h.1" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 72 72" aria-hidden="true">
      <path d="M37 58h-4c-13 0-23-10-23-22s11-23 25-23c13 0 25 9 25 21 0 8-5 12-11 12h-5c-3 0-5 2-5 5 0 2 1 4 3 5-1 1-3 2-5 2Z" />
      <circle cx="24" cy="31" r="3" />
      <circle cx="34" cy="24" r="3" />
      <circle cx="45" cy="29" r="3" />
      <circle cx="24" cy="43" r="3" />
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
