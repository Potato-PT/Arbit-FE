import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../../../components/AppHeader'
import AppFooter from '../../../components/AppFooter'
import {
  preferenceMediaCategories,
  type PreferenceDetailOption,
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
  { id: 'adult', label: '일반 성인' },
  { id: 'all', label: '전 연령' },
  { id: 'senior', label: '태그 없음' },
]

const mediaEnglishLabels: Record<string, string> = {
  'art-exhibition': 'Exhibition / Art',
  'classic-recital': 'Classical',
  'education-experience': 'Education',
  festival: 'Festival',
  theater: 'Theatre',
  concert: 'Concert',
  'korean-traditional-music': 'Korean Traditional',
  'musical-opera': 'Musical / Opera',
  dance: 'Dance',
  film: 'Film',
  other: 'Others',
}

const mediaStampLabels: Record<string, string> = {
  'classic-recital': '클래식·독주',
  'musical-opera': '뮤지컬/오페라',
}

function Preferences() {
  const navigate = useNavigate()
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
      <AppHeader variant="warm" />

      <div className="preferences-shell">
        <section className="preferences-hero" aria-labelledby="preferences-title">
          <span className="preferences-overline">Curating Your Vision</span>
          <h1 id="preferences-title">
            당신의 취향을
            <br />
            <em>선택하세요.</em>
          </h1>
          <p>
            Arbit는 당신만의 예술적 감수성을 이해하고자 합니다.
            <br />
            선택하신 취향을 바탕으로 깊은 영감을 드릴 전시와 공연을 큐레이션해 드립니다.
          </p>
        </section>

        <section className="preferences-section" aria-labelledby="media-title">
          <SectionHeader number="01" title="매체 선택" note="하나만 선택 가능" titleId="media-title" />
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
                  <span className="stamp-en">{mediaEnglishLabels[option.id] ?? option.label}</span>
                  <span className="stamp-overlay" aria-hidden="true">
                    <span className="stamp-mark">
                      <span className="stamp-mark-top">Selected</span>
                      <span className="stamp-mark-star">* * *</span>
                      <span className="stamp-mark-bottom">
                        {mediaStampLabels[option.id] ?? option.label}
                      </span>
                    </span>
                  </span>
                  <span className="stamp-ko">{option.label}</span>
                </button>
              )
            })}
          </div>
        </section>

        <PreferenceGroup
          number="02"
          title="세부 매체 선택"
          options={detailOptions}
          selected={selectedDetails}
          onToggle={toggleDetailSelection}
          onToggleAll={toggleAllDetails}
          chipClassName="detail-chip"
        />

        <PreferenceGroup
          number="03"
          title="무드 선택"
          options={moodOptions}
          selected={selectedMoods}
          onToggle={(id) => toggleSelection(id, selectedMoods, setSelectedMoods)}
          onToggleAll={() => toggleAll(moodOptions, selectedMoods, setSelectedMoods)}
        />

        <PreferenceGroup
          number="04"
          title="관람자 선택"
          options={audienceOptions}
          selected={selectedAudiences}
          onToggle={(id) => toggleSelection(id, selectedAudiences, setSelectedAudiences)}
          onToggleAll={() => toggleAll(audienceOptions, selectedAudiences, setSelectedAudiences)}
        />

        <section className="preferences-section freeform-section" aria-labelledby="freeform-title">
          <SectionHeader number="05" title="직접 입력" titleId="freeform-title" />
          <textarea
            value={freeText}
            onChange={(event) => setFreeText(event.target.value)}
            placeholder="예: 베를린 감성의 현대 전시, 실험적인 사운드 아트 등"
            aria-label="직접 입력"
          />
          <p className="input-hint">원하시는 분위기나 특별한 취향을 자유롭게 입력해주세요.</p>
        </section>

        <div className="cta-wrap">
          <button className="preferences-submit" type="button" onClick={() => navigate('/')}>
            회원가입 완료하기
          </button>
          <p>취향 정보는 언제든 수정할 수 있습니다</p>
        </div>
      </div>
      <AppFooter />
    </main>
  )
}

function SectionHeader({
  number,
  title,
  note,
  titleId,
}: {
  number: string
  title: string
  note?: string
  titleId: string
}) {
  return (
    <div className="section-title-row">
      <h2 id={titleId}>
        <span>{number}</span>
        {title}
      </h2>
      {note && <span className="section-note">{note}</span>}
    </div>
  )
}

function PreferenceGroup({
  number,
  title,
  options,
  selected,
  onToggle,
  onToggleAll,
  chipClassName = '',
}: {
  number: string
  title: string
  options: Option[] | PreferenceDetailOption[]
  selected: string[]
  onToggle: (id: string) => void
  onToggleAll: () => void
  chipClassName?: string
}) {
  const titleId = `${title}-title`

  return (
    <section className="preferences-section" aria-labelledby={titleId}>
      <div className="section-title-row">
        <h2 id={titleId}>
          <span>{number}</span>
          {title}
        </h2>
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

export default Preferences
