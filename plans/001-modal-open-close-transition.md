# 001 — Add open/close transition to the generic Modal

- **Status**: DONE
- **Commit**: 444eb61
- **Severity**: HIGH
- **Category**: Missed opportunity / Physicality & origin
- **Estimated scope**: 1 file (`src/components/ui/Modal.tsx`)

## Problem

`src/components/ui/Modal.tsx` is the app's single reusable modal, used by every account/card/category/chart-config form. It currently mounts and unmounts with zero transition — content teleports in and there is no exit animation at all, because React removes the node in the same render that flips `open` to `false`.

```tsx
// src/components/ui/Modal.tsx:1-25 — current
import type { ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
}

export function Modal({ open, onClose, children, className = '' }: ModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className={`w-full max-h-[90vh] overflow-y-auto rounded-t-2xl bg-white p-4 shadow-xl dark:bg-slate-800 sm:max-w-lg sm:rounded-2xl sm:p-6 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
```

(Read the actual current file first — line numbers/exact JSX may have drifted slightly since this plan was written; the structure — overlay div wrapping a panel div, `if (!open) return null` guard — is what matters.)

## Target

Keep the component mounted for a short window after `open` becomes `false` so an exit transition can play, using a local `visible` state driven by `useEffect` (no `@starting-style` — this codebase targets browsers via Vite/Capacitor without confirmed Chromium-only baseline, so use the JS-driven fallback described in AUDIT.md).

- Backdrop: `opacity` 0→1 on enter, `200ms` `var(--ease-out)`.
- Panel (mobile, `items-end` layout — sheet-like): `translateY(16px)` + `opacity: 0` → `translateY(0)` + `opacity: 1`, `220ms var(--ease-out)`.
- Panel (desktop, `sm:items-center`): `scale(0.97)` + `opacity: 0` → `scale(1)` + `opacity: 1`, `220ms var(--ease-out)` — never `scale(0)`.
- Exit: same properties reversed, `160ms var(--ease-out)` (snappier close than open, per the button/press asymmetry pattern — the dismissal should feel quick).
- `transform-origin: center` is correct here — modals are exempt from trigger-anchored origins (AUDIT.md category 3). Do not add `transform-origin` logic.
- `prefers-reduced-motion: reduce`: drop the `translateY`/`scale` transform, keep only the `opacity` transition.

## Repo conventions to follow

- Motion tokens now live in `src/index.css` under `:root` (added in this session): `--ease-out: cubic-bezier(0.23, 1, 0.32, 1);`, `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);`, `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);`. Reference them via `var(--ease-out)` in inline styles, or add matching Tailwind utilities if the executor prefers Tailwind's arbitrary-value syntax (`transition-[transform,opacity] duration-[220ms] ease-[cubic-bezier(0.23,1,0.32,1)]`) — pick one approach and use it consistently within this file.
- This repo does not use CSS modules or styled-components — styling is Tailwind utility classes directly in JSX, exactly as seen in the excerpt above. Keep the fix in that style (Tailwind classes + a small amount of inline `style` for the dynamic transform if needed), not a new `.css` file.
- No motion library is installed and none should be added (Boundaries below).

## Steps

1. Open `src/components/ui/Modal.tsx` and confirm the current structure matches the excerpt above (overlay div + panel div, `if (!open) return null`).
2. Add local state to track a delayed unmount:
   ```tsx
   import { useEffect, useState, type ReactNode } from 'react'

   export function Modal({ open, onClose, children, className = '' }: ModalProps) {
     const [rendered, setRendered] = useState(open)
     const [visible, setVisible] = useState(false)

     useEffect(() => {
       if (open) {
         setRendered(true)
         // allow the mount to paint at the initial (hidden) state before flipping to visible
         const raf = requestAnimationFrame(() => setVisible(true))
         return () => cancelAnimationFrame(raf)
       }
       setVisible(false)
       const timeout = setTimeout(() => setRendered(false), 160) // matches exit duration
       return () => clearTimeout(timeout)
     }, [open])

     if (!rendered) return null
     // ...rest below
   ```
3. Apply the transition classes to the overlay and panel, keyed off `visible`:
   ```tsx
     return (
       <div
         className={`fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 transition-opacity duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] sm:items-center sm:p-4 ${
           visible ? 'opacity-100' : 'opacity-0'
         }`}
         onClick={onClose}
       >
         <div
           className={`w-full max-h-[90vh] overflow-y-auto rounded-t-2xl bg-white p-4 shadow-xl transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] dark:bg-slate-800 sm:max-w-lg sm:rounded-2xl sm:p-6 ${
             visible
               ? 'translate-y-0 scale-100 opacity-100'
               : 'translate-y-4 scale-100 opacity-0 sm:translate-y-0 sm:scale-95'
           } ${className}`}
           onClick={(e) => e.stopPropagation()}
         >
           {children}
         </div>
       </div>
     )
   }
   ```
   Note the exit duration used in the `setTimeout` (step 2) must match the transition `duration-200` used here within a reasonable margin — the plan uses 200ms in the CSS and a 160ms unmount timeout intentionally shorter, so the panel is guaranteed to have visually settled into its hidden state before React unmounts it; if you want exact symmetry, change both to 200ms. Either is acceptable — just keep them consistent, don't leave a mismatch of more than 50ms.
4. Add reduced-motion handling: wrap the transform-affecting classes so they're skipped under `prefers-reduced-motion: reduce`. Simplest approach in this Tailwind setup (no `motion-reduce:` variant configured — check `tailwind.config.js`; if absent, Tailwind's default `motion-reduce:` variant still works out of the box since it's a core plugin, not something requiring config):
   ```tsx
   visible
     ? 'translate-y-0 scale-100 opacity-100 motion-reduce:translate-y-0 motion-reduce:scale-100'
     : 'translate-y-4 scale-100 opacity-0 sm:translate-y-0 sm:scale-95 motion-reduce:translate-y-0 motion-reduce:scale-100'
   ```
   This neutralizes the transform under reduced motion while leaving the opacity fade intact.

## Boundaries

- Do NOT touch any of the modal's *callers* (`TransactionsPage.tsx`, `ChartConfigPanel.tsx`, etc.) — this fix is entirely internal to `Modal.tsx`.
- Do NOT add a motion library (Framer Motion, react-spring). Plain CSS transitions + the `useEffect` delayed-unmount pattern above are sufficient.
- Do NOT change the modal's markup structure (overlay div wrapping panel div), z-index, or click-outside-to-close behavior — only add transition classes and the mount/unmount timing state.
- If the current file doesn't match the excerpt in Problem (structure has changed materially), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npm run lint` (runs `tsc --noEmit`) must pass with no new errors.
- **Feel check**: run `npm run dev`, open any form that uses `Modal` (e.g. "Nueva cuenta" on the Accounts page), and confirm:
  - The backdrop fades in, the panel scales/slides in — no instant pop.
  - Closing it (click backdrop or Cancel) plays a visible, quicker close — the panel does not just vanish.
  - Rapidly opening and closing (double-click the trigger) does not leave the modal stuck half-visible or throw a console error.
  - In DevTools Animations panel (or just eyeballing), the panel's `transform-origin` is effectively centered on desktop — do not add explicit `transform-origin`, the default center origin from `justify-center`/`items-center` layout is correct.
  - Toggle `prefers-reduced-motion` in DevTools Rendering panel: transform-based movement should stop but the fade should remain.
- **Done when**: opening/closing any modal in the app shows a smooth transition matching the durations above, `npm run lint` is clean, and no other file was modified.
