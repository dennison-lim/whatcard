# WhatCard — Technical Documentation

**Audience:** LLMs and developers. Use this for context when editing or extending the app.

---

## 1. Goals

- **Primary:** Help users choose the best credit card for a given purchase by comparing total value (rewards points + statement credits/benefits + active offers).
- **Scope:** Client-side only. No backend or database; state lives in React and persists via `localStorage`.
- **Deployment:** Static SPA on Vercel; data is per-browser.

---

## 2. Architecture

- **Single-page app:** One route (`/`). Entry: `index.html` → `index.tsx` → `App.tsx` → `HomeScreen`.
- **State:** Centralized in `HomeScreen` (React `useState`). Persisted slice: cards, activeCardIds, activeOffers, transactionHistory, benefitBalances, customAnnualFees, annualFeeBalances, annualFeeDates. Session-only: merchant, amount, category, results, loading, UI toggles.
- **Persistence:** `utils/storage.ts` — single key `whatcard_app_state`, versioned JSON. Hydrate on first render; debounced save (400ms) on persisted state changes. Optional merge-with-defaults on load so new cards/benefits from `data.ts` get default balances/dates.
- **Data flow:** User input → handlers in HomeScreen → state updates → optional persist; Calculate → `calculateBestCards()` → ranked `RecommendationResult[]` → “Use This Card” applies benefit/offer usage and updates balances/history.

---

## 3. Design

### Technical

- **Types:** All domain types in `types.ts` (CreditCard, UserOffer, TransactionRecord, RecommendationResult, etc.). Persisted shape in `utils/storage.ts` (`PersistedState`).
- **Calculation pipeline:** `utils/calculations.ts` → `calculateBestCards()` (ranks cards by total value). Delegates per-card math to `utils/cardLogic.ts` → `calculateCardValue()` (points from category multiplier, benefit matching by merchant, offer matching, point valuations MR/UR).
- **Merchant/category:** Keyword-based guess in `utils/merchantUtils.ts` (`guessCategory`, `getCategoryForBenefit`, `getBenefitIcon`).
- **Styling:** Tailwind via CDN in `index.html`. Dark theme, Inter font. Utility classes + a few keyframes (slide-up, fade-in). Safe-area and hide-scrollbar for mobile.

### User experience

- **Sections (top to bottom):** Header (title, “Reset data”, “+ Offer”) → My Wallet (card selector + details) → Optional offer form → Benefits list (balances, quick-use) → Available offers (tap to fill merchant/amount) → Purchase input (merchant, amount, category, Calculate) → Ranking (cards by value, “Use This Card” to apply and clear).
- **Wallet:** User toggles which cards are “active”; only active cards are included in recommendations. Card details modal: annual fee tracking, benefit CRUD, offers, transaction history.
- **Reset:** “Reset data” clears `localStorage` and reloads; restores seed data from `data.ts`.

---

## 4. Technology stack

| Layer        | Choice |
|-------------|--------|
| Runtime     | Browser (ES2022) |
| Framework   | React 19 |
| Build       | Vite 6, TypeScript 5.8 |
| Styling     | Tailwind (CDN) |
| Persistence | localStorage (sync) |
| Hosting     | Vercel (static; `dist`, SPA rewrite) |

---

## 5. File-by-file purpose

| File | Purpose |
|------|--------|
| **Entry & app** | |
| `index.html` | HTML shell, viewport/safe-area, Tailwind and font links, dark theme and animation CSS, `#root`, script entry. |
| `index.tsx` | Mounts React root; renders `<App />` in StrictMode. |
| `App.tsx` | Root component; renders `<HomeScreen />` only. |
| **Screens** | |
| `screens/HomeScreen.tsx` | Single main screen. Owns all app state, hydrate from storage + merge defaults, debounced persist, handlers for wallet/offers/benefits/calculate/use-card/reset. Composes InputSection, RecommendationCard, CardSelector, OfferInput, CardDetailsModal, BenefitsList, AllOffersList. |
| **Components** | |
| `components/InputSection.tsx` | Merchant + amount + category dropdown + optional benefit pin. Calls `guessCategory` on merchant; triggers `onCalculate`. |
| `components/RecommendationCard.tsx` | One card in ranking: card name, total value, points/benefits/offers breakdown, “Use This Card” button. |
| `components/CardResult.tsx` | Presentational card result (used where a simpler result view is needed). |
| `components/CardSelector.tsx` | Horizontal list of wallet cards; toggle active, open details; shows fee balance. |
| `components/CardDetailsModal.tsx` | Modal for one card: fee tracking (balance, date, total), benefits list + add/edit/delete, offers + add/edit/delete/mark used, transaction history. |
| `components/BenefitsList.tsx` | Lists benefits for active cards with balances; select benefit (for category), edit balance, quick-use to zero. |
| `components/AllOffersList.tsx` | Horizontal list of valid offers; tap to fill merchant/amount; edit, delete, mark used. |
| `components/OfferInput.tsx` | Form to add or edit offer: merchant, card, type (spend_X_get_Y / percent_back), amounts, expiration. |
| **Data & types** | |
| `data.ts` | Seed data: `allCards` (CreditCard[]), `sampleOffers` (UserOffer[]). Default source for fresh state. |
| `types.ts` | Shared TypeScript types: Currency, BonusCategory, CardBenefit, CreditCard, UserOffer, TransactionRecord, RecommendationResult, etc. |
| **Utils** | |
| `utils/storage.ts` | Persistence: `PersistedState`, `getStoredState()`, `setStoredState()`, `clearStoredState()`. Single localStorage key, try/catch, schema check. |
| `utils/calculations.ts` | `calculateBestCards()`: maps cards to value via cardLogic, builds RecommendationResult, sorts by total value. |
| `utils/cardLogic.ts` | `calculateCardValue()`: category multiplier → points, benefit matching (merchant + balance), offer matching (spend_X_get_Y, percent_back), point valuations (MR, UR). |
| `utils/merchantUtils.ts` | `guessCategory()`, `getCategoryForBenefit()`, `getBenefitIcon()`; keyword maps for categories and benefit icons. |
| **Config** | |
| `package.json` | Scripts: dev, build, preview. Deps: react, react-dom. Vite, TS, @vitejs/plugin-react. |
| `vite.config.ts` | Port 3000, host, path alias `@` → root. |
| `tsconfig.json` | ESNext, JSX, paths `@/*` → root, noEmit, skipLibCheck. |
| `vercel.json` | Build command, output `dist`, SPA rewrite to `/index.html`. |
| `.gitignore` | node_modules, dist, .env*, .DS_Store, .idea, *.log. |
| **Other** | |
| `metadata.json` | App name/description; not used at runtime. |
| `README.md` | User-facing: app purpose, run locally, deploy to Vercel. |

---

## 6. Conventions for edits

- **New state:** If it should survive refresh, add it to `PersistedState` in `utils/storage.ts`, then to HomeScreen hydrate + persist effect + merge defaults if applicable.
- **New card/benefit defaults:** Add in `data.ts`; merge-with-defaults in HomeScreen will give new keys default balances/dates when loading old stored state.
- **New calculation logic:** Prefer extending `utils/cardLogic.ts` and/or `utils/calculations.ts`; keep types in `types.ts`.
- **New UI section:** Add component under `components/`, pass only needed props from HomeScreen; keep state in HomeScreen unless a clear sub-context is needed.
