# Agent Guide

This guide is for AI coding agents and developers working on `capstone-ui`. Inspect the current code before editing, preserve existing behavior unless the user asks for a change, and use Swagger as the source of truth for backend contracts.

## Project Context

`capstone-ui` is a React, TypeScript, and Vite frontend for Arbit, an exhibition and cultural event recommendation service. Most user-facing text is Korean. The app includes guest and logged-in home screens, exhibition discovery, event detail, review writing, preference onboarding, authentication, and My Page.

## Public Links

- Service: `https://arbit-umber.vercel.app/`
- Backend API server: `https://piec.store`
- Swagger UI: `https://piec.store/swagger-ui/index.html`
- Swagger JSON: `https://piec.store/v3/api-docs`

## Commands

Use only scripts defined in `package.json`.

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

Run `npm run lint` and `npm run build` after code changes unless the user explicitly asks not to or the environment blocks the commands.

## Important Routes

Routes are declared in `src/main.tsx`.

- `/`
- `/exhibitions/all`
- `/exhibitions/:id`
- `/exhibitions/:id/review`
- `/user/login`
- `/user/signup`
- `/user/preferences`
- `/user/mypage`

Legacy `/exhibitions/search` and `/exhibition/all` redirect to `/exhibitions/all`.

## Key Files

- `README.md`: public GitHub-facing project overview; keep Korean wording natural and use repository-relative links
- `src/api/config.ts`: API base URL configuration
- `vite.config.ts`: development proxy configuration
- `src/api/authStorage.ts`: token and onboarding storage
- `src/api/headers.ts`: request header helpers
- `src/api/homeApi.ts`: home and recommendation API helpers
- `src/features/exhibitions/api/eventsApi.ts`: events, detail, reviews, homepage-click API helpers
- `src/features/exhibitions/api/bookmarksApi.ts`: bookmark mutations
- `src/features/user/api/authApi.ts`: signup, login, guest login, logout
- `src/features/user/api/preferencesApi.ts`: preference seed events and preference save
- `src/features/user/api/myPageApi.ts`: profile, nickname, profile image, my reviews, my bookmarks

## API Rules

Use `API_BASE_URL` from `src/api/config.ts`. It reads `VITE_API_BASE_URL`. In development, the default is an empty string so `/api` requests go through the Vite proxy. In production, the fallback is `https://piec.store`.

The Vite proxy sends `/api` requests to `VITE_API_PROXY_TARGET` or `https://piec.store`.

Swagger references:

- UI: `https://piec.store/swagger-ui/index.html`
- JSON: `https://piec.store/v3/api-docs`

Header helpers:

- `createAuthorizationHeaders()` for bearer-token requests without a JSON body
- `createJsonHeaders()` for JSON body requests
- `createUploadHeaders()` for file upload requests

Do not manually set `Content-Type` for `FormData` uploads.

## Current API Contracts

- `GET /api/home`: public home data
- `GET /api/home/recommendations`: authenticated stored recommendations, bearer token only
- `GET /api/preferences/categories`: public preference seed events, frontend uses up to 20
- `POST /api/preferences`: authenticated preference save, body is wrapped as `{ success: true, data: selectedEventIds, error: null }`
- `GET /api/events`: event list; sort values are `match`, `deadline`, `latest`, `rating`
- `GET /api/events/search`: search endpoint; use this for keyword search and distance sort
- `POST /api/events/{eventId}/actions/homepage-click`: authenticated click collection, no request body
- Bookmark, review, and My Page mutation requests require bearer tokens as documented in Swagger

Do not invent request bodies, query parameters, or fallback mock data. If Swagger and the UI requirement conflict, ask for backend confirmation unless the correct behavior is unambiguous.

## Auth And Storage

Auth state is managed in `src/api/authStorage.ts`.

- `accessToken` and `refreshToken` are stored in `localStorage`
- login status key: `arbit.isLoggedIn`
- authenticated username key: `arbit.authenticatedUsername`
- preference onboarding marker: `arbit.preferencesOnboarding` in `sessionStorage`

On 401 responses for authenticated flows, existing helpers generally clear auth storage and redirect to `/user/login`. Preserve that behavior unless the user explicitly asks to change it.

## UI And Styling Rules

- Preserve visual design, layout, and UX flow unless the user explicitly requests UI changes.
- Reuse existing CSS files and class naming prefixes such as `home-*`, `all-*`, `detail-*`, `login-*`, `signup-*`, `preferences-*`, and `mypage-*`.
- Shared layout should use `AppHeader`, `AppFooter`, and existing status components where appropriate.
- Use the project-wide `--font-sans` variable from `src/index.css`; keep existing serif display overrides.
- Keep loading, empty, and error states consistent with nearby screens.
- Use links for navigation and buttons for in-page actions.

## Things Not To Change Without Confirmation

- Backend endpoint contracts not documented in Swagger
- Route structure or redirects
- Visible design, spacing, colors, and user-facing flow
- Auth storage keys
- Preference selection requirement of 5 to 20 events from up to 20 API seed events
- API-backed flows to local mock data
- New dependencies or state libraries

## Refactoring Guidance

Safe refactors are welcome when they improve readability, type safety, naming, or duplication without changing behavior. Avoid refactors that could affect API behavior, routing, layout, or visible functionality. If a risky refactor is identified, leave a note instead of applying it.

## Documentation Guidance

When editing `README.md`, preserve the major feature list, tech stack, setup commands, environment variables, routes, and API integration notes unless the user asks to remove them. Use GitHub-compatible relative links such as `src/api/config.ts`, not local absolute paths.

## Verification

For most code changes:

```bash
npm run lint
npm run build
```

For UI or API-flow changes, also run the dev server and inspect the affected route and Network requests.
