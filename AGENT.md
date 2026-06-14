# Agent Guide

This guide is for AI coding agents and developers working on `capstone-ui`. Read the relevant code before editing, preserve existing behavior unless a task explicitly asks for a change, and use Swagger as the source of truth for backend contracts.

## Project Context

`capstone-ui` is the React, TypeScript, and Vite frontend for Arbit, an exhibition and cultural event recommendation service. Most user-facing copy is Korean. The app includes guest and logged-in home screens, exhibition discovery, event detail, review writing, preference onboarding, authentication, bookmarks, and My Page.

Public references:

- Service: `https://arbit-umber.vercel.app/`
- Backend API: `https://piec.store`
- Swagger UI: `https://piec.store/swagger-ui/index.html`
- Swagger JSON: `https://piec.store/v3/api-docs`

## Commands

Use scripts from `package.json`.

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

Run `npm run lint` and `npm run build` after code changes unless the user explicitly asks not to or the environment blocks the commands.

## Important Routes

Routes are declared in `src/main.tsx`.

- `/`: home
- `/exhibitions/all`: all exhibitions and events
- `/exhibitions/:id`: event detail
- `/exhibitions/:id/review`: review writing
- `/user/login`: login
- `/user/signup`: signup
- `/user/preferences`: preference setup for signup onboarding and logged-in users
- `/user/mypage`: My Page

Legacy `/exhibitions/search` and `/exhibition/all` redirect to `/exhibitions/all`.

## Key Files

- `README.md`: public GitHub-facing project documentation in Korean
- `vite.config.ts`: Vite dev proxy configuration
- `src/api/config.ts`: API base URL configuration
- `src/api/authStorage.ts`: tokens, auth flags, onboarding markers, optional recommendation ID cache
- `src/api/headers.ts`: API header helpers
- `src/api/homeApi.ts`: home and home recommendation API helpers
- `src/features/home/utils/homeHeroUtils.ts`: home hero event selection helper
- `src/features/exhibitions/api/eventsApi.ts`: event list, match list, search, detail, reviews, homepage click API helpers
- `src/features/exhibitions/api/bookmarksApi.ts`: bookmark mutations
- `src/features/user/api/authApi.ts`: signup, login, guest login, logout
- `src/features/user/api/preferencesApi.ts`: preference seed events and preference save
- `src/features/user/api/myPageApi.ts`: profile, nickname, profile image, my reviews, my bookmarks

## API Rules

Use `API_BASE_URL` from `src/api/config.ts`.

- Development fallback: `''`, so `/api` requests go through the Vite proxy.
- Production fallback: `https://piec.store`.
- Vite proxy target: `VITE_API_PROXY_TARGET` or `https://piec.store`.

Do not invent request bodies, query parameters, response shapes, or fallback mock data. Confirm current behavior against Swagger before changing API contracts.

Current stable endpoint rules:

- `GET /api/home` is public.
- `GET /api/home/recommendations` requires bearer auth.
- `GET /api/preferences/categories` is public and the UI uses up to 20 seed events.
- `POST /api/preferences` requires bearer auth and saves 5 to 20 selected event IDs.
- `GET /api/events` is public and uses only `deadline`, `latest`, and `rating` sort values.
- `GET /api/events/matches` requires bearer auth and is used for match/recommendation sort.
- `GET /api/events/search` is the search endpoint and is also used for filtered all-exhibition queries and distance sort.
- `POST /api/events/{eventId}/actions/homepage-click` records homepage clicks. External navigation must not depend on this request succeeding.
- Bookmark, review mutation, preference save, My Page, and recommendation APIs require bearer auth as documented in Swagger.

Header helpers:

- `createAuthorizationHeaders()` for authenticated requests without JSON bodies.
- `createJsonHeaders()` for JSON body requests.
- `createUploadHeaders()` for uploads.

Do not manually set `Content-Type` for `FormData`; let the browser set the multipart boundary.

## Authentication And Storage

Auth state lives in `src/api/authStorage.ts`.

- Access token key: `accessToken`
- Refresh token key: `refreshToken`
- Login status key: `arbit.isLoggedIn`
- Username key: `arbit.authenticatedUsername`
- Preference onboarding key: `arbit.preferencesOnboarding` in `sessionStorage`
- Recommendation ID cache key: `arbit.recommendationEventIdsByUsername`

The recommendation ID cache is optional and must not block preference save or home navigation. Guest login may not have an authenticated username, so cache writes must be best-effort.

On 401 responses for authenticated flows, existing helpers often clear auth storage and redirect to `/user/login`. Preserve that behavior unless the task explicitly changes auth flow.

## UI And Styling Rules

- Preserve visual design, layout, colors, spacing, and Korean copy unless the task asks for UI changes.
- Reuse existing screen CSS files and class prefixes such as `home-*`, `all-*`, `detail-*`, `review-*`, `login-*`, `signup-*`, `preferences-*`, and `mypage-*`.
- Use `AppHeader`, `AppFooter`, and `StatusMessage` for shared structure and states.
- Use `Link` for internal React Router navigation. Use `<a>` for external URLs.
- Homepage external URLs should be normalized before opening; missing URLs should not open blank tabs.
- Keep loading, empty, and error states consistent with nearby screens.

## Things Not To Change Without Confirmation

- Swagger-defined API contracts
- Route structure and redirects
- Auth storage keys
- Preference selection policy of 5 to 20 events
- Existing visual design and user-facing flow
- API-backed flows to local mock data
- New runtime dependencies or state libraries
- Working code that only appears unused without verifying call sites

## Development Conventions

- Prefer existing project patterns over new abstractions.
- Keep edits scoped to the requested feature or bug.
- Use TypeScript types near the API layer to document response variants.
- Preserve Korean user-facing copy style.
- Avoid large refactors when a focused fix is enough.
- If backend and frontend expectations conflict, document the mismatch and ask for backend confirmation unless Swagger is explicit.

## Verification

For most changes:

```bash
npm run lint
npm run build
```

For UI or API-flow changes, also run the dev server and inspect the affected route and Network requests when possible. A `502` from `/api/*` through Vite usually means the proxied backend returned `502`; verify by calling the backend URL directly.
