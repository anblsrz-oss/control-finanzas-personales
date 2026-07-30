# 002 — Slide-in/out transition for the "Más" bottom sheet

- **Status**: DONE
- **Commit**: 444eb61
- **Severity**: HIGH
- **Category**: Missed opportunity / Physicality & origin
- **Estimated scope**: 1 file (`src/components/layout/AppShell.tsx`)

## Problem

`src/components/layout/AppShell.tsx:176-224` renders the mobile "Más" bottom sheet. It's visually a bottom sheet (`rounded-t-2xl`, `fixed inset-x-0 bottom-0`) but has no motion — it appears and disappears in place with no slide from the edge it's anchored to, and the backdrop has no fade:

```tsx
// src/components/layout/AppShell.tsx:177-224 — current
{moreOpen && (
  <div
    className="fixed inset-0 z-30 bg-black/40 md:hidden"
    onClick={() => setMoreOpen(false)}
  >
    <div
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 rounded-t-2xl bg-surface p-4 pb-6 shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* ...content... */}
    </div>
  </div>
)}
```

Confirm this still matches before editing — read the file first.

## Target

- Backdrop: `opacity` 0→1, `200ms var(--ease-out)`.
- Sheet: `translateY(100%)` → `translateY(0)`, `280ms var(--ease-drawer)` (`cubic-bezier(0.32, 0.72, 0, 1)` — the iOS-like drawer curve, appropriate since this is a bottom-anchored sheet). Use the percentage form, not a hardcoded pixel offset — `translateY(100%)` moves the sheet by its own height regardless of content length.
- Exit: same path reversed, `220ms var(--ease-out)`.
- `prefers-reduced-motion: reduce`: drop the `translateY`, keep the opacity fade on both backdrop and sheet.

## Repo conventions to follow

- Use the `--ease-drawer` and `--ease-out` tokens added to `src/index.css` `:root` in this session.
- Same delayed-unmount pattern as plan 001 (`src/components/ui/Modal.tsx`) — implement it independently here since `AppShell.tsx` does not import `Modal`, but follow the exact same `rendered`/`visible` state shape for consistency across the codebase.
- Styling stays Tailwind utility classes in JSX, matching every other conditional block in this file.

## Steps

1. Read `src/components/layout/AppShell.tsx`, locate the `moreOpen` state declaration (`useState` near the top of the component) and the block at line ~177.
2. Add local transition state, same pattern as plan 001:
   ```tsx
   const [sheetRendered, setSheetRendered] = useState(moreOpen)
   const [sheetVisible, setSheetVisible] = useState(false)

   useEffect(() => {
     if (moreOpen) {
       setSheetRendered(true)
       const raf = requestAnimationFrame(() => setSheetVisible(true))
       return () => cancelAnimationFrame(raf)
     }
     setSheetVisible(false)
     const timeout = setTimeout(() => setSheetRendered(false), 220)
     return () => clearTimeout(timeout)
   }, [moreOpen])
   ```
   Add the `useEffect` import if not already present at the top of the file.
3. Replace the `{moreOpen && (...)}` guard with `{sheetRendered && (...)}`, and update the two divs:
   ```tsx
   {sheetRendered && (
     <div
       className={`fixed inset-0 z-30 bg-black/40 transition-opacity duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] md:hidden ${
         sheetVisible ? 'opacity-100' : 'opacity-0'
       }`}
       onClick={() => setMoreOpen(false)}
     >
       <div
         className={`safe-bottom fixed inset-x-0 bottom-0 z-40 rounded-t-2xl bg-surface p-4 pb-6 shadow-xl transition-transform duration-[280ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-opacity motion-reduce:duration-200 ${
           sheetVisible ? 'translate-y-0' : 'translate-y-full'
         }`}
         onClick={(e) => e.stopPropagation()}
       >
         {/* ...content unchanged... */}
       </div>
     </div>
   )}
   ```
   Note the `motion-reduce:` override swaps to an opacity-only transition class list; since `translate-y-full`/`translate-y-0` still applies the transform instantly (no transition) under `motion-reduce`, that satisfies "drop the movement, keep a gentle fade" — the position still changes without an animated slide, and the parent opacity transition on the backdrop covers the fade cue.
4. Keep the `onClick={() => setMoreOpen(false)}` calls on nav items as-is — closing still happens instantly on navigation (correct: user is leaving the screen, no need to wait for the close animation).

## Boundaries

- Do NOT touch the nav item list (`moreNav.map(...)`), the desktop sidebar, or the bottom tab bar in this same file — those are explicitly excluded from motion (high-frequency navigation).
- Do NOT add a motion library.
- Do NOT change `z-30`/`z-40` stacking or the safe-area classes.
- If `moreOpen` state or this JSX block has materially changed shape since this plan was written, STOP and report.

## Verification

- **Mechanical**: `npm run lint` passes.
- **Feel check**: on a mobile viewport (DevTools device toolbar), tap "Más" in the bottom nav:
  - Sheet slides up from the bottom edge, backdrop fades in — not an instant pop.
  - Tapping the backdrop or a nav item closes it with a visible slide-down, not an instant disappearance.
  - Rapidly toggling "Más" open/close does not desync the backdrop and sheet timing or leave a stuck overlay.
  - Toggle `prefers-reduced-motion`: sheet still opens/closes but without the slide animation.
- **Done when**: the "Más" sheet opens/closes with the slide+fade described above, `npm run lint` is clean, no other component touched.
