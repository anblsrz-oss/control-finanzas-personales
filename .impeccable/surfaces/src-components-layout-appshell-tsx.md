---
version: 1
slug: "src-components-layout-appshell-tsx"
primary_target: "src/components/layout/AppShell.tsx"
related_targets: ["src/index.css","src/features/reports/DashboardPage.tsx"]
---

# Surface brief: App shell and system (Operate)

Scope: whole authenticated app (AppShell, Dashboard, Cuentas, Transacciones, etc.) plus auth/inicio móvil/suscripción/landing, all inheriting one system. Mode: Operate (landing and /inicio are Persuade but reuse the same world).

Audience/job: persona en México con varias cuentas y tarjetas; revisa saldos, crédito (MSI, periodos), suscripciones y movimientos capturados automáticamente, casi siempre en celular y con una mano.

Constraints: Tailwind 3, tokens via CSS variables, admin runtime theme override (`themeColors.ts`), dark/light, safe-areas Android, i18n es->en, Play build rules.

Memorable moment: el dinero como mapa de metro: cada cuenta/tarjeta es una línea con color propio; transferencias, pagos de tarjeta y apartados son interconexiones visibles.

## Direction contract
THESIS: Las finanzas personales como red de líneas legibles (cuentas = líneas, movimientos = estaciones, transferencias/pagos = interconexiones); rechaza el dashboard fintech de tarjetas blancas con un acento teal.
OWN-WORLD: Esmalte azul medianoche (modo oscuro) y porcelana blanca (modo claro); tintas de línea escarlata, cobalto, ámbar y verde como colores de cuenta/categoría y estados; marcas de estación en blanco porcelana; sans humanista con numerales tabulares; ángulos solo a 45/90 en gráficas y conectores; la línea elegida brilla más.
STORY: El usuario entiende en segundos cuánto tiene, cuánto debe y qué viene, y confía en los números; actúa: captura/corrige, paga tarjeta, mueve a apartado, suscribe Premium.
FIRST VIEWPORT: Móvil 390px: encabezado con saldo total y rango; debajo diagrama vertical de "líneas" (cuentas/tarjetas) con estación de saldo y próximos cobros/vencimientos; barra inferior estándar de 5 destinos; acción primaria "Agregar movimiento" fija abajo a la derecha. Escritorio: riel lateral + diagrama a la izquierda y detalle/tabla a la derecha.
FORM: wayfinding-cartography-signage-midnight-transit-diagram (challenger, competitive), seed:1f057f97a31031b7.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Unresolved
- Familia tipográfica concreta (workhorse humanista con tabulares).
- Modo claro: porcelana con tinta medianoche; verificar contraste de las 4 tintas de línea en ambos modos.
- Cómo se comporta el tema de color editable por el admin con la paleta de líneas.
