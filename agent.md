# Agent Guide

This guide is for Codex or other AI agents working in `capstone-ui`. Before making changes, inspect the actual codebase. Do not invent files, commands, routes, APIs, or project capabilities that are not present.

## Project Overview

`capstone-ui` is a React, TypeScript, and Vite frontend for Arbit, an exhibition and cultural event recommendation UI. Home, exhibition discovery, exhibition detail, review writing, preferences, authentication, and My Page profile/review/bookmark flows use API helper functions.

Most user-facing copy is Korean. Keep new UI text consistent with the existing Korean product voice unless the user asks for another language.

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- ESLint
- Plain CSS files imported by route/page components

There is no configured test runner, global state library, or component library.

`src/index.css` imports Pretendard Variable from jsDelivr and exposes the shared
`--font-sans` variable. Route styles use that variable for the default sans-serif
stack. Keep serif display text overrides where they already exist.

## Commands

Only use commands that exist in `package.json`.

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

For code changes, run `npm run lint` and `npm run build` unless the user explicitly asks not to or the environment blocks it.

## Routing

Routes are declared directly in `src/main.tsx`.

- `/`
- `/exhibitions/all`
- `/exhibitions/:id`
- `/exhibitions/:id/review`
- `/user/login`
- `/user/signup`
- `/user/preferences` (signup onboarding only)
- `/user/mypage`

Legacy `/exhibitions/search` and `/exhibition/all` URLs redirect to
`/exhibitions/all`.

When adding a new route page, put the component under the relevant `src/features/<feature>/pages` folder, import it in `src/main.tsx`, and add a `<Route>`. Use `Link` from `react-router-dom` for internal navigation.

## Code Structure

- `src/App.tsx`: home route switch for guest and logged-in users.
- `src/main.tsx`: app mount and route declarations.
- `src/components/`: shared `AppHeader` and `AppFooter`.
- `src/api/`: API base URL, auth storage, request header helpers, and home API helpers.
- `src/hooks/`: shared hooks.
- `src/types/`: home page types.
- `src/features/exhibitions/`: exhibition API functions, pages, types, and styles.
- `src/features/home/`: guest/logged-in home pages, shared home event section, and date utilities.
- `src/features/user/`: login, signup, preferences, My Page, user API functions, user types, and styles.
- `public/`: static public assets.

## API Rules

Use `API_BASE_URL` from `src/api/config.ts`. It reads `VITE_API_BASE_URL`. During local development, the default is an empty base URL so `/api` requests go through the Vite proxy. For production builds, it falls back to `http://34.138.160.76:8080`.

The Vite development proxy forwards `/api` to `VITE_API_PROXY_TARGET` or `http://34.138.160.76:8080`.

Use `src/api/authStorage.ts` for auth storage behavior.

- Login status key: `arbit.isLoggedIn`
- Access token key: `accessToken`
- Refresh token key: `refreshToken`
- Authenticated username key: `arbit.authenticatedUsername`
- Recommendation event IDs by username key: `arbit.recommendationEventIdsByUsername`
- Preferences onboarding session key: `arbit.preferencesOnboarding`

Use `src/api/headers.ts` for request headers.

- JSON requests: `createJsonHeaders()`
- File upload requests: `createUploadHeaders()`
- Bearer-token requests: `createAuthorizationHeaders()`

Do not manually set `Content-Type` on file upload requests. Let the browser set the multipart boundary.

## Home API

`src/api/homeApi.ts`

- `getHome()`: `GET /api/home`
- `getHomeRecommendations()`: `GET /api/home/recommendations`

`getHomeRecommendations()` is for authenticated users. It sends a bearer token and 4-5 selected event IDs as repeated `eventIds` query parameters. After saving preferences, store the returned IDs through `saveRecommendationEventIds()`. The home page skips this request when there is no valid JWT or no stored recommendation event IDs.

Login also attempts to load recommendations before navigating home. Clicking the
home logo while already on the home route refreshes personalized recommendations
instead of navigating. The home recommendation cards and all-exhibitions cards
support bookmark mutations for authenticated users. Guest home bookmark actions
navigate to login.

## Exhibition API

`src/features/exhibitions/api/eventsApi.ts`

- `getEvents(query)`: `GET /api/events`
- `getEventDetail(eventId)`: `GET /api/events/{eventId}`
- `createEventReview(eventId, request)`: `POST /api/events/{eventId}/reviews`
- `getEventReviews(eventId)`: `GET /api/events/{eventId}/reviews`

Event query helpers append array filters as repeated query parameters. Do not replace this with hand-built query strings unless the backend contract changes.

