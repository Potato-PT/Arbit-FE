# Arbit UI

React, TypeScript, Vite 기반의 전시 추천 UI 프로토타입입니다.

현재는 프론트엔드 전용 프로토타입으로 구성되어 있으며, 전시 목록과 사용자 화면은 로컬 mock 데이터를 사용합니다. 실제 API 연동 전 화면 흐름, 라우팅, 데이터 표시 방식, 주요 UI 상태를 검증하는 데 초점을 둡니다.

## Scripts

```bash
npm run dev
npm run build
npm run lint
```

## Routes

- `/`: 홈
- `/exhibitions/all`: 전시 전체보기
- `/exhibitions/search`: 전시 검색
- `/exhibitions/:id`: 전시 상세
- `/exhibitions/:id/review`: 후기 작성
- `/user/login`: 로그인
- `/user/signup`: 회원가입 시작
- `/user/preferences`: 취향 설정
- `/user/mypage`: 마이페이지

## 주요 기능

- 홈 화면에서 추천 전시와 주요 전시 정보를 확인할 수 있습니다.
- 전시 전체보기 화면에서 장르, 지역, 기간, 관람료 기준으로 목록을 필터링하고 마감 임박순 또는 거리순으로 정렬할 수 있습니다.
- 전시 상태는 오늘 날짜를 기준으로 `n일 후 관람 가능`, `오늘 마감`, `D-day N` 형태의 배지로 표시합니다.
- 전시 검색, 전시 상세, 후기 작성 화면을 통해 전시 탐색 흐름을 확인할 수 있습니다.
- 로그인, 회원가입, 취향 설정, 마이페이지 화면으로 사용자 관련 UI 흐름을 구성합니다.

## 주요 구조

- `src/App.tsx`: 홈 화면
- `src/components/AppHeader.tsx`: 공통 상단 헤더
- `src/components/AppFooter.tsx`: 공통 하단 푸터
- `src/features/exhibitions/pages/AllExhibitions.tsx`: 전시 전체보기 화면
- `src/features/exhibitions/pages/ExhibitionSearch.tsx`: 전시 검색 화면
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

전시 전체보기 mock 데이터는 이후 백엔드 연동을 고려해 계산용 필드와 표시용 필드를 분리했습니다. `startDate`, `endDate`, `category`, `district`, `priceType`, `distanceKm`는 필터링, 정렬, 상태 계산에 사용하고, `period`는 화면에 보여주는 기간 문자열로만 사용합니다.
