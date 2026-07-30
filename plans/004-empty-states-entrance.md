# 004 — Fade-in for repeated empty states

- **Status**: DONE
- **Commit**: 444eb61
- **Severity**: MEDIUM
- **Category**: Missed opportunity
- **Estimated scope**: 5 files (4 page files + `src/index.css`)

## Problem

Four near-identical empty-state cards appear instantly with no transition when a list has no data. New users hit these often (first thing they see before creating any data):

```tsx
// src/features/accounts/AccountsPage.tsx:134-139 — current
{accounts.length === 0 ? (
  <Card className="border-dashed text-center">
    <p className="text-sm text-slate-500 dark:text-slate-400">
      {t('Sin cuentas. Crea una para empezar.')}
    </p>
  </Card>
) : ( /* ... */ )}
```

```tsx
// src/features/cards/CardsPage.tsx:217-222 — current
{cards.length === 0 ? (
  <Card className="border-dashed text-center">
    <p className="text-sm text-slate-500 dark:text-slate-400">
      {t('Sin tarjetas. Crea una para empezar.')}
    </p>
  </Card>
) : ( /* ... */ )}
```

```tsx
// src/features/categories/CategoriesPage.tsx:234-238 — current
{allCategories.length === 0 && (
  <Card className="border-dashed text-center">
    <p className="text-sm text-slate-500 dark:text-slate-400">{t('Sin categorías.')}</p>
  </Card>
)}
```

```tsx
// src/features/transactions/TransactionsPage.tsx:294-303 — current
{transactions.length === 0 ? (
  <Card className="border-dashed text-center">
    <p className="text-sm text-slate-500 dark:text-slate-400">
      {/* comment about two distinct empty-state copies, keep as-is */}
      {countActiveFilters(filters) > 0
        ? t('Ninguna transacción coincide con los filtros.')
        : t('Sin transacciones. Registra una para empezar.')}
    </p>
  </Card>
) : ( /* ... */ )}
```

Confirm each still matches before editing — read the actual files first, line numbers may have drifted.

## Target

Each empty-state `Card` gets a subtle settle-in: `opacity: 0` + `translateY(4px)` → `opacity: 1` + `translateY(0)`, `240ms var(--ease-out)`, no stagger (each is a single block, not a list). `prefers-reduced-motion: reduce`: opacity fade only, no `translateY`.

## Repo conventions to follow

- If plan `003-receipt-success-delight.md` has already been executed, `src/index.css` will already contain an `.animate-card-pop-in` keyframe (scale-based, for a different context). Do NOT reuse that one as-is — this finding calls for a translateY settle, not a scale-pop (different visual read: empty states are calm, not celebratory). Add a new, separate utility class as described below even if `.animate-card-pop-in` already exists.
- Add the new keyframes/class to `src/index.css`, in the same section as other utility classes (near `.safe-top`/`.pb-nav` at the bottom of the file), following the file's existing comment style (a one-line Spanish comment above the rule explaining why, matching the tone of the existing comments in that file).
- All four target files already import `Card` from `@/components/ui/Card` (or a relative path — check each file's import block) — no new imports needed beyond the className addition.

## Steps

1. In `src/index.css`, add after the existing utility classes (after `.pb-nav` and its media query, before end of file):
   ```css
   /* Entrada suave para estados vacíos (listas sin datos). */
   @keyframes empty-state-in {
     from {
       opacity: 0;
       transform: translateY(4px);
     }
     to {
       opacity: 1;
       transform: translateY(0);
     }
   }
   .animate-empty-state-in {
     animation: empty-state-in 240ms var(--ease-out) both;
   }
   @media (prefers-reduced-motion: reduce) {
     .animate-empty-state-in {
       animation: none;
       opacity: 1;
     }
   }
   ```
2. In `src/features/accounts/AccountsPage.tsx:135`, change:
   ```tsx
   <Card className="border-dashed text-center">
   ```
   to:
   ```tsx
   <Card className="animate-empty-state-in border-dashed text-center">
   ```
3. Apply the identical `className` change (prepend `animate-empty-state-in ` to the existing `border-dashed text-center` string) at:
   - `src/features/cards/CardsPage.tsx:218`
   - `src/features/categories/CategoriesPage.tsx:235`
   - `src/features/transactions/TransactionsPage.tsx:295`
4. Leave the `<p>` content, conditional logic, and comments in each file untouched — only the `Card`'s `className` changes.

## Boundaries

- Do NOT extract a shared `EmptyState` component — that's a structural refactor beyond this plan's scope (motion-only fix). If the executor believes a shared component is warranted, note it as a follow-up suggestion instead of doing it.
- Do NOT touch any other `Card` usage in these files (e.g. the filled-list rendering branches) — only the four empty-state blocks listed.
- Do NOT modify `src/components/ui/Card.tsx` itself.
- If any of the four locations no longer matches its excerpt above, skip that one specifically, apply the rest, and report the mismatch.

## Verification

- **Mechanical**: `npm run lint` passes.
- **Feel check**: run `npm run dev`, visit each of: Cuentas (with zero accounts, or temporarily filter to force it), Tarjetas, Categorías, Transacciones (with zero transactions or an impossible filter):
  - Each empty-state card fades/settles in — not an instant pop.
  - Switching between "no data" and "has data" (e.g. adding then removing all accounts) doesn't leave a stuck half-faded card.
  - Toggle `prefers-reduced-motion`: cards still appear but without the `translateY` movement.
- **Done when**: all four locations show the fade-in, `npm run lint` is clean, no `EmptyState` component was created.