Only `createEventReview()` sends a bearer token in this file. Its 401 response clears auth storage and redirects to `/user/login`.

`src/features/exhibitions/api/bookmarksApi.ts`

- `addBookmark(eventId)`: `POST /api/bookmarks/{eventId}`
- `removeBookmark(eventId)`: `DELETE /api/bookmarks/{eventId}`

Bookmark mutation requests send a bearer token. A 401 response clears auth storage and redirects to `/user/login`.

## User API

`src/features/user/api/authApi.ts`

- `signup`
- `login`
- `logout`: `POST /api/auth/logout`

Login and signup store tokens through `useAuthStatus().setAuthTokens()`. Logout sends a bearer token and clears auth storage after a successful response.

`src/features/user/api/preferencesApi.ts`

- `getPreferenceCategories()`: `GET /api/preferences/categories`
- `savePreferences(request)`: `POST /api/preferences`

Only `savePreferences()` sends a bearer token. It wraps the selected event ID
array as `{ success: true, data: selectedEventIds, error: null }`. The screen is
available only immediately after signup while the session onboarding marker is
present, requires exactly 5 selected events, and stores the IDs returned by the
API for later home recommendation requests. A 401 response clears auth storage
and redirects to `/user/login`.

`src/features/user/api/myPageApi.ts`

- `getMyProfile()`: `GET /api/users/me`
- `updateNickname(nickname)`: `PUT /api/users/me/nickname`
- `updateProfileImage(file)`: `PUT /api/users/me/profile_image`
- `getMyReviews()`: `GET /api/users/me/reviews`
- `getMyBookmarks()`: `GET /api/users/me/bookmarks`

For `/api/users/me` requests, a 401 response clears auth storage and redirects to `/user/login`. Non-401 errors should remain catchable by the screen so the UI can show an error message.

## Data Sources

API-backed flows:

- Home: `src/api/homeApi.ts`
- Exhibition list/detail/review: `src/features/exhibitions/api/eventsApi.ts`
- Bookmark add/remove: `src/features/exhibitions/api/bookmarksApi.ts`
- Preferences: `src/features/user/api/preferencesApi.ts`
- My Page profile/reviews/bookmarks: `src/features/user/api/myPageApi.ts`

Exhibition filter options are UI constants declared in the relevant page components. Do not add mock event records as API fallbacks.

My Page API response types live in:

- `src/features/user/types/myPageApi.ts`

## Current UI Boundaries

Do not assume a visible control is already backed by behavior.

- The former search screen is merged into all-exhibitions. The all-exhibitions
  screen sends category, district, period, price, date, and sort filters to the
  API, then applies keyword search to the loaded result in the browser.
- The all-exhibitions "더 보기" button paginates the already loaded API result in
  the browser in groups of 20. It does not request another backend page.
- The login "로그인 유지" checkbox and "계정 찾기" button are currently
  presentation-only.
- My Page bookmark hearts and review share buttons are currently
  presentation-only.
- Review writing sends `rating`, `content`, and `verificationImageUrl`.
  `visitedYear`, `visitedMonth`, and public/private selection are validated or
  displayed in the form but are not included in the API request.

## Styling Guidelines

- Reuse existing CSS files and class naming patterns.
- Use the shared `--font-sans` variable for default sans-serif text. Update
  `src/index.css` if the project-wide font stack changes.
- Shared shell UI should use `AppHeader` and `AppFooter`.
- Avoid broad global CSS changes unless the task explicitly requires them.
- Many posters and illustrations are CSS-drawn. If changing artwork keys or variant unions, update both TypeScript unions and the matching CSS selectors.
- When adding UI states, keep loading, empty, and error states visually consistent with the surrounding page.

## Accessibility And UX

- Keep form labels explicit.
- Use buttons for in-page actions and links for navigation.
- Use `role="status"` for loading/status messages and `role="alert"` for errors where appropriate.
- For hidden file inputs, trigger them from an accessible button and validate invalid files before making API requests.

## Working Rules

- Start by inspecting files with `rg --files`, `rg`, and focused file reads.
- Prefer existing types, hooks, API helpers, and styling conventions.
- Keep changes scoped to the user request.
- Do not add local mock data as a fallback for API-backed flows.
- Preserve API parsing support for both wrapped `{ success, data, error }` responses and direct payload responses unless the backend contract is explicitly narrowed.
- Do not add new dependencies, routes, or backend contracts unless the user asks for them.
- In final responses, summarize changed files and verification commands.

## Verification

Recommended checks:

```bash
npm run lint
npm run build
```

For UI changes, run the dev server and inspect the affected route when appropriate.

```bash
npm run dev
```
