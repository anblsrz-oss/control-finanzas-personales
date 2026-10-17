# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Personas en México con varias cuentas bancarias y tarjetas de crédito (incluye compras a meses sin intereses, MSI) que quieren llevar sus finanzas personales sin teclear cada movimiento. Usan la app a diario desde el celular (APK Android, build de Google Play) y ocasionalmente desde la web. Existe también un módulo de Familia para compartir finanzas.

## Product Purpose
"Mi Control de Finanzas Personales": registrar, entender y planear el dinero personal. Éxito = el usuario ve su situación real (cuentas, crédito, suscripciones, rendimientos) sin esfuerzo manual y confía en los números.

## Positioning
Captura automática (SMS, correo Gmail/Outlook, notificaciones del celular, recibos con OCR) combinada con un manejo real del crédito mexicano: periodos de tarjeta, MSI mes a mes, pagos de tarjeta, saldo efectivo vs económico, reembolsos, rendimientos con tramos y apartados, suscripciones recurrentes y multimoneda.

## Capabilities and Constraints
- Stack existente: React 18 + Vite + TypeScript + Tailwind 3 (sin shadcn), Supabase, Capacitor 8 (Android).
- Dos canales de distribución: web/APK (cobro Stripe) y build Google Play (flavor `play`: sin SMS, sin Stripe ni "cómpralo en la web"; compra con Play Billing).
- Planes: Free y Premium ($107/mes o $1,037/año, 7 días de prueba). Toda función nueva se registra en `src/lib/features.ts`.
- Tema de color editable en runtime por el admin (`themeColors.ts`).
- Textos en español como clave con traducción al inglés (`src/i18n/en.ts`).
- Todo cambio de páginas/funciones debe reflejarse en el tutorial (`tourSteps.ts`).

## Brand Commitments
Ninguno obligatorio: el usuario autorizó cambiar nombre visible, logo y color de marca en el rediseño (2026-10-15). Nombre vigente: "Mi Control de Finanzas Personales" (interno: ahorbit).

## Evidence on Hand
Landing web en `src/features/landing/LandingPage.tsx`; capturas y assets de tienda en `store-assets/` y `play-store/`. No se dispone de testimonios ni métricas de usuarios: no inventarlos.

## Product Principles
1. Lo automático por defecto: el usuario corrige, no captura.
2. Los números del crédito deben ser honestos y explicables (efectivo vs económico, MSI).
3. Mobile-first: la app se usa sobre todo en el celular, con una mano.
4. Cumplir las políticas de cada canal (Play vs web) sin degradar la experiencia.
