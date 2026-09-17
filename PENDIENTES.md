# Pendientes — Frontend

> Actualizado 2026-09-08. El estado completo del proyecto vive en `../PROYECTO.md`;
> este archivo es solo la lista corta de lo que falta en el frontend / la app nativa.

## Abiertos

- [ ] **Confirmar el login nativo con Google en el APK.** Tras el fix del
      `intent-filter` en `android/app/src/main/AndroidManifest.xml` (deep link
      `com.ahorbit.app://auth-callback`), falta verificar en un dispositivo real
      que después de elegir la cuenta de Google el navegador (Custom Tab) se
      cierra solo y regresa a la vista nativa, sin quedar atrapado.
- [ ] **Probar Outlook end-to-end** en `/correo`: conectar la cuenta, sincronizar
      manual, activar tiempo real y confirmar que entra un correo real como
      transacción.

## Convenciones (recordatorio)

- **Toda página o función nueva** debe sumar su paso en
  `src/features/onboarding/tourSteps.ts` y una entrada en
  `src/features/onboarding/changelog.ts`, **en el mismo cambio**.
- `public/version.json` se commitea **solo**, en su propio commit, después de
  confirmar que `releases/latest/download/finzen.apk` responde 200.
- Fechas locales: usar `src/lib/dates.ts`. Nunca `toISOString().split('T')[0]`
  ni `new Date(s)` sobre una columna `date`.
- Identificadores que siguen diciendo "Ahorbit" a propósito (no tocar):
  `com.ahorbit.app`, clave de localStorage `ahorbit-settings`, keystore.
- El "ya vio el tutorial" vive en `profiles.has_seen_tutorial` (Supabase, por
  cuenta). Solo `lastSeenChangelogId` (🆕 Novedades) sigue en localStorage.

## Resuelto (ya no aplica)

- ~~Dominio `finze.xyz` hardcodeado~~ → migrado a
  **`controlfinanzaspersonales.com`** el 2026-08-22 (`VERSION_JSON_URL` en
  `src/lib/appUpdate.ts`; `APP_URL` en `invite-family-email`).
- ~~Rebrand Ahorbit → "Mi Control de Finanzas Personales"~~ → hecho.
- ~~Rediseño del modelo de crédito (Plan 2)~~ → hecho (ver `../PROYECTO.md` §4,
  Ajustes 4).
- ~~Repo GitHub renombrado a `control-finanzas-personales`~~ → hecho.
