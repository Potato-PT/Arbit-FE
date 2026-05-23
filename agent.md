# Agent Guide

This guide is for Codex or other AI agents working in `capstone-ui`. Before making changes, inspect the actual codebase. Do not invent files, commands, routes, APIs, or project capabilities that are not present.

## Project Overview

`capstone-ui` is a React, TypeScript, and Vite frontend for Arbit, an exhibition and cultural event recommendation UI. Most exhibition discovery flows use local mock data. Authentication and the My Page profile/review/bookmark flows use API helper functions.

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
- `src/api/`: API base URL, auth storage, and request header helpers.
- `src/hooks/`: shared hooks.
- `src/data/` and `src/types/`: home page mock data and types.
- `src/features/exhibitions/`: exhibition pages, mock data, types, and styles.
- `src/features/user/`: login, signup, preferences, My Page, user API functions, user types, and styles.
- `public/`: static public assets.

## API Rules

Use `API_BASE_URL` from `src/api/config.ts`. It reads `VITE_API_BASE_URL` and falls back to `http://localhost:8080`.

Use `src/api/authStorage.ts` for auth storage behavior.

- Login status key: `arbit.isLoggedIn`
- Access token key: `accessToken`
- Refresh token key: `refreshToken`

Use `src/api/headers.ts` for request headers.

- JSON requests: `createJsonHeaders()`
- File upload requests: `createUploadHeaders()`

Do not manually set `Content-Type` on file upload requests. Let the browser set the multipart boundary.

## User API

`src/features/user/api/authApi.ts`

- `signup`
- `login`

Login and signup store tokens through `useAuthStatus().setAuthTokens()`.

`src/features/user/api/myPageApi.ts`

- `getMyProfile()`: `GET /api/users/me`
- `updateNickname(nickname)`: `PUT /api/users/me/nickname`
- `updateProfileImage(file)`: `PUT /api/users/me/profile_image`
- `getMyReviews()`: `GET /api/users/me/reviews`
- `getMyBookmarks()`: `GET /api/users/me/bookmarks`

For `/api/users/me` requests, a 401 response clears auth storage and redirects to `/user/login`. Non-401 errors should remain catchable by the screen so the UI can show an error message.

## Data Sources

Exhibition flows use mock data:

- `src/data/homeMock.ts`
- `src/features/exhibitions/data/allExhibitionsMock.ts`
- `src/features/exhibitions/data/searchMock.ts`
- `src/features/exhibitions/data/exhibitionDetails.ts`

Preference selection uses:

- `src/features/user/data/preferenceCategories.ts`

My Page API response types live in:

- `src/features/user/types/myPageApi.ts`

`useFavoriteExhibitions()` is used for local favorite state on the home recommendation cards. The My Page bookmark list is API-backed, so do not treat that hook as the My Page bookmark source.

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
- Do not mix mock-backed and API-backed flows by assumption.
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
