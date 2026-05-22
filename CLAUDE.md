# TrainYourAss

Strength training tracker PWA. React 18 + Vite + Firebase + two themes (Soft / Iron).

## Stack

- React 18, react-router-dom v6, Vite
- Firebase: Firestore, Auth (Google Sign-In), Functions (europe-west1), Hosting
- Two themes: `soft` and `iron` — tokens in `src/contexts/ThemeContext.jsx` (`TOKENS`)

## Coding rules

- No comments in code
- Inline styles using theme tokens (`t.bg`, `t.ink`, `t.accent`, etc.) — no Tailwind inside components
- `isIron = t.key === 'iron'` for Iron-specific style branches
- `inputMode="decimal"` on all numeric inputs
- Wrap new screens in `<Screen>` from `src/components/ui/Screen.jsx`

## Security

Anthropic API key lives **only** in `functions/index.js` via `defineSecret('ANTHROPIC_API_KEY')`. The frontend never calls Anthropic directly — only through the `generateReport` callable Function.

## Firestore structure

```
users/{uid}/settings/prefs
users/{uid}/workoutPlans/{A|B|C}
users/{uid}/workoutLogs/{weekId}/logs/{logId}
users/{uid}/measurements/{id}
users/{uid}/customExercises/{id}
```

Weeks are ISO strings: `"2026-W21"` — use `getISOWeekId()` from `firebase/helpers.js`.

## Commands

```bash
npm run dev          # dev server
npx vite build       # build (Node 18 — vite-plugin-pwa removed, PWA is manual)
firebase deploy      # hosting + functions
```

Before deploying functions: `firebase functions:secrets:set ANTHROPIC_API_KEY`
