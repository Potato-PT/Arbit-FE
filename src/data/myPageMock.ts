export type MyPageTab = 'favorites' | 'reviews' | 'preferences'

export interface MyPageProfile {
  name: string
  joinedAt: string
  avatarAlt: string
}

export interface FavoriteExhibition {
  id: string
  dday: string
  category: string
  title: string
  period: string
  venue: string
  artwork: 'portal' | 'tree' | 'glass'
  liked: boolean
}

export interface MyReview {
  id: string
  exhibitionId: string
  title: string
  rating: number
  content: string
  visitedAt: string
  likes: number
  isPublic: boolean
  posterTone: 'mint' | 'mono' | 'blue'
}

export const profile: MyPageProfile = {
  name: 'Julian Vane',
  joinedAt: '2024년 2월',
  avatarAlt: 'Julian Vane 프로필 사진',
}

export const preferenceTags = ['전시/미술', '연극', '일탈 성인']

export const favoriteExhibitions: FavoriteExhibition[] = [
  {
    id: 'texture-temperature',
    dday: 'D-3',
    category: '회화',
    title: '질감의 온도: 조희진 개인전',
    period: '2024.05.12 - 06.30',
    venue: '성수 갤러리 메타',
    artwork: 'portal',
    liked: true,
  },
  {
    id: 'form-essence',
    dday: 'D-3',
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
    liked: true,
  },
]

export const myReviews: MyReview[] = [
  {
    id: 'review-eternal-grotto',
    exhibitionId: 'eternal-grotto',
    title: '영원한 그릇: 흙의 여정',
    rating: 5,
    content:
      '정말 환상적인 전시였습니다. 조각품들이 살아 숨 쉬는 듯한 느낌을 받았어요. 특히 흙의 질감을 살린 대형 설치 미술품들은 압도적인 몰입감을 선사했습니다. 적극 추천합니다!',
    visitedAt: '2024년 11월 방문',
    likes: 24,
    isPublic: true,
    posterTone: 'mint',
  },
  {
    id: 'review-quiet-sound',
    exhibitionId: 'quiet-sound',
    title: '침묵의 소리: 미니멀리즘의 정수',
    rating: 4,
    content:
      '비움의 미학을 제대로 느낄 수 있었던 시간이었습니다. 전시 공간 배치 자체가 하나의 예술 작품 같았어요. 가끔은 복잡한 일상을 벗어나 이런 고요함이 필요한 것 같습니다.',
    visitedAt: '2024년 10월 방문',
    likes: 12,
    isPublic: true,
    posterTone: 'mono',
  },
  {
    id: 'review-light-canvas',
    exhibitionId: 'light-canvas',
    title: '빛과 그림자의 캔버스',
    rating: 5,
    content:
      '색채의 사용이 깊이롭습니다. 자연광이 들어오는 오후 시간에 방문하는 것을 추천드려요. 그림 위로 떨어지는 실제 빛과 캔버스 속 빛의 조화가 완벽했습니다.',
    visitedAt: '2024년 9월 방문',
    likes: 45,
    isPublic: true,
    posterTone: 'blue',
  },
]
