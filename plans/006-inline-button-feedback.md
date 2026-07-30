# 006 — Add `transition-colors` to inline buttons missing it

- **Status**: DONE
- **Commit**: 444eb61
- **Severity**: LOW
- **Category**: Cohesion & tokens / Feedback
- **Estimated scope**: 3 files

## Problem

Several inline `<button>`/interactive-span elements only style `hover:` states with no `transition-colors`/`transition-opacity`, so the color/opacity change snaps instantly instead of easing — inconsistent with `src/components/ui/Button.tsx:33`, which already does this correctly (`transition-colors focus:outline-none ...`). These are hit tens of times a day (transaction row actions, chart reorder), so the fix must stay in the "near-imperceptible" tier per AUDIT.md — a plain `transition-colors`, nothing decorative, no `scale`.

```tsx
// src/features/transactions/TransactionsPage.tsx:341-364 — current
{tx.pending && (
  <button
    onClick={() => confirmTx.mutate({ id: tx.id, userId: userId! })}
    disabled={confirmTx.isPending}
    className="text-xs font-medium text-green-600 hover:text-green-700 disabled:opacity-50"
  >
    ✓ {t('Confirmar')}
  </button>
)}
<button
  onClick={() => {
    setShowForm(false)
    setEditingTx(tx)
  }}
  className="text-xs font-medium text-brand-600 hover:text-brand-800 dark:text-brand-400"
>
  ✏️ {t('Editar')}
</button>
<button
  onClick={() => openDelete(tx)}
  className="text-xs font-medium text-red-500 hover:text-red-700"
>
  🗑 {t('Eliminar')}
</button>
```

```tsx
// src/components/charts/ChartCard.tsx:42-43 — current
const arrowClass =
  'rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30 disabled:hover:bg-transparent'
```

```tsx
// src/components/ui/MultiSelect.tsx:83-87 — current
<span
  role="button"
  tabIndex={0}
  aria-label={t('Quitar')}
  className="cursor-pointer opacity-60 hover:opacity-100"
  onClick={(e) => {
```

Confirm each still matches before editing.

## Target

Add `transition-colors duration-150 ease-out` to the three `TransactionsPage.tsx` buttons and the `ChartCard.tsx` `arrowClass` string (color/background changes), and `transition-opacity duration-150 ease-out` to the `MultiSelect.tsx` chip-remove span (it animates `opacity`, not color). `duration-150` sits inside AUDIT.md's 100–160ms press-feedback budget; plain `ease-out` (not the custom `--ease-out` token) is correct here per AUDIT.md category 2 ("Hover / color change → `ease`") — Tailwind's built-in `ease-out` utility is an acceptable stand-in for a simple color transition, the strong custom curve is reserved for entrances/exits, not hover color fades.

## Repo conventions to follow

- Match `src/components/ui/Button.tsx:33`'s existing pattern exactly: it uses bare `transition-colors` (relying on Tailwind's default 150ms/`ease` transition-timing-function, which Tailwind applies automatically to `transition-colors` with no duration/easing suffix needed). For consistency with that exemplar, use bare `transition-colors` (no explicit duration/easing suffix) on the three `TransactionsPage.tsx` buttons and `ChartCard.tsx`'s `arrowClass`, and bare `transition-opacity` on the `MultiSelect.tsx` span — do not add `duration-150 ease-out` explicitly, since the existing `Button.tsx` exemplar doesn't either and consistency with that convention matters more than an explicit value here (Tailwind's default `transition-colors`/`transition-opacity` already resolve to 150ms `cubic-bezier(0.4, 0, 0.2, 1)`, within budget).

## Steps

1. In `src/features/transactions/TransactionsPage.tsx`:
   - Line 345: `className="text-xs font-medium text-green-600 hover:text-green-700 disabled:opacity-50"` → add `transition-colors` → `className="text-xs font-medium text-green-600 transition-colors hover:text-green-700 disabled:opacity-50"`
   - Line 355: `className="text-xs font-medium text-brand-600 hover:text-brand-800 dark:text-brand-400"` → `className="text-xs font-medium text-brand-600 transition-colors hover:text-brand-800 dark:text-brand-400"`
   - Line 361: `className="text-xs font-medium text-red-500 hover:text-red-700"` → `className="text-xs font-medium text-red-500 transition-colors hover:text-red-700"`
2. In `src/components/charts/ChartCard.tsx:42-43`, add `transition-colors` to `arrowClass`:
   ```tsx
   const arrowClass =
     'rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30 disabled:hover:bg-transparent'
   ```
3. In `src/components/ui/MultiSelect.tsx:87`, add `transition-opacity`:
   ```tsx
   className="cursor-pointer opacity-60 transition-opacity hover:opacity-100"
   ```

## Boundaries

- Do NOT add `scale`, `transform`, or any motion beyond the color/opacity transition — these are tens-of-times-a-day elements per AUDIT.md, near-imperceptible only.
- Do NOT touch `onClick` handlers, disabled logic, or any non-className code in these three files.
- Do NOT touch `Button.tsx` — it's already correct, cited only as the exemplar.
- Do NOT touch the chart config panel's own buttons (`ChartConfigPanel.tsx`) or any other file not listed above.

## Verification

- **Mechanical**: `npm run lint` passes.
- **Feel check**: run `npm run dev`, hover/tap-hold each of: a pending transaction's "Confirmar" button, any transaction's "Editar"/"Eliminar", a chart card's ↑/↓/⚙ buttons, and a MultiSelect chip's "×" (open a filter with an active selection):
  - Each color/opacity change now eases over a short, barely-noticeable duration instead of snapping instantly.
  - No visual regression — the buttons still look and behave identically otherwise (position, disabled state, focus ring).
- **Done when**: all listed `className` changes are applied exactly as specified, `npm run lint` is clean, no other className or logic changed.
