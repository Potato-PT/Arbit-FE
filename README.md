# Arbit UI

React, TypeScript, Vite 기반 전시 추천 UI 프로토타입입니다.

현재는 프론트엔드 전용 프로토타입이며, 전시 목록과 사용자 화면은 로컬 mock 데이터를 사용합니다.

## Scripts

```bash
npm run dev
npm run build
npm run lint
```

## Routes

- `/` 홈
- `/exhibitions/all` 전시 전체보기
- `/exhibitions/search` 전시 검색
- `/exhibitions/:id` 전시 상세
- `/exhibitions/:id/review` 후기 작성
- `/user/login` 로그인
- `/user/signup` 회원가입 시작
- `/user/preferences` 취향 설정
- `/user/mypage` 마이페이지

## 주요 구조

- `src/App.tsx`: 홈 화면
- `src/components/AppHeader.tsx`: 공통 상단 헤더
- `src/components/AppFooter.tsx`: 공통 하단 푸터
- `src/features/exhibitions/pages/AllExhibitions.tsx`: 전시 전체보기 화면
- `src/features/exhibitions/pages/ExhibitionSearch.tsx`: 기존 전시 검색 화면
- `src/features/exhibitions/pages/ExhibitionDetail.tsx`: 전시 상세 화면
- `src/features/exhibitions/pages/ReviewWrite.tsx`: 후기 작성 화면
- `src/features/user/pages/Login.tsx`: 로그인 화면
- `src/features/user/pages/Signup.tsx`: 계정/프로필 입력 회원가입 화면
- `src/features/user/pages/Preferences.tsx`: 취향 선택 화면
- `src/features/user/pages/MyPage.tsx`: 마이페이지 화면

## Mock Data

- 홈 추천: `src/data/homeMock.ts`
- 전시 전체보기: `src/features/exhibitions/data/allExhibitionsMock.ts`
- 전시 검색: `src/features/exhibitions/data/searchMock.ts`
- 전시 상세/후기: `src/features/exhibitions/data/exhibitionDetails.ts`
- 마이페이지: `src/features/user/data/myPageMock.ts`
- 취향 선택: `src/features/user/data/preferenceCategories.ts`

## 전시 전체보기 필터/정렬

`/exhibitions/all`은 현재 mock 데이터 기준으로 동작합니다.

- 필터: 장르, 지역(구 단위), 기간(진행중/예정), 관람료(무료/유료)
- 정렬: 마감 임박순(기본), 거리순
- 상태 배지: 오늘 날짜 기준으로 `n일 후 관람 가능`, `오늘 마감`, `D-day N` 계산

백엔드 연동을 고려해 전시 전체보기 mock은 계산용 필드인 `startDate`, `endDate`, `category`, `district`, `priceType`, `distanceKm`를 분리해 사용합니다. 화면 표시용 기간 문자열인 `period`는 표시만 담당합니다.
