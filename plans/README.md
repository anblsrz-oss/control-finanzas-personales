# Animation improvement plans — Mi Control de Finanzas Personales (Finzen frontend)

Generated from a `find-animation-opportunities` sweep + `improve-animations` audit on commit `444eb61`. The app has no existing motion library and no motion tokens — `src/index.css` now carries three shared easing tokens (`--ease-out`, `--ease-in-out`, `--ease-drawer`) that every plan below reuses.

| # | Plan | Severity | Status | Depends on |
| --- | --- | --- | --- | --- |
| 001 | [Modal open/close transition](001-modal-open-close-transition.md) | HIGH | TODO | — |
| 002 | [AppShell "Más" bottom sheet transition](002-appshell-bottom-sheet-transition.md) | HIGH | TODO | — |
| 003 | [Receipt success delight](003-receipt-success-delight.md) | MEDIUM | TODO | — |
| 004 | [Empty states entrance](004-empty-states-entrance.md) | MEDIUM | TODO | — |
| 005 | [MultiSelect dropdown origin](005-multiselect-dropdown-origin.md) | MEDIUM | TODO | — |
| 006 | [Inline button feedback](006-inline-button-feedback.md) | LOW | TODO | — |

## Recommended order

1–2 first (highest leverage: `Modal` is reused by nearly every form in the app; the bottom sheet is the next most-visible teleport). 3–5 are independent of each other and of 1–2 — any order works. 6 last: it's pure polish and the lowest risk, good for a final pass.

No plan depends on another being applied first — each touches disjoint files except 003 and 004, which both add new CSS to `src/index.css`; apply them in numeric order to avoid a merge conflict in that file (004's instructions already account for 003 possibly having run first).

## Explicitly out of scope (excluded during the opportunity sweep)

Bottom tab bar navigation, the hide/show-amounts privacy toggle, the core transaction list's entrance, `recharts` chart rendering, and all keyboard-driven form inputs — these are high-frequency or data-reading surfaces where AUDIT.md's frequency gate says no animation, or animation actively hinders. Do not create plans for these unless the product's usage pattern changes.
