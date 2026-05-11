import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'
import '../styles/Preferences.css'

type Option = {
  id: string
  label: string
}

type MediaOption = Option & {
  icon: 'palette' | 'theater' | 'musical' | 'classic' | 'camera'
}

const mediaOptions: MediaOption[] = [
  { id: 'art', label: '전시/미술', icon: 'palette' },
  { id: 'theater', label: '연극', icon: 'theater' },
  { id: 'musical-opera', label: '뮤지컬/오페라', icon: 'musical' },
  { id: 'classic', label: '클래식 및 독주/독창회', icon: 'classic' },
  { id: 'photo', label: '사진/미디어아트', icon: 'camera' },
]

const detailOptions: Option[] = [
  { id: 'solo-invitational', label: '개인전/초대전' },
  { id: 'special-planned', label: '특별전/기획전' },
  { id: 'craft-museum', label: '공예/박물관 전시' },
  { id: 'regular-art', label: '미술관 정기전' },
]

const moodOptions: Option[] = [
  { id: 'calm', label: '여유롭고 잔잔함' },
  { id: 'lively', label: '신나고 활기찬' },
  { id: 'fresh', label: '새롭고 실험적인' },
  { id: 'romantic', label: '낭만적이고 감성적인' },
  { id: 'light', label: '유쾌하고 가벼운' },
  { id: 'grand', label: '웅장하고 감동적인' },
  { id: 'warm', label: '따뜻하고 포근한' },
  { id: 'deep', label: '깊이 있는 사색적인' },
  { id: 'traditional', label: '전통적이고 격조 있는' },
  { id: 'nature', label: '자연 속 힐링' },
]

const audienceOptions: Option[] = [
  { id: 'kids-family', label: '아동/가족' },
  { id: 'teen', label: '청소년' },
  { id: 'adult', label: '성인' },
  { id: 'all', label: '전 연령' },
  { id: 'senior', label: '중장년/시니어' },
]

function Preferences() {
  const [selectedMedia, setSelectedMedia] = useState<string[]>(['art'])
  const [selectedDetails, setSelectedDetails] = useState<string[]>(['special-planned'])
  const [selectedMoods, setSelectedMoods] = useState<string[]>(['calm', 'light', 'warm'])
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>(['adult'])
  const [freeText, setFreeText] = useState('')

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
            {mediaOptions.map((option) => {
              const isSelected = selectedMedia.includes(option.id)

              return (
                <button
                  className={isSelected ? 'media-card is-selected' : 'media-card'}
                  type="button"
                  aria-pressed={isSelected}
                  key={option.id}
                  onClick={() => toggleSelection(option.id, selectedMedia, setSelectedMedia)}
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
          onToggle={(id) => toggleSelection(id, selectedDetails, setSelectedDetails)}
          onToggleAll={() => toggleAll(detailOptions, selectedDetails, setSelectedDetails)}
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
}: {
  title: string
  options: Option[]
  selected: string[]
  onToggle: (id: string) => void
  onToggleAll: () => void
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
              className={isSelected ? 'preference-chip is-selected' : 'preference-chip'}
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

function MediaIcon({ type }: { type: MediaOption['icon'] }) {
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
