# Arbit UI

Arbit UI는 전시와 문화 행사를 탐색하고, 전시 상세와 리뷰를 확인하며, 사용자 프로필을 관리할 수 있는 React 프론트엔드 프로젝트입니다. React, TypeScript, Vite, React Router를 사용합니다.

홈, 전시 목록, 전시 검색, 전시 상세, 후기 작성, 취향 선택, 로그인/회원가입, 마이페이지 흐름은 설정된 백엔드 base URL을 사용하는 API 함수와 연결되어 있습니다.

## 주요 기능

- 홈 화면에서 대표 전시와 개인화 추천 전시 카드를 확인합니다.
- 전시 전체보기 화면에서 필터와 정렬을 사용해 API 전시 목록을 탐색합니다.
- 전시 검색 화면에서 키워드, 지역, 장르, 기간, 가격, 거리순 정렬을 사용합니다.
- 전시 상세 화면에서 API 전시 정보와 리뷰를 확인합니다.
- 후기 작성 화면에서 API로 리뷰를 등록합니다.
- 홈과 전시 전체보기 화면에서 전시 북마크를 추가하거나 삭제합니다.
- 로그인과 회원가입 성공 시 `accessToken`, `refreshToken`을 저장합니다.
- 취향 선택 화면에서 API로 카테고리를 불러오고 선택 결과를 저장합니다.
- 마이페이지에서 프로필 조회, 닉네임 수정, 프로필 이미지 업로드, 내 리뷰 목록, 북마크 목록, 로그아웃을 사용할 수 있습니다.

## 시작하기

```bash
npm install
npm run dev
```

Vite 개발 서버는 일반적으로 `http://localhost:5173/`에서 실행됩니다.

## 명령어

다음 명령어는 `package.json`에 정의되어 있습니다.

```bash
npm run dev      # Vite 개발 서버 실행
npm run build    # TypeScript 빌드와 Vite 프로덕션 빌드
npm run lint     # ESLint 실행
npm run preview  # 프로덕션 빌드 미리보기
```

## 환경 변수

API base URL은 `src/api/config.ts`에서 관리합니다.

```ts
VITE_API_BASE_URL
VITE_API_PROXY_TARGET
```

개발 서버에서는 `VITE_API_BASE_URL`이 설정되어 있지 않으면 `/api` 요청을 같은 origin으로 보내고, Vite proxy가 `VITE_API_PROXY_TARGET` 또는 기본값 `http://34.138.160.76:8080`으로 전달합니다. 프로덕션 빌드에서는 `VITE_API_BASE_URL`이 없으면 `http://34.138.160.76:8080`을 사용합니다.

## 라우트

라우트는 `src/main.tsx`에 선언되어 있습니다.

- `/`: 홈
- `/exhibitions/search`: 전시 검색
- `/exhibitions/all`: 전시 전체보기
- `/exhibitions/:id`: 전시 상세
- `/exhibitions/:id/review`: 후기 작성
- `/user/login`: 로그인
- `/user/signup`: 회원가입
- `/user/preferences`: 취향 선택
- `/user/mypage`: 마이페이지

## 프로젝트 구조

```text
src/
  api/
    authStorage.ts      # 인증 토큰 저장소 유틸
    config.ts           # API base URL 설정
    headers.ts          # JSON/업로드 요청 헤더 유틸
    homeApi.ts          # 홈 API 함수
  assets/               # 로컬 이미지 assets
  components/           # 공통 AppHeader, AppFooter
  features/
    exhibitions/
      api/              # 전시 목록, 검색, 상세, 리뷰 API 함수
      pages/            # 전시 관련 라우트 화면
      styles/           # 전시 화면 CSS
      types/            # 전시 데이터 타입
    user/
      api/              # 인증과 마이페이지 API 함수
      pages/            # 로그인, 회원가입, 취향 선택, 마이페이지
      styles/           # 사용자 화면 CSS
      types/            # 마이페이지 API 타입
  hooks/                # 공통 React hooks
  styles/               # 홈 화면 CSS
  types/                # 홈 화면 타입
```

## API 연동

API base URL은 `src/api/config.ts`의 설정을 사용합니다.

홈 API 함수는 `src/api/homeApi.ts`에 있습니다.

- `GET /api/home`
- `GET /api/home/recommendations`

전시 API 함수는 `src/features/exhibitions/api/eventsApi.ts`에 있습니다.

- `GET /api/events`
- `GET /api/events/search`
- `GET /api/events/{eventId}`
- `POST /api/events/{eventId}/reviews`
- `GET /api/events/{eventId}/reviews`

북마크 API 함수는 `src/features/exhibitions/api/bookmarksApi.ts`에 있습니다.

- `POST /api/bookmarks/{eventId}`
- `DELETE /api/bookmarks/{eventId}`

인증 API 함수는 `src/features/user/api/authApi.ts`에 있습니다.

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`

취향 선택 API 함수는 `src/features/user/api/preferencesApi.ts`에 있습니다.

- `GET /api/preferences/categories`
- `POST /api/preferences`

마이페이지 API 함수는 `src/features/user/api/myPageApi.ts`에 있습니다.

- `GET /api/users/me`
- `PUT /api/users/me/nickname`
- `PUT /api/users/me/profile_image`
- `GET /api/users/me/reviews`
- `GET /api/users/me/bookmarks`

토큰이 필요한 요청은 `Authorization: Bearer {accessToken}` 헤더를 포함합니다. 파일 업로드 요청은 `FormData`를 사용하며 `Content-Type`을 직접 지정하지 않습니다. 마이페이지 계열, 리뷰 작성, 취향 저장, 북마크 추가/삭제 요청에서 401이 발생하면 저장된 인증 상태를 삭제하고 `/user/login`으로 이동합니다. 홈 추천 API는 로그인 사용자 전용이며, 취향 저장 API가 반환한 4~5개의 이벤트 ID를 사용자 아이디별 `localStorage` 캐시에 저장해 반복 `eventIds` query parameter로 전송합니다. 유효한 JWT 또는 현재 사용자의 저장된 이벤트 ID가 없으면 추천 API를 호출하지 않습니다.

## 데이터 소스

화면에 표시하는 이벤트, 추천, 취향 선택, 마이페이지 데이터는 API에서 불러옵니다. 전시 전체보기와 검색의 필터 선택지는 해당 페이지의 UI 상수로 관리합니다.

홈은 `src/api/homeApi.ts`, 전시 탐색/상세/리뷰 작성은 `src/features/exhibitions/api/eventsApi.ts`, 북마크 추가/삭제는 `src/features/exhibitions/api/bookmarksApi.ts`, 취향 선택은 `src/features/user/api/preferencesApi.ts`, 마이페이지의 프로필/리뷰/북마크 목록은 `src/features/user/api/myPageApi.ts`의 API 함수를 통해 처리합니다.

## 개발 참고

- 공통 화면 구조는 `src/components`의 `AppHeader`, `AppFooter`를 사용합니다.
- 화면 스타일은 컴포넌트에서 직접 import하는 일반 CSS 파일로 관리합니다.
- 기존 클래스명은 `home-*`, `detail-*`, `login-*`, `signup-*`, `preferences-*`, `mypage-*`처럼 화면 또는 기능 단위 prefix를 사용합니다.
- 내부 페이지 이동에는 React Router의 `Link`를 사용합니다.
- 코드 변경 후에는 `npm run lint`와 `npm run build`를 실행해 확인하는 것을 권장합니다.
