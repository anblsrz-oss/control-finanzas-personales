---
name: Mi Control de Finanzas Personales
description: Finanzas personales como un diagrama de metro nocturno; cuentas son líneas, movimientos son estaciones.
colors:
  brand-cobalt: "rgb(31 79 216)"
  brand-cobalt-deep: "rgb(26 63 174)"
  brand-cobalt-light: "rgb(74 120 240)"
  enamel-night: "#080d20"
  enamel-surface: "#111a36"
  porcelain: "#f3f5fa"
  porcelain-surface: "#ffffff"
  line-scarlet-light: "rgb(200 30 49)"
  line-scarlet-dark: "rgb(255 99 110)"
  line-cobalt-light: "rgb(31 79 216)"
  line-cobalt-dark: "rgb(107 148 255)"
  line-amber-light: "rgb(180 83 9)"
  line-amber-dark: "rgb(251 176 52)"
  line-green-light: "rgb(4 120 87)"
  line-green-dark: "rgb(52 211 153)"
  slate-50: "#f3f5fa"
  slate-200: "#d5dcec"
  slate-400: "#8593b3"
  slate-600: "#46557a"
  slate-700: "#2b375a"
  slate-900: "#0f1731"
  status-bar-light: "#1a3fae"
  focus-ring: "rgba(74, 120, 240, 0.9)"
typography:
  display:
    fontFamily: "Source Sans 3 Variable, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 6vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Source Sans 3 Variable, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Source Sans 3 Variable, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: "Source Sans 3 Variable, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.4
  micro:
    fontFamily: "Source Sans 3 Variable, system-ui, sans-serif"
    fontSize: "10px"
    fontWeight: 600
    lineHeight: 1.2
  figure:
    fontFamily: "Source Sans 3 Variable, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
rounded:
  sm: "6px"
  md: "6px"
  lg: "8px"
  pill: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.brand-cobalt}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.brand-cobalt-deep}"
  card:
    backgroundColor: "{colors.porcelain-surface}"
    rounded: "{rounded.lg}"
    padding: "20px"
---

# Design System: Mi Control de Finanzas Personales

## Overview

Un diagrama de metro nocturno aplicado a una herramienta de trabajo diario. La app es **Operate**: el mundo aporta tipografía, paleta, densidad y un gesto distintivo; la navegación y los controles son los estándar. El gesto es la **línea con parada**: un tramo de color que termina en un círculo (marcador de título, resumen de cifras, pistas de progreso, líneas de gráfica, ilustración de bienvenida). Los ángulos del motivo son solo de 45° y 90°.

Dos superficies: esmalte medianoche (oscuro) y porcelana (claro). Las tintas de línea se reutilizan con significado: verde = ingreso/sano, escarlata = egreso/excedido, ámbar = advertencia/premium, cobalto = marca/neutral informativo.

## Colors

- **Marca (cobalto):** rampa `--brand-*` por variables CSS; el panel Admin puede sobreescribirla en runtime (`themeColors.ts`).
- **Superficies:** `--bg` y `--surface`. Claro: porcelana `#f3f5fa` / blanco. Oscuro: `#080d20` / `#111a36`.
- **Grises:** `slate-*` redefinido con tinte azul medianoche (no el slate neutro de Tailwind).
- **Tintas de línea:** `line-scarlet|cobalt|amber|green`, variables CSS con valor más oscuro en claro (contraste ≥ 4.5:1 sobre blanco) y más luminoso en oscuro. Admiten opacidad (`bg-line-green/10`).

## Typography

Source Sans 3 (variable, autohospedada vía `@fontsource-variable`). Cifras tabulares globales (`font-variant-numeric: tabular-nums`) para que montos y fechas alineen en columnas. Títulos en 700 con tracking `-0.025em`. Cifras de resumen 24px/700.

## Layout

Móvil primero (390px): barra inferior de 4 destinos + "Más", hoja inferior para el resto; escritorio: barra lateral de 240px. Contenido con `p-4` (móvil) y `p-6` (md+). Resúmenes numéricos en `StatStrip`: 2–3 celdas separadas por divisores finos, apiladas en móvil.

## Elevation & Depth

Casi plano: borde fino `slate-200` (claro) / `slate-700/70` (oscuro) y sombra mínima `0 1px 2px rgb(8 13 32 / .06)` en tarjetas. Los tooltips usan `shadow-lg`. Sin brillos ni difuminados decorativos.

## Shapes

Radios pequeños y serios: controles `6px`, tarjetas `8px`, píldoras solo para insignias y estados. Los tramos de línea tienen extremos redondeados (`rounded-full`).

## Components

- **Button:** primario cobalto con sombra mínima; secundario con borde `slate-300`; peligro en `line-scarlet`. Pulsación `scale(0.98)`.
- **Card:** superficie con borde fino; sin tarjetas anidadas.
- **StatStrip:** cifra + tramo de línea con parada en su tinta; sustituye a las tarjetas con degradado.
- **PageHeader:** marcador de línea con parada + título 700.
- **Gráficas (`components/charts`):** tema compartido en `chartTheme.tsx` — rejilla horizontal mínima, ejes sin línea, líneas de 4px con paradas, barras con puntas redondeadas, tooltip y leyenda propios, dona con total al centro. Uso de crédito y presupuestos usan `ProgressTrack` (pista con parada).
- **Iconos:** `lucide-react`, trazo 1.9–2. Los emojis solo existen como datos del usuario (categorías, cuentas, tarjetas).

## Do's and Don'ts

- Do usar `line-*` para estados y series; nunca verdes/rojos/ámbar de Tailwind sueltos.
- Do mantener contraste ≥ 4.5:1 en texto; en claro, tintas oscuras.
- Do dar a toda cifra de dinero `tabular-nums`.
- Don't usar degradados de cristal/neón ni texto con degradado.
- Don't usar emojis como iconos de interfaz.
- Don't usar bordes laterales de color como acento de tarjetas.
- Excepción: los degradados de `CardVisual` son los colores reales de las tarjetas del usuario.
