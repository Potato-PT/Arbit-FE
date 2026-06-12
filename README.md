# Arbit UI

Arbit UI는 전시와 문화 행사를 탐색하고, 취향 기반 추천을 확인할 수 있는 React 프론트엔드입니다. 홈, 전체보기, 상세, 후기, 북마크, 취향 설정, 로그인, 회원가입, 마이페이지 흐름을 백엔드 API와 연동해 제공합니다.

## 주요 기능

- 게스트/로그인 상태에 따른 홈 화면 제공
- 취향 설정 기반 개인화 전시·공연 추천
- 전시·공연 전체보기, 검색, 정렬, 필터, 더 보기 UI
- 전시·공연 상세 정보와 외부 홈페이지 이동
- 홈페이지 클릭 수집 API 연동
- 북마크 추가/삭제
- 리뷰 조회, 작성, 삭제
- 회원가입, 로그인, 게스트 로그인, 로그아웃
- 취향 설정 온보딩
- 마이페이지 프로필, 닉네임, 프로필 이미지, 내 리뷰, 북마크 관리

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

개발 서버는 기본적으로 `http://localhost:5173/`에서 실행됩니다. 5173 포트가 이미 사용 중이면 Vite가 다음 사용 가능한 포트를 안내합니다.

## 사용 가능한 명령어

```bash
npm run dev      # 개발 서버 실행
npm run build    # TypeScript 빌드 및 프로덕션 번들 생성
npm run lint     # ESLint 검사
npm run preview  # 빌드 결과 미리보기
```

## 환경 변수

API base URL은 [src/api/config.ts](src/api/config.ts)에서 관리합니다.

```env
VITE_API_BASE_URL=
VITE_API_PROXY_TARGET=
```

- 개발 환경에서 `VITE_API_BASE_URL`이 없으면 `/api`로 요청하고, Vite proxy가 요청을 전달합니다.
- Vite proxy 대상은 `VITE_API_PROXY_TARGET`이며 기본값은 `https://piec.store`입니다.
- 프로덕션 빌드에서 `VITE_API_BASE_URL`이 없으면 `https://piec.store`를 기본 API 서버로 사용합니다.

## API 연결

- 운영 API 서버: `https://piec.store`
- Swagger UI: `https://piec.store/swagger-ui/index.html`
- Swagger JSON: `https://piec.store/v3/api-docs`

주요 API helper는 다음 파일에 있습니다.

- [src/api/homeApi.ts](src/api/homeApi.ts): 홈, 홈 추천 API
- [src/features/exhibitions/api/eventsApi.ts](src/features/exhibitions/api/eventsApi.ts): 전시 목록, 검색, 추천순, 상세, 리뷰, 홈페이지 클릭 API
- [src/features/exhibitions/api/bookmarksApi.ts](src/features/exhibitions/api/bookmarksApi.ts): 북마크 API
- [src/features/user/api/authApi.ts](src/features/user/api/authApi.ts): 회원가입, 로그인, 게스트 로그인, 로그아웃 API
- [src/features/user/api/preferencesApi.ts](src/features/user/api/preferencesApi.ts): 취향 선택 seed event, 취향 저장 API
- [src/features/user/api/myPageApi.ts](src/features/user/api/myPageApi.ts): 마이페이지 API

인증이 필요한 요청은 `Authorization: Bearer {accessToken}` 헤더를 사용합니다. 파일 업로드 요청은 `FormData`를 사용하며, `Content-Type`은 브라우저가 자동으로 설정하도록 직접 지정하지 않습니다.

## 주요 화면과 라우트

라우트는 [src/main.tsx](src/main.tsx)에 선언되어 있습니다.

| 경로 | 화면 |
| --- | --- |
| `/` | 홈 |
| `/exhibitions/all` | 전시·공연 전체보기 |
| `/exhibitions/:id` | 전시·공연 상세 |
| `/exhibitions/:id/review` | 리뷰 작성 |
| `/user/login` | 로그인 |
| `/user/signup` | 회원가입 |
| `/user/preferences` | 취향 설정 |
| `/user/mypage` | 마이페이지 |

`/exhibitions/search`와 `/exhibition/all`은 `/exhibitions/all`로 리다이렉트됩니다.

## 화면별 동작 메모

- 홈 추천은 로그인 사용자 전용 API인 `GET /api/home/recommendations`를 사용합니다.
- 취향 설정은 `GET /api/preferences/categories`가 반환한 최대 20개의 seed event 중 5개 이상 20개 이하를 선택해 저장합니다.
- 전체보기에서 일반 정렬 `deadline`, `latest`, `rating`은 `GET /api/events`를 사용합니다.
- 전체보기에서 추천순 `match`는 `GET /api/events/matches`를 사용하며 로그인 사용자가 필요합니다.
- 검색어 입력 또는 거리순 정렬은 기존 검색 API `GET /api/events/search`를 사용합니다.
- 상세 화면의 홈페이지 버튼은 외부 URL을 정규화한 뒤 새 탭으로 열고, 클릭 수집 API 실패 여부와 관계없이 외부 이동을 유지합니다.

## 폴더 구조

```text
src/
  api/                    # 공통 API 설정, 인증 저장소, 헤더 유틸, 홈 API
  assets/                 # 로컬 이미지 리소스
  components/             # 공통 AppHeader, AppFooter, StatusMessage
  features/
    exhibitions/          # 전시 목록, 상세, 리뷰, 북마크
      api/
      pages/
      styles/
      types/
    home/                 # 게스트 홈, 로그인 홈, 홈 섹션 컴포넌트
      components/
      pages/
      utils/
    user/                 # 인증, 취향 설정, 마이페이지
      api/
      pages/
      styles/
      types/
  hooks/                  # 공통 React hooks
  styles/                 # 홈 등 화면 단위 스타일
  types/                  # 홈 화면 타입
```

## 검증

코드 변경 후에는 다음 명령어로 기본 검증을 수행합니다.

```bash
npm run lint
npm run build
```
