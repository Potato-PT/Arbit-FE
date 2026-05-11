# Agent Guide

## Project Overview

This repository is `capstone-ui`, a React, TypeScript, and Vite prototype for Arbit, a Korean exhibition recommendation UI. The app is currently frontend-only and uses local mock data to render the main product flows:

- Home and personalized exhibition recommendations
- Exhibition search with filters and sorting
- Exhibition detail pages with reviews
- Review writing
- Login, signup, preference selection, and my page screens

The UI copy is primarily Korean. Keep user-facing language consistent with the existing Korean product voice unless a task explicitly asks otherwise.

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- ESLint
- Plain CSS modules by convention, organized as page-level CSS files in `src/styles`

There is no backend, API client, test runner, state management library, or component library configured at the moment.

## Common Commands

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

Use `npm run build` for TypeScript and production build verification. Use `npm run lint` for static checks.

## App Structure

- `src/main.tsx` mounts the app and declares all routes with `BrowserRouter`.
- `src/App.tsx` is the home page route at `/`.
- `src/pages/` contains route-level screens:
  - `ArtSearch.tsx` for `/search`
  - `ExhibitionDetail.tsx` for `/exhibitions/:id`
  - `ReviewWrite.tsx` for `/exhibitions/:id/review`
  - `Login.tsx` for `/login`
  - `Signup.tsx` for `/signup`
  - `Preferences.tsx` for `/preferences`
  - `MyPage.tsx` for `/mypage`
- `src/data/` contains local mock data and simple data helpers.
- `src/types/` contains shared TypeScript interfaces for mock data.
- `src/styles/` contains one CSS file per major screen.
- `src/assets/` contains local bitmap assets such as `logo.png`, `artgallery.png`, and screen reference PNGs.
- `public/` contains static public assets.

Screen reference PNG files live in `src/assets`, including references for home, search, detail, login, signup, my page, and preferences. Treat them as references unless asked to modify or regenerate them.

## Routing

Routes are declared directly in `src/main.tsx`. When adding a new screen, add the page component under `src/pages`, import it in `main.tsx`, and add a corresponding `<Route>`.

Current routes:

- `/`
- `/search`
- `/exhibitions/:id`
- `/exhibitions/:id/review`
- `/login`
- `/signup`
- `/preferences`
- `/mypage`

Use `Link` and router navigation rather than plain anchors for internal navigation. External URLs in mock exhibition data currently point to `https://example.com/...`.

## Data Model

Mock data is intentionally typed:

- Home data: `src/data/homeMock.ts` with types from `src/types/home.ts`
- Search data: `src/data/searchMock.ts` with types from `src/types/search.ts`
- Detail and review data: `src/data/exhibitionDetails.ts` with types from `src/types/exhibitionDetail.ts`
- My page data: `src/data/myPageMock.ts`

Keep new mock entries aligned with the existing union types. If adding a new artwork key, update the corresponding type union and CSS selectors that render the artwork.

`addExhibitionReview` mutates in-memory mock data only. It does not persist after reload.

## Styling Conventions

- Styles are global CSS files imported by page components.
- Class names are page-scoped by prefix, such as `detail-*`, `login-*`, `preferences-*`, and `mypage-*`.
- The global root width is set in `src/index.css`:
  - `#root` has `width: 1126px`, `max-width: 100%`, centered layout, and white background.
- Many visual elements are CSS-drawn illustrations rather than image assets.
- SVG icons are mostly inline React helper components in each page file.

When changing UI, preserve the existing visual density and page-specific class naming. Avoid broad global CSS changes unless the task requires a cross-screen update.

## Accessibility And UX Notes

- Existing pages use semantic landmarks, labels, `aria-label`, `aria-labelledby`, and tab/radio roles in several places.
- Keep form labels explicit.
- Use buttons for in-page actions and links for navigation.
- Maintain keyboard-accessible interactions when adding filters, tabs, radio controls, or form flows.

## Implementation Guidelines

- Prefer small, route-local components when behavior is only used by one page.
- Move shared types to `src/types` only when multiple modules use them.
- Keep mock data separate from render components.
- Keep changes scoped to the affected page, data file, and CSS file.
- Do not introduce a new dependency unless it materially reduces complexity and fits the prototype.
- Do not add backend assumptions unless the task explicitly asks for API integration.

## Verification

Before handing off code changes, run:

```bash
npm run lint
npm run build
```

For visual changes, also run the dev server and inspect the affected route:

```bash
npm run dev
```

Then open the relevant local Vite URL, usually `http://localhost:5173/`.
