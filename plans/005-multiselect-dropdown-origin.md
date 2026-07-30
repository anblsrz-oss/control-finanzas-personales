# 005 — Trigger-anchored transition for the MultiSelect dropdown

- **Status**: DONE
- **Commit**: 444eb61
- **Severity**: MEDIUM
- **Category**: Missed opportunity / Physicality & origin
- **Estimated scope**: 1 file (`src/components/ui/MultiSelect.tsx`)

## Problem

`src/components/ui/MultiSelect.tsx:109-131` renders the options dropdown with no transition and no `transform-origin` relative to its trigger button — it just appears flat below the button:

```tsx
// src/components/ui/MultiSelect.tsx:109-131 — current
{open && (
  <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-1 shadow-lg">
    {options.length === 0 && (
      <p className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
        {t('Sin opciones')}
      </p>
    )}
    {options.map((o) => (
      <label
        key={o.value}
        className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
      >
        <input
          type="checkbox"
          className="accent-brand-500"
          checked={value.includes(o.value)}
          onChange={() => toggle(o.value)}
        />
        <span className="truncate">{o.label}</span>
      </label>
    ))}
  </div>
)}
```

The dropdown is positioned `absolute ... mt-1` directly below the trigger `<button>` at `MultiSelect.tsx:62-107` (`aria-expanded={open}`) — so it should scale from the top (its actual anchor point), not appear from nowhere. Confirm this matches before editing.

This component is used for filters (occasional interaction — opened when the user wants to filter, not on every keystroke), so it's eligible for standard dropdown motion per the frequency budget (150–250ms).

## Target

- `transform-origin: top` (the dropdown hangs below the trigger, so its "hinge" is the top edge).
- Enter: `scale(0.96)` + `opacity: 0` → `scale(1)` + `opacity: 1`, `150ms var(--ease-out)`.
- Exit: same reversed, `120ms var(--ease-out)` (per AUDIT.md's dropdown duration budget of 150–250ms; exit stays snappier).
- Never `scale(0)` — floor is `0.96`.
- `prefers-reduced-motion: reduce`: opacity fade only, no scale.
- No `@media (hover: hover)` gating needed — this isn't a hover interaction, it's a click-triggered open/close.

## Repo conventions to follow

- Same delayed-unmount pattern as plans 001/002 (`rendered`/`visible` state pair via `useEffect`), so the exit transition can play instead of an instant unmount on `open → false`.
- `--ease-out` token from `src/index.css`.
- This component already manages `open` state and an outside-click/`Escape` handler (lines 27, 30-46) — the new `visible` state must not interfere with that handler; the outside-click listener should still close via `setOpen(false)` exactly as today, the new state only governs the CSS classes and unmount timing.

## Steps

1. Confirm the file still matches the excerpt above.
2. Add transition state next to the existing `open` state (line 27):
   ```tsx
   const [open, setOpen] = useState(false)
   const [dropdownRendered, setDropdownRendered] = useState(false)
   const [dropdownVisible, setDropdownVisible] = useState(false)
   ```
3. Add a `useEffect` to drive the mount/unmount timing, placed after the existing outside-click `useEffect` (after line 46):
   ```tsx
   useEffect(() => {
     if (open) {
       setDropdownRendered(true)
       const raf = requestAnimationFrame(() => setDropdownVisible(true))
       return () => cancelAnimationFrame(raf)
     }
     setDropdownVisible(false)
     const timeout = setTimeout(() => setDropdownRendered(false), 120)
     return () => clearTimeout(timeout)
   }, [open])
   ```
4. Replace `{open && (` at line 109 with `{dropdownRendered && (`, and add the transition classes to the dropdown `div`:
   ```tsx
   {dropdownRendered && (
     <div
       className={`absolute z-20 mt-1 max-h-60 w-full origin-top overflow-auto rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-1 shadow-lg transition-[transform,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-opacity ${
         dropdownVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
       } motion-reduce:scale-100`}
     >
       {/* ...unchanged content... */}
     </div>
   )}
   ```
   Note `scale-95` is the closest Tailwind scale step to the target `0.96` (Tailwind's scale scale jumps 90/95/100 — `95` = `0.95`, which is within the acceptable `0.95–0.97` range from AUDIT.md, so use `scale-95`/`scale-100` rather than an arbitrary value).

## Boundaries

- Do NOT change the outside-click-to-close or `Escape`-to-close behavior (`MultiSelect.tsx:30-46`) — only wrap the existing `setOpen(false)` calls' visual result with the new transition.
- Do NOT touch the trigger button, the chip rendering, or the `×` remove-chip span in this plan — the chip's missing transition is covered separately by plan `006-inline-button-feedback.md`.
- Do NOT add `@media (hover: hover)` gating — this dropdown opens on click, not hover.
- If the JSX structure has drifted materially from the excerpt, STOP and report.

## Verification

- **Mechanical**: `npm run lint` passes.
- **Feel check**: run `npm run dev`, open any filter using `MultiSelect` (check `TransactionFilters.tsx` for a usage site), click the trigger:
  - Dropdown scales/fades in from the top, visibly anchored to the button below it — not appearing flat/instant.
  - Clicking outside or pressing Escape closes it with a visible (if quick) scale/fade-out, not an instant disappearance.
  - Rapidly toggling open/close (fast double-click) doesn't leave the dropdown stuck at a partial scale.
  - Toggle `prefers-reduced-motion`: dropdown still opens/closes but without the scale, just a fade.
- **Done when**: the dropdown visibly scales from its trigger's top edge on open/close, `npm run lint` is clean, outside-click/Escape behavior is unchanged.
