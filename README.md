# Arbit UI

Arbit UI는 전시와 문화 행사를 탐색하고, 취향 기반 추천을 확인하며, 후기와 북마크를 관리할 수 있는 React 프론트엔드입니다. 백엔드 API와 연동해 홈, 전시 전체보기, 상세, 후기 작성, 취향 선택, 로그인/회원가입, 마이페이지 흐름을 제공합니다.

## 배포 주소

- 서비스 URL: https://arbit-umber.vercel.app/
- 백엔드 API 서버: https://piec.store
- Swagger 문서: https://piec.store/swagger-ui/index.html

## 주요 기능

- 로그인 상태에 따라 게스트 홈 또는 개인화 추천 홈을 표시
- 전시·공연 목록 조회, 검색, 필터, 정렬, 더 보기 UI 제공
- 전시·공연 상세 정보와 리뷰 목록 조회
- 후기 작성 및 내 후기 삭제
- 전시·공연 북마크 추가/삭제
- 회원가입, 로그인, 게스트 로그인, 로그아웃
- 회원가입 직후 20개 seed event 기반 취향 선택
- 마이페이지 프로필, 닉네임, 프로필 이미지, 내 후기, 북마크 관리
- 외부 홈페이지 이동 클릭 수집 API 연동

## 기술 스택

- React 19
- TypeScript
- Vite
- React Router
- ESLint
- Plain CSS

## 실행 방법

```bash
npm install
npm run dev
```

개발 서버는 기본적으로 `http://localhost:5173/`에서 실행됩니다.

## 사용 가능한 명령어

```bash
npm run dev      # Vite 개발 서버 실행
npm run build    # TypeScript 빌드 및 Vite 프로덕션 빌드
npm run lint     # ESLint 검사
npm run preview  # 빌드 결과 미리보기
```

## 환경 변수

API base URL은 [src/api/config.ts](src/api/config.ts)에서 관리합니다.

```env
VITE_API_BASE_URL=
VITE_API_PROXY_TARGET=
```

- 개발 환경에서 `VITE_API_BASE_URL`이 없으면 프론트는 `/api`로 요청하고, Vite proxy가 `VITE_API_PROXY_TARGET` 또는 기본값 `https://piec.store`로 전달합니다.
- 프로덕션 빌드에서 `VITE_API_BASE_URL`이 없으면 `https://piec.store`를 기본 API base URL로 사용합니다.
- Swagger 문서는 `https://piec.store/swagger-ui/index.html`, Swagger JSON은 `https://piec.store/v3/api-docs`를 기준으로 확인합니다.

## 주요 라우트

라우트 선언은 [src/main.tsx](src/main.tsx)에 있습니다.

- `/`: 홈
- `/exhibitions/all`: 전시·공연 전체보기
- `/exhibitions/:id`: 전시·공연 상세
- `/exhibitions/:id/review`: 후기 작성
- `/user/login`: 로그인
- `/user/signup`: 회원가입
- `/user/preferences`: 회원가입 직후 취향 선택
- `/user/mypage`: 마이페이지

`/exhibitions/search`, `/exhibition/all`은 `/exhibitions/all`로 리다이렉트됩니다.

## 폴더 구조

```text
src/
  api/                    # 공통 API 설정, 인증 저장소, 헤더 유틸, 홈 API
  assets/                 # 로컬 이미지 리소스
  components/             # 공통 AppHeader, AppFooter, StatusMessage
  features/
    exhibitions/          # 전시 목록, 상세, 후기, 북마크 관련 코드
      api/
      pages/
      styles/
      types/
    home/                 # 게스트 홈, 로그인 홈, 홈 카드 섹션
      components/
      pages/
      utils/
    user/                 # 인증, 취향 선택, 마이페이지 관련 코드
      api/
      pages/
      styles/
      types/
  hooks/                  # 공통 React hooks
  styles/                 # 홈 등 공통 스타일
  types/                  # 홈 화면 타입
```

전역 스타일은 [src/index.css](src/index.css)에서 관리하며, 기본 sans-serif 폰트는 `--font-sans` CSS 변수로 제공합니다.

## API 연동 메모

모든 API 함수는 공통 `API_BASE_URL`을 사용합니다. 토큰이 필요한 요청은 `Authorization: Bearer {accessToken}` 헤더를 포함합니다. 파일 업로드는 `FormData`를 사용하며 `Content-Type`은 브라우저가 설정하도록 직접 지정하지 않습니다.

주요 API helper:

- [src/api/homeApi.ts](src/api/homeApi.ts)
  - `GET /api/home`
  - `GET /api/home/recommendations`
- [src/features/exhibitions/api/eventsApi.ts](src/features/exhibitions/api/eventsApi.ts)
  - `GET /api/events`
  - `GET /api/events/search`
  - `GET /api/events/{eventId}`
  - `POST /api/events/{eventId}/reviews`
  - `GET /api/events/{eventId}/reviews`
  - `DELETE /api/events/{eventId}/reviews/{reviewId}`
  - `POST /api/events/{eventId}/actions/homepage-click`
- [src/features/exhibitions/api/bookmarksApi.ts](src/features/exhibitions/api/bookmarksApi.ts)
  - `POST /api/bookmarks/{eventId}`
  - `DELETE /api/bookmarks/{eventId}`
- [src/features/user/api/authApi.ts](src/features/user/api/authApi.ts)
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `POST /api/auth/guest-login`
  - `POST /api/auth/logout`
- [src/features/user/api/preferencesApi.ts](src/features/user/api/preferencesApi.ts)
  - `GET /api/preferences/categories`
  - `POST /api/preferences`
- [src/features/user/api/myPageApi.ts](src/features/user/api/myPageApi.ts)
  - `GET /api/users/me`
  - `PUT /api/users/me/nickname`
  - `PUT /api/users/me/profile_image`
  - `GET /api/users/me/reviews`
  - `GET /api/users/me/bookmarks`

## 화면별 참고

- 홈 추천 API는 로그인 사용자 전용이며, 백엔드에 저장된 개인화 추천을 조회합니다.
- 취향 선택 화면은 API가 반환하는 최대 20개 seed event 중 5개 이상 20개 이하를 선택해 저장합니다.
- 전체보기 화면은 기본 목록 정렬에서 `GET /api/events`를 사용하고, 검색어 입력 또는 거리순 정렬에서는 `GET /api/events/search`를 사용합니다.
- 전체보기의 `sort=match`는 취향 기반 추천 결과 특성상 최대 10개의 전시·공연만 표시된다는 안내 문구를 함께 보여줍니다.
- 상세 화면의 “홈페이지 이동하기”는 먼저 `POST /api/events/{eventId}/actions/homepage-click`를 호출하고, 수집 API 성공 여부와 관계없이 외부 URL로 이동합니다.

## 검증

코드 변경 후에는 다음 명령어를 실행해 확인합니다.

```bash
npm run lint
npm run build
```
