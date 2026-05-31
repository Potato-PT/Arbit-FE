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
- `/exhibitions/search`
- `/exhibitions/all`
- `/exhibitions/:id`
- `/exhibitions/:id/review`
- `/user/login`
- `/user/signup`
- `/user/preferences`
- `/user/mypage`

When adding a new route page, put the component under the relevant `src/features/<feature>/pages` folder, import it in `src/main.tsx`, and add a `<Route>`. Use `Link` from `react-router-dom` for internal navigation.

## Code Structure

- `src/App.tsx`: home route.
- `src/main.tsx`: app mount and route declarations.
- `src/components/`: shared `AppHeader` and `AppFooter`.
- `src/api/`: API base URL, auth storage, request header helpers, and home API helpers.
- `src/hooks/`: shared hooks.
- `src/types/`: home page types.
- `src/features/exhibitions/`: exhibition API functions, pages, types, and styles.
- `src/features/user/`: login, signup, preferences, My Page, user API functions, user types, and styles.
- `public/`: static public assets.

## API Rules

Use `API_BASE_URL` from `src/api/config.ts`. It reads `VITE_API_BASE_URL` and falls back to `http://34.138.160.76:8080`.

Use `src/api/authStorage.ts` for auth storage behavior.

- Login status key: `arbit.isLoggedIn`
- Access token key: `accessToken`
- Refresh token key: `refreshToken`

Use `src/api/headers.ts` for request headers.

- JSON requests: `createJsonHeaders()`
- File upload requests: `createUploadHeaders()`
- Bearer-token requests: `createAuthorizationHeaders()`

Do not manually set `Content-Type` on file upload requests. Let the browser set the multipart boundary.

## Home API

`src/api/homeApi.ts`

- `getHome()`: `GET /api/home`
- `getHomeRecommendations()`: `GET /api/home/recommendations`

`getHomeRecommendations()` accepts 4-5 selected event IDs, sends them as repeated `eventIds` query parameters, and sends a bearer token. It falls back to `getHome()` when the ID count is outside that range or the API returns 401. Keep this behavior when changing the home page for logged-out compatibility.

## Exhibition API

`src/features/exhibitions/api/eventsApi.ts`

- `getEvents(query)`: `GET /api/events`
- `searchEvents(query)`: `GET /api/events/search`
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

Login and signup store tokens through `useAuthStatus().setAuthTokens()`.

`src/features/user/api/preferencesApi.ts`

- `getPreferenceCategories()`: `GET /api/preferences/categories`
- `savePreferences(request)`: `POST /api/preferences`

Only `savePreferences()` sends a bearer token. A 401 response clears auth storage and redirects to `/user/login`.

`src/features/user/api/myPageApi.ts`

- `getMyProfile()`: `GET /api/users/me`
- `updateNickname(nickname)`: `PUT /api/users/me/nickname`
- `updateProfileImage(file)`: `PUT /api/users/me/profile_image`
- `getMyReviews()`: `GET /api/users/me/reviews`
- `getMyBookmarks()`: `GET /api/users/me/bookmarks`
- `deleteMyAccount()`: `DELETE /api/users/me`

For `/api/users/me` requests, a 401 response clears auth storage and redirects to `/user/login`. Non-401 errors should remain catchable by the screen so the UI can show an error message.

## Data Sources

API-backed flows:

- Home: `src/api/homeApi.ts`
- Exhibition list/search/detail/review: `src/features/exhibitions/api/eventsApi.ts`
- Bookmark add/remove: `src/features/exhibitions/api/bookmarksApi.ts`
- Preferences: `src/features/user/api/preferencesApi.ts`
- My Page profile/reviews/bookmarks: `src/features/user/api/myPageApi.ts`

Exhibition filter options are UI constants declared in the relevant page components. Do not add mock event records as API fallbacks.

My Page API response types live in:

- `src/features/user/types/myPageApi.ts`

## Styling Guidelines

- Reuse existing CSS files and class naming patterns.
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
