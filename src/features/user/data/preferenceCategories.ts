export type PreferenceMediaIcon =
  | 'art'
  | 'theater'
  | 'concert'
  | 'classic'
  | 'education'
  | 'festival'
  | 'koreanTraditional'
  | 'musicalOpera'
  | 'dance'
  | 'film'
  | 'other'

export interface PreferenceDetailOption {
  id: string
  label: string
}

export interface PreferenceMediaCategory {
  id: string
  label: string
  icon: PreferenceMediaIcon
  details: PreferenceDetailOption[]
}

export const preferenceMediaCategories: PreferenceMediaCategory[] = [
  {
    id: 'art-exhibition',
    label: '전시/미술',
    icon: 'art',
    details: [
      { id: 'solo-invitational', label: '개인전/초대전' },
      { id: 'planned-theme', label: '기획/테마 전시' },
      { id: 'history-culture-industry', label: '역사/문화/산업' },
    ],
  },
  {
    id: 'classic-recital',
    label: '클래식',
    icon: 'classic',
    details: [
      { id: 'orchestra-symphony', label: '관현악/교향곡' },
      { id: 'instrumental-recital', label: '기악 독주회' },
      { id: 'chamber-ensemble', label: '실내악/앙상블' },
    ],
  },
  {
    id: 'education-experience',
    label: '교육/체험',
    icon: 'education',
    details: [
      { id: 'making-workshop', label: '만들기/공방 체험' },
      { id: 'book-reading', label: '도서/독서 연계' },
      { id: 'academic-lecture', label: '학술/강연' },
    ],
  },
  {
    id: 'festival',
    label: '축제',
    icon: 'festival',
    details: [
      { id: 'outdoor-experience', label: '야외 체험 행사' },
      { id: 'culture-festival', label: '종합 문화 페스티벌' },
      { id: 'participatory-festival', label: '체험/참여형 축제' },
      { id: 'memorial-history-festival', label: '기념/역사 축제' },
    ],
  },
  {
    id: 'theater',
    label: '연극',
    icon: 'theater',
    details: [
      { id: 'kids-family-play', label: '아동/가족극' },
      { id: 'planned-project-play', label: '기획/프로젝트극' },
      { id: 'traditional-troupe-play', label: '정통 연극/극단전' },
    ],
  },
  {
    id: 'concert',
    label: '콘서트',
    icon: 'concert',
    details: [
      { id: 'jazz-crossover', label: '재즈/크로스오버' },
      { id: 'popular-indie', label: '대중/인디 음악' },
      { id: 'palace-outdoor-concert', label: '고궁/야외 콘서트' },
      { id: 'vocal-popera', label: '성악/팝페라' },
    ],
  },
  {
    id: 'korean-traditional-music',
    label: '국악',
    icon: 'koreanTraditional',
    details: [
      { id: 'traditional-gugak', label: '전통 국악' },
      { id: 'creative-fusion-gugak', label: '창작/퓨전 국악' },
    ],
  },
  {
    id: 'musical-opera',
    label: '뮤지컬/오페라',
    icon: 'musicalOpera',
    details: [
      { id: 'musical', label: '뮤지컬' },
      { id: 'opera', label: '오페라' },
    ],
  },
  {
    id: 'dance',
    label: '무용',
    icon: 'dance',
    details: [
      { id: 'ballet', label: '발레' },
      { id: 'contemporary-creative-dance', label: '현대/창작무용' },
      { id: 'traditional-dance', label: '전통무용' },
    ],
  },
  {
    id: 'film',
    label: '영화',
    icon: 'film',
    details: [
      { id: 'special-screening-festa', label: '특별 상영회/페스타' },
      { id: 'classic-independent-art-film', label: '고전/독립/예술 영화' },
    ],
  },
  {
    id: 'other',
    label: '기타',
    icon: 'other',
    details: [{ id: 'other', label: '기타' }],
  },
]
