# Agent Guide

## Project Overview

This repository is `capstone-ui`, a React, TypeScript, and Vite prototype for Arbit, a Korean exhibition recommendation UI. The app is currently frontend-only and uses local mock data to render the main product flows:

- Home and personalized exhibition recommendations
- Full exhibition browsing page
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
- Plain CSS modules by convention, organized as page-level CSS files inside each feature folder

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
- `src/components/` contains shared UI shell components:
  - `AppHeader.tsx` / `AppHeader.css` for the shared top header
  - `AppFooter.tsx` / `AppFooter.css` for the shared footer
- `src/features/exhibitions/` contains exhibition route screens, mock data, types, and styles:
  - `pages/AllExhibitions.tsx` for `/exhibitions/all`
  - `pages/ExhibitionSearch.tsx` for `/exhibitions/search`
  - `pages/ExhibitionDetail.tsx` for `/exhibitions/:id`
  - `pages/ReviewWrite.tsx` for `/exhibitions/:id/review`
- `src/features/user/` contains user route screens, mock data, and styles:
  - `pages/Login.tsx` for `/user/login`
  - `pages/Signup.tsx` for `/user/signup`
  - `pages/Preferences.tsx` for `/user/preferences`
  - `pages/MyPage.tsx` for `/user/mypage`
- `src/data/` contains home-page mock data that is still shared outside a feature.
- `src/types/` contains home-page TypeScript interfaces that are still shared outside a feature.
- `src/hooks/` contains shared hooks used across features.
- `src/assets/` contains local bitmap assets such as `logo.png`, `artgallery.png`, and screen reference PNGs.
- `public/` contains static public assets.

Screen reference PNG files live in `src/assets`, including references for home, search, detail, login, signup, my page, and preferences. Treat them as references unless asked to modify or regenerate them.

## Routing

Routes are declared directly in `src/main.tsx`. When adding a new screen, add the page component under the matching `src/features/<feature>/pages` folder, import it in `main.tsx`, and add a corresponding `<Route>`.

Current routes:

- `/`
- `/user/login`
- `/user/signup`
- `/user/preferences`
- `/user/mypage`
- `/exhibitions/all`
- `/exhibitions/search`
- `/exhibitions/:id`
- `/exhibitions/:id/review`

Use `Link` and router navigation rather than plain anchors for internal navigation. External URLs in mock exhibition data currently point to `https://example.com/...`.

## Data Model

Mock data is intentionally typed:

- Home data: `src/data/homeMock.ts` with types from `src/types/home.ts`
- Full exhibition browsing data: `src/features/exhibitions/data/allExhibitionsMock.ts` with types from `src/features/exhibitions/types/allExhibitions.ts`
- Search data: `src/features/exhibitions/data/searchMock.ts` with types from `src/features/exhibitions/types/search.ts`
- Detail and review data: `src/features/exhibitions/data/exhibitionDetails.ts` with types from `src/features/exhibitions/types/exhibitionDetail.ts`
- My page data: `src/features/user/data/myPageMock.ts`
- Preference data: `src/features/user/data/preferenceCategories.ts`

Keep new mock entries aligned with the existing union types. If adding a new artwork key, update the corresponding type union and CSS selectors that render the artwork.

For `/exhibitions/all`, keep calculation fields separate from display strings. Filtering and sorting should use `startDate`, `endDate`, `category`, `district`, `priceType`, and `distanceKm`; `period` is display-only. The current page supports genre, district, active/upcoming period, and free/paid filters. Sorting supports deadline order by default and distance order. Status badges are computed on the frontend from today's date.

`addExhibitionReview` mutates in-memory mock data only. It does not persist after reload.

## Styling Conventions

- Styles are global CSS files imported by page components.
- Class names are page-scoped by prefix, such as `detail-*`, `login-*`, `preferences-*`, and `mypage-*`.
- Shared shell components use `app-header-*` and `app-footer-*` classes in `src/components`.
- The global root width is set in `src/index.css`:
  - `#root` has `width: 1126px`, `max-width: 100%`, centered layout, and white background.
- Many visual elements are CSS-drawn illustrations rather than image assets.
- The shared header owns the common logo/search/account icons. Page-specific icons remain inline React helper components.

When changing UI, preserve the existing visual density and page-specific class naming. Use `AppHeader` and `AppFooter` for standard page shell navigation/footer instead of recreating them per route. Avoid broad global CSS changes unless the task requires a cross-screen update.

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
