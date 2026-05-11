import type { HeroExhibition, RecommendedExhibition } from '../types/home'

export const heroExhibition: HeroExhibition = {
  id: 'rhythm-of-silence',
  dday: 'D-3',
  category: '추상화',
  matchRate: 98,
  title: '침묵의 리듬',
  subtitle: '현대 추상화의 정수',
  period: '2024.05.18 - 08.25',
  venue: '아르빗 뮤지엄 메인홀',
  artwork: 'hero',
  liked: false,
  homepageUrl: 'https://example.com/rhythm-of-silence',
}

export const recommendedExhibitions: RecommendedExhibition[] = [
  {
    id: 'texture-temperature',
    dday: 'D-3',
    category: '회화',
    title: '질감의 온도: 조희진 개인전',
    period: '2024.05.12 - 06.30',
    venue: '성수 갤러리 메타',
    artwork: 'portal',
    liked: false,
  },
  {
    id: 'form-essence',
    dday: 'D-64',
    category: '조각',
    title: '형태의 본질: 나무와 유리',
    period: '2024.06.01 - 07.15',
    venue: '평창동 아트 스페이스',
    artwork: 'tree',
    liked: true,
  },
  {
    id: 'city-shadow',
    dday: 'D-3',
    category: '사진',
    title: '도시의 그림자: 찰나의 기록',
    period: '2024.05.20 - 08.10',
    venue: '한남 현대 카드 스토리지',
    artwork: 'glass',
    liked: false,
  },
  {
    id: 'data-forest',
    dday: 'D-3',
    category: '미디어',
    title: '데이터의 숲: 끝없는 변주',
    period: '2024.06.10 - 09.30',
    venue: '한남 현대 카드 스토리지',
    artwork: 'media',
    liked: false,
  },
]
