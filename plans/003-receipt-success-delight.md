# 003 — Entrance flourish for the receipt-scan success screen

- **Status**: DONE
- **Commit**: 444eb61
- **Severity**: MEDIUM
- **Category**: Missed opportunity (delight budget)
- **Estimated scope**: 1 file (`src/features/receipts/ReceiptPage.tsx`)

## Problem

`src/features/receipts/ReceiptPage.tsx:531-548` is the "done" step of the receipt-scan wizard (`capture → ocr → review → done`) — the single clearest success moment in the app (confirms a scanned receipt/CFDI was registered). It renders as a flat, static `Card` with no entrance motion at all:

```tsx
// src/features/receipts/ReceiptPage.tsx:531-548 — current
{step === 'done' && (
  <Card>
    <div className="flex flex-col items-center gap-4 py-6">
      <span className="text-5xl">✅</span>
      <p className="text-sm text-slate-700 dark:text-slate-200">
        {isIncome
          ? t('Ingreso registrado correctamente.')
          : t('Gasto registrado correctamente.')}
      </p>
      <div className="flex gap-2">
        <Button onClick={resetAll}>{t('Escanear otro')}</Button>
        <Link to="/transacciones">
          <Button variant="secondary">{t('Ver movimientos')}</Button>
        </Link>
      </div>
    </div>
  </Card>
)}
```

Confirm this still matches before editing. This is reached at most a handful of times per day per user (once per receipt scanned) — squarely in the "rare / first-time" frequency tier where AUDIT.md explicitly allows delight (bounce, generous stagger, a longer beat).

## Target

- The whole card: `opacity: 0` + `scale(0.95)` → `opacity: 1` + `scale(1)`, `320ms var(--ease-out)`.
- The ✅ emoji specifically gets a small independent overshoot on top of the card's entrance, staggered slightly after it: `scale(0.8)` → `scale(1.05)` → `scale(1)`, `400ms`, starting ~80ms after the card starts (so the card settles in first, then the emoji "pops"). This needs a CSS `@keyframes` (a one-shot celebratory animation, not something retriggered rapidly, so `@keyframes` restarting from zero is fine here per AUDIT.md category 4 — this is the one case in this whole plan set where a transition alone won't produce the overshoot).
- `prefers-reduced-motion: reduce`: keep the card's opacity fade, drop the `scale` on both the card and the emoji keyframe (just fade the emoji in, no bounce).

## Repo conventions to follow

- This is the first `@keyframes` block in the codebase (confirm via `grep -r "@keyframes" src/` before writing — if one already exists, follow its placement convention instead of the one below). Define it in `src/index.css`, since that's the only global stylesheet in the project (see `src/main.tsx:9` which imports it).
- Everywhere else in this plan set uses Tailwind utility classes / inline styles for transitions; this is a deliberate, scoped exception because a multi-keyframe overshoot isn't expressible as a single Tailwind transition utility.
- Use the `--ease-out` token from `src/index.css` inside the keyframe's timing where applicable.

## Steps

1. Confirm `src/features/receipts/ReceiptPage.tsx:531-548` matches the excerpt above.
2. In `src/index.css`, add a new keyframes block after the `:root` rules (near the bottom of the file, after the existing `.safe-top`/`.safe-bottom`/`.pb-nav` utility classes):
   ```css
   @keyframes success-pop {
     0% {
       transform: scale(0.8);
       opacity: 0;
     }
     60% {
       transform: scale(1.05);
       opacity: 1;
     }
     100% {
       transform: scale(1);
       opacity: 1;
     }
   }

   .animate-success-pop {
     animation: success-pop 400ms var(--ease-out) 80ms both;
   }

   @media (prefers-reduced-motion: reduce) {
     .animate-success-pop {
       animation: none;
       opacity: 1;
     }
   }
   ```
3. In `ReceiptPage.tsx`, wrap the success `Card` with entrance classes and apply the keyframe class to the emoji span:
   ```tsx
   {step === 'done' && (
     <Card className="animate-in fade-in zoom-in-95 duration-[320ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:animate-none">
       <div className="flex flex-col items-center gap-4 py-6">
         <span className="animate-success-pop text-5xl">✅</span>
         <p className="text-sm text-slate-700 dark:text-slate-200">
           {isIncome
             ? t('Ingreso registrado correctamente.')
             : t('Gasto registrado correctamente.')}
         </p>
         <div className="flex gap-2">
           <Button onClick={resetAll}>{t('Escanear otro')}</Button>
           <Link to="/transacciones">
             <Button variant="secondary">{t('Ver movimientos')}</Button>
           </Link>
         </div>
       </div>
     </Card>
   )}
   ```
   Important: `animate-in`/`fade-in`/`zoom-in-95` are `tailwindcss-animate` plugin utilities — **check `tailwind.config.js` and `package.json` first**; this repo's `tailwind.config.js` (read during recon) has no plugins array entry and `package.json` has no `tailwindcss-animate` dependency, so these class names will NOT work out of the box. Do NOT add the dependency (see Boundaries). Instead, implement the card entrance the same way as plans 001/002 — a `visible`-state-driven inline/utility transition — OR, simpler since `step` already gates mounting and this card doesn't need an exit animation (the wizard just moves to a different step, never back), use a plain CSS animation like the emoji's:
   ```css
   @keyframes card-pop-in {
     from {
       opacity: 0;
       transform: scale(0.95);
     }
     to {
       opacity: 1;
       transform: scale(1);
     }
   }
   .animate-card-pop-in {
     animation: card-pop-in 320ms var(--ease-out) both;
   }
   @media (prefers-reduced-motion: reduce) {
     .animate-card-pop-in {
       animation: none;
       opacity: 1;
     }
   }
   ```
   Add this alongside `success-pop` in `src/index.css`, and use `<Card className="animate-card-pop-in">` instead of the Tailwind-plugin classes shown above. Check `src/components/ui/Card.tsx` first to confirm it forwards `className` to its root element (it should, following the same pattern as `Button.tsx`).

## Boundaries

- Do NOT add the `tailwindcss-animate` package or any other new dependency — implement via plain CSS `@keyframes` in `src/index.css` only.
- Do NOT touch the other wizard steps (`capture`, `ocr`, `review`) in this file — only the `step === 'done'` block and the two new keyframe rules in `src/index.css`.
- Do NOT change the copy, button behavior, or layout — motion only.
- If `Card` doesn't forward `className`, STOP and report rather than restructuring `Card.tsx`.

## Verification

- **Mechanical**: `npm run lint` passes.
- **Feel check**: run `npm run dev`, go through the receipt-scan flow to reach the "done" step (or temporarily force `step` to `'done'` in React DevTools to preview without a full scan):
  - The card fades/scales in smoothly, not an instant pop.
  - The ✅ emoji has a small, visible overshoot bounce that reads as celebratory but not silly — reduce the `60%` keyframe's `1.05` toward `1.02` if it feels excessive.
  - In DevTools Animations panel at 10% playback, confirm the emoji's bounce starts slightly after the card's fade, not simultaneously.
  - Toggle `prefers-reduced-motion`: card and emoji both appear with no scale/bounce, just present immediately (opacity 1, no animation).
- **Done when**: reaching the "done" step shows the card fade/scale-in and the emoji's overshoot bounce, `npm run lint` is clean, no dependency added.
