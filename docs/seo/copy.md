# Copy deck SEO — landing y páginas públicas (ES / EN)

Fuente única de textos para el lote SEO (rama `seo-landing`). Aprobado por: _pendiente_.

## Reglas de posicionamiento (no negociables)

- Somos una **app para llevar el control de gastos personales**. NO somos banco, fintech ni damos tarjetas o crédito.
- Tarjetas, fechas de corte y MSI se presentan como **cosas que el usuario registra**, nunca como productos que ofrecemos.
- Captura automática = **solo notificaciones en la app de Android**. No mencionar correo, Gmail, Outlook, SMS ni "conectar tu banco".
- Los datos son privados: solo los ve su dueño (salvo lo que comparta en el plan familiar).
- Precios y límites del plan gratis vienen de la config del admin (`usePlanPerks`, `PRICES`); el copy no los fija a mano salvo en FAQ/JSON-LD, que leen `PRICES`.
- En la variante Play (`isPlayBuild()`) no se muestran precios ni descarga de APK: aplica también al FAQ de precios.
- Responsable: **ALCE-Soft** — https://alce-soft.com

## Mapa de URLs

| ES | EN | Página |
|---|---|---|
| `/` | `/en` | Landing |
| `/registrar-gastos-automaticamente` | `/en/registrar-gastos-automaticamente` | Captura automática (Android) |
| `/escanear-tickets` | `/en/escanear-tickets` | Escaneo de tickets |
| `/control-de-tarjetas-y-msi` | `/en/control-de-tarjetas-y-msi` | Tarjetas, cortes y MSI |
| `/presupuesto-personal-y-familiar` | `/en/presupuesto-personal-y-familiar` | Presupuestos y plan familiar |
| `/quienes-somos` | `/en/quienes-somos` | Quiénes somos / privacidad |
| `/instalar-android` | `/en/instalar-android` | Guía APK (existente) |
| `/privacidad`, `/terminos`, `/cookies` | `/en/...` | Legales (existentes) |

`/bienvenida` → 301 a `/`. Slugs iguales en ambos idiomas (Google: palabras en la URL apenas influyen).

---

## 1. Landing (`/` · `/en`)

**Title**
- ES: `App para controlar tus gastos personales | Mi Control de Finanzas Personales`
- EN: `Personal expense tracker app | Mi Control de Finanzas Personales`

**Meta description**
- ES: `Registra tus gastos, cuentas, tarjetas y meses sin intereses en una sola app. Captura automática en Android, escaneo de tickets y presupuestos. Empieza gratis.`
- EN: `Track your expenses, accounts, credit cards and installment plans in one app. Automatic capture on Android, receipt scanning and budgets. Start for free.`

**Hero**
- H1 ES: `La app para controlar tus gastos personales`
- H1 EN: `The app to keep track of your personal expenses`
- Sub ES: `Registra ingresos, gastos, cuentas y tarjetas en un solo lugar y entiende a dónde va tu dinero. Tú decides qué registrar; solo tú ves tus datos.`
- Sub EN: `Log your income, expenses, accounts and cards in one place and see where your money goes. You decide what to log; only you can see your data.`
- CTA (sin cambio): Crear cuenta gratis / Ya tengo cuenta · Create a free account / I already have an account
- Nota bajo CTA (sin cambio, web): `Gratis para empezar. Premium desde {{price}} al mes con 7 días de prueba.`

**H2 ES: `Lleva el control de tus gastos en 3 pasos`** · **EN: `Track your spending in 3 steps`**
1. H3 `Registra tus cuentas y tarjetas` — `Da de alta tus cuentas, tarjetas, fechas de corte y meses sin intereses. Solo tú los ves.`
   EN `Add your accounts and cards` — `Set up your accounts, cards, statement dates and installment plans. Only you can see them.`
2. H3 `Captura tus gastos sin esfuerzo` — `En Android, la app registra tus compras a partir de las notificaciones de tu banco. También puedes escanear tickets o anotarlos a mano.`
   EN `Capture expenses effortlessly` — `On Android, the app logs your purchases from your bank's notifications. You can also scan receipts or add them by hand.`
3. H3 `Entiende a dónde va tu dinero` — `Revisa tu balance, tus gastos por categoría, tus presupuestos y reportes claros.`
   EN `See where your money goes` — `Check your balance, spending by category, budgets and clear reports.`

**H2 ES: `Funciones para organizar tu dinero`** · **EN: `Features to organize your money`**
(Cada función es un H3 con texto; las que tienen página propia enlazan con texto descriptivo.)
1. `Captura automática en Android` — `Tus compras se registran solas desde las notificaciones de tu banco, con tu permiso.` → enlace `Cómo funciona la captura automática` (`/registrar-gastos-automaticamente`)
   EN `Automatic capture on Android` — `Your purchases are logged automatically from your bank's notifications, with your permission.` → `How automatic capture works`
2. `Escaneo de tickets y facturas` — `Toma una foto o sube un PDF y la app extrae el monto, la fecha y el comercio.` → `Cómo escanear tus tickets` (`/escanear-tickets`)
   EN `Receipt and invoice scanning` — `Take a photo or upload a PDF and the app pulls out the amount, date and merchant.` → `How to scan your receipts`
3. `Tarjetas, fechas de corte y MSI` — `Registra tus tarjetas y lleva el control de cortes, pagos y meses sin intereses mes a mes.` → `Control de tarjetas y meses sin intereses` (`/control-de-tarjetas-y-msi`)
   EN `Cards, statement dates and installments` — `Log your cards and keep track of statement dates, payments and interest-free installments month by month.` → `Card and installment tracking`
4. `Presupuestos y plan familiar` — `Pon límites por categoría y comparte con tu familia solo lo que tú elijas.` → `Presupuesto personal y familiar` (`/presupuesto-personal-y-familiar`)
   EN `Budgets and family plan` — `Set limits by category and share only what you choose with your family.` → `Personal and family budgets`
5. `Suscripciones` — `Detecta tus suscripciones y te avisa antes de cada cobro.`
   EN `Subscriptions` — `Spots your subscriptions and reminds you before each charge.`
6. `Varias monedas` — `Registra en pesos o en la moneda que uses, con conversión automática.`
   EN `Multiple currencies` — `Log in pesos or any currency you use, with automatic conversion.`
7. `Exporta e importa` — `Importa tus estados de cuenta y exporta tus movimientos a Excel.`
   EN `Import and export` — `Import your bank statements and export your transactions to Excel.`
8. `Español e inglés, claro y oscuro` (sin cambio) · `Spanish and English, light and dark`

**H2 ES: `Tus datos son solo tuyos`** · **EN: `Your data stays yours`**
- `No somos un banco: no pedimos tu usuario ni tu contraseña de banca en línea.` · `We're not a bank: we never ask for your online banking username or password.`
- `Nadie más ve tus cuentas, salvo lo que tú compartas en el plan familiar.` · `No one else sees your accounts, except what you share in the family plan.`
- `No vendemos tus datos ni los usamos para publicidad.` · `We don't sell your data or use it for advertising.`
- `Sin cookies de rastreo ni anuncios.` · `No tracking cookies, no ads.`
- Enlaces: `Lee nuestra política de privacidad` (`/privacidad`) · `Conoce quién está detrás de la app` (`/quienes-somos`)

**H2 ES: `Precios: empieza gratis`** · **EN: `Pricing: start for free`** (sección existente; solo cambia el H2; resto sin cambio)

**H2 ES: `Descarga la app para Android`** · **EN: `Get the Android app`** (sección existente)
- Texto (sin cambio): `Instálala como app desde tu navegador, o descarga el APK para Android.`
- Enlace `Ver guía con imágenes` → `Guía para instalar la app en Android` · `Android installation guide`

**H2 ES: `Preguntas frecuentes`** · **EN: `Frequently asked questions`**
1. `¿Es un banco o me da tarjetas de crédito?` — `No. Es una app para llevar el control de tus gastos personales. No ofrecemos cuentas, tarjetas ni crédito: tú registras los tuyos.`
   EN `Is this a bank? Does it give me credit cards?` — `No. It's an app to keep track of your personal expenses. We don't offer accounts, cards or credit: you log your own.`
2. `¿Se conecta a mi banco?` — `No. Nunca te pedimos tu usuario ni tu contraseña del banco. Tú registras tus movimientos, escaneas tus tickets o, en Android, la app los toma de las notificaciones que tu banco te envía al celular.`
   EN `Does it connect to my bank?` — `No. We never ask for your bank username or password. You log your transactions, scan your receipts or, on Android, the app picks them up from the notifications your bank sends to your phone.`
3. `¿Quién puede ver mi información?` — `Solo tú. Si usas el plan familiar, tu familia ve únicamente las tarjetas y los gastos que decidas compartir.`
   EN `Who can see my information?` — `Only you. If you use the family plan, your family only sees the cards and expenses you choose to share.`
4. *(solo web)* `¿Es gratis?` — `Sí. El plan gratis no vence. Premium cuesta {{monthly}} MXN al mes o {{yearly}} MXN al año, con 7 días de prueba gratis.`
   EN `Is it free?` — `Yes. The free plan never expires. Premium costs {{monthly}} MXN per month or {{yearly}} MXN per year, with a 7-day free trial.`
5. `¿Puedo cancelar cuando quiera?` — `Sí. Cancelas desde la app en cualquier momento y conservas Premium hasta el final del periodo pagado.`
   EN `Can I cancel anytime?` — `Yes. Cancel from the app at any time and keep Premium until the end of the period you paid for.`
6. `¿Funciona en iPhone?` — `Sí, desde el navegador; en Safari puedes agregarla a tu pantalla de inicio como una app. La captura automática por notificaciones solo está disponible en Android.`
   EN `Does it work on iPhone?` — `Yes, in the browser; in Safari you can add it to your home screen like an app. Automatic capture from notifications is only available on Android.`
7. `¿Cómo registra mis gastos automáticamente?` — `En la app de Android, con tu permiso, lee las notificaciones de compra que tu banco te envía y crea el movimiento por ti. Tú puedes revisarlo o corregirlo.`
   EN `How does it log my expenses automatically?` — `In the Android app, with your permission, it reads the purchase notifications your bank sends you and creates the transaction for you. You can review or edit it.`
8. `¿En qué monedas funciona?` — `En pesos mexicanos y en otras monedas; convierte los montos a tu moneda principal.`
   EN `Which currencies does it support?` — `Mexican pesos and other currencies; amounts are converted to your main currency.`

**Footer**: añadir enlace `Quiénes somos` · `About us` y `Hecho por ALCE-Soft` (enlace a https://alce-soft.com) · `Made by ALCE-Soft`.

---

## 2. Páginas de producto

Estructura común: H1, intro (1–2 frases), 3 H2 con párrafo corto, bloque CTA (`Crear cuenta gratis`), enlace de regreso a la landing y a las otras 3 páginas ("También te puede interesar" · "You may also like").

### 2.1 `/registrar-gastos-automaticamente`
- Title ES `Registra tus gastos automáticamente en Android | Mi Control de Finanzas Personales` · EN `Log your expenses automatically on Android | Mi Control de Finanzas Personales`
- Desc ES `La app de Android registra tus compras a partir de las notificaciones de tu banco, sin darnos acceso a tu banca en línea. Revisa y corrige cada movimiento.` · EN `The Android app logs your purchases from your bank's notifications, without access to your online banking. Review and edit every transaction.`
- H1 ES `Registra tus gastos automáticamente desde las notificaciones de tu banco` · EN `Log your expenses automatically from your bank's notifications`
- Intro ES `Cada vez que tu banco te avisa de una compra en el celular, la app de Android puede convertir ese aviso en un movimiento, sin que lo captures a mano.` · EN `Every time your bank notifies you of a purchase on your phone, the Android app can turn that alert into a transaction, so you don't have to type it in.`
- H2 `Cómo funciona` · `How it works` — `Das permiso a la app para leer notificaciones. Cuando llega un aviso de compra, la app toma el monto, el comercio y la fecha, y crea el movimiento en la cuenta o tarjeta que corresponde.` · `You allow the app to read notifications. When a purchase alert arrives, the app takes the amount, merchant and date, and creates the transaction in the matching account or card.`
- H2 `Sin acceso a tu banco` · `No access to your bank` — `No te pedimos usuario ni contraseña del banco y no nos conectamos a tu banca en línea. Solo se usan los avisos que ya llegan a tu celular, y se ignoran las promociones.` · `We never ask for your bank login and we don't connect to your online banking. Only the alerts already on your phone are used, and promotions are ignored.`
- H2 `Tú tienes la última palabra` · `You have the final say` — `Revisa, edita o borra cualquier movimiento. Si un aviso llega duplicado, la app lo detecta para no registrarlo dos veces.` · `Review, edit or delete any transaction. If an alert arrives twice, the app detects it so it isn't logged twice.`
- Nota: `La captura automática solo está disponible en la app de Android.` · `Automatic capture is only available in the Android app.`

### 2.2 `/escanear-tickets`
- Title ES `Escanea tus tickets y facturas | Mi Control de Finanzas Personales` · EN `Scan your receipts and invoices | Mi Control de Finanzas Personales`
- Desc ES `Toma una foto de tu ticket o sube el PDF de tu factura y la app registra el monto, la fecha y el comercio por ti.` · EN `Snap a photo of your receipt or upload your invoice PDF and the app logs the amount, date and merchant for you.`
- H1 ES `Escanea tus tickets y facturas para registrar tus gastos` · EN `Scan your receipts and invoices to log your expenses`
- Intro ES `Guardar tickets en la cartera no sirve de mucho. Escanéalos y conviértelos en movimientos en segundos.` · EN `Keeping receipts in your wallet doesn't help much. Scan them and turn them into transactions in seconds.`
- H2 `Foto o PDF` · `Photo or PDF` — `Usa la cámara del celular o sube un PDF. La app lee el monto, la fecha y el comercio, y tú confirmas antes de guardar.` · `Use your phone camera or upload a PDF. The app reads the amount, date and merchant, and you confirm before saving.`
- H2 `Detalle por artículo` · `Item-level detail` — `Si el ticket trae varios artículos, puedes dividirlo en partidas con su propia categoría.` · `If the receipt lists several items, you can split it into lines with their own category.`
- H2 `También estados de cuenta` · `Bank statements too` — `Importa tu estado de cuenta y compáralo con lo que registraste para encontrar diferencias.` · `Import your bank statement and compare it with what you logged to spot differences.`

### 2.3 `/control-de-tarjetas-y-msi`
- Title ES `Controla tus tarjetas, fechas de corte y MSI | Mi Control de Finanzas Personales` · EN `Track your credit cards, statement dates and installments | Mi Control de Finanzas Personales`
- Desc ES `Registra tus tarjetas de crédito y lleva el control de fechas de corte, pagos y meses sin intereses mes a mes. No somos un banco: tú registras tus tarjetas.` · EN `Log your credit cards and keep track of statement dates, payments and interest-free installments month by month. We're not a bank: you log your own cards.`
- H1 ES `Lleva el control de tus tarjetas de crédito y meses sin intereses` · EN `Keep track of your credit cards and interest-free installments`
- Intro ES `Registra las tarjetas que ya tienes y deja de adivinar cuánto debes, cuándo corta cada una y cuánto te falta de cada compra a meses.` · EN `Log the cards you already have and stop guessing how much you owe, when each one closes and how much is left on each installment purchase.`
- H2 `Fechas de corte y de pago` · `Statement and payment dates` — `Indica el día de corte y de pago de cada tarjeta. La app agrupa tus compras por periodo y te muestra cuánto pagar.` · `Set each card's statement and payment day. The app groups your purchases by period and shows how much to pay.`
- H2 `Meses sin intereses mes a mes` · `Installments month by month` — `Registra tus compras a meses y ve cuánto toca pagar en cada periodo y cuánto te falta.` · `Log your installment purchases and see how much is due each period and how much is left.`
- H2 `Tarjetas compartidas y adicionales` · `Shared and additional cards` — `Si varias tarjetas comparten una línea de crédito, regístralas juntas para ver tu crédito disponible real.` · `If several cards share one credit line, log them together to see your real available credit.`

### 2.4 `/presupuesto-personal-y-familiar`
- Title ES `Presupuesto personal y familiar | Mi Control de Finanzas Personales` · EN `Personal and family budgeting | Mi Control de Finanzas Personales`
- Desc ES `Pon presupuestos por categoría, recibe avisos antes de pasarte y comparte con tu familia solo las tarjetas y gastos que elijas.` · EN `Set budgets by category, get alerts before you overspend and share only the cards and expenses you choose with your family.`
- H1 ES `Haz tu presupuesto personal o familiar y cúmplelo` · EN `Build your personal or family budget and stick to it`
- Intro ES `Saber cuánto gastas es el primer paso; ponerte un límite es el segundo.` · EN `Knowing how much you spend is step one; setting a limit is step two.`
- H2 `Presupuestos por categoría` · `Budgets by category` — `Define cuánto quieres gastar en comida, transporte o lo que necesites, y mira tu avance durante el mes.` · `Decide how much to spend on food, transport or anything else, and follow your progress through the month.`
- H2 `Avisos antes de pasarte` · `Alerts before you overspend` — `La app te avisa cuando te acercas al límite.` · `The app warns you as you approach the limit.`
- H2 `Plan familiar` · `Family plan` — `Invita a tu familia y comparte solo las tarjetas y los gastos que decidas. Lo demás sigue siendo privado.` · `Invite your family and share only the cards and expenses you choose. Everything else stays private.`

---

## 3. Quiénes somos (`/quienes-somos` · `/en/quienes-somos`)

- Title ES `Quiénes somos | Mi Control de Finanzas Personales` · EN `About us | Mi Control de Finanzas Personales`
- Desc ES `Mi Control de Finanzas Personales es una app de ALCE-Soft para llevar el control de tus gastos personales, con tus datos privados.` · EN `Mi Control de Finanzas Personales is an app by ALCE-Soft to keep track of your personal expenses, with your data kept private.`
- H1 ES `Quiénes somos` · EN `About us`
- Párrafo ES `Mi Control de Finanzas Personales es una app desarrollada por ALCE-Soft (alce-soft.com). La creamos para que cualquier persona sepa a dónde va su dinero sin depender de hojas de cálculo ni entregar el acceso a su banco.` · EN `Mi Control de Finanzas Personales is an app developed by ALCE-Soft (alce-soft.com). We built it so anyone can see where their money goes without spreadsheets and without handing over access to their bank.`
- H2 `Qué es y qué no es` · `What it is and what it isn't` — `Es una herramienta para registrar y entender tus gastos. No es un banco ni una fintech: no damos cuentas, tarjetas ni crédito, y no movemos tu dinero.` · `It's a tool to log and understand your expenses. It isn't a bank or a fintech: we don't provide accounts, cards or credit, and we never move your money.`
- H2 `Nuestro compromiso con tus datos` · `Our commitment to your data` — (mismas 4 viñetas de "Tus datos son solo tuyos") + enlace a la política de privacidad.
- H2 `Contacto` · `Contact` — `Escríbenos a soporte@controlfinanzaspersonales.com o usa el formulario de comentarios de la página principal.` · `Write to us at soporte@controlfinanzaspersonales.com or use the feedback form on the home page.` (enlace a `/#comentarios`)

---

## 4. Páginas existentes (solo metadatos)

| Ruta | Title ES | Title EN |
|---|---|---|
| `/instalar-android` | `Cómo instalar la app en Android \| Mi Control de Finanzas Personales` | `How to install the Android app \| Mi Control de Finanzas Personales` |
| `/privacidad` | `Política de privacidad \| Mi Control de Finanzas Personales` | `Privacy policy \| Mi Control de Finanzas Personales` |
| `/terminos` | `Términos y condiciones \| Mi Control de Finanzas Personales` | `Terms and conditions \| Mi Control de Finanzas Personales` |
| `/cookies` | `Política de cookies \| Mi Control de Finanzas Personales` | `Cookie policy \| Mi Control de Finanzas Personales` |
| 404 | `Página no encontrada` + `noindex` | `Page not found` + `noindex` |
| `/login`, `/reset-password`, rutas privadas | `noindex` (no van en el sitemap) | |

---

## 5. Datos estructurados (JSON-LD, solo landing)

- `SoftwareApplication`: name `Mi Control de Finanzas Personales`; applicationCategory `FinanceApplication`; operatingSystem `Android, Web`; inLanguage `["es","en"]`; url `https://controlfinanzaspersonales.com/`; offers: `0 MXN` (Gratis), `PRICES.monthly` MXN (Premium mensual), `PRICES.yearly` MXN (Premium anual); publisher → `Organization` ALCE-Soft, url `https://alce-soft.com`.
- **Sin** `aggregateRating` ni reseñas (no hay reseñas reales que citar).
- `Organization` (ALCE-Soft) también en `/quienes-somos`.

## 6. `llms.txt` (borrador)

```markdown
# Mi Control de Finanzas Personales

> App de control de gastos personales (web y Android) de ALCE-Soft. Sirve para registrar ingresos, gastos, cuentas, tarjetas de crédito, fechas de corte, meses sin intereses y presupuestos. No es un banco ni una fintech: no ofrece cuentas, tarjetas ni crédito; cada persona registra los suyos y sus datos son privados.

## Qué hace
- Captura automática de gastos en la app de Android a partir de las notificaciones del banco (sin acceso a la banca en línea).
- Escaneo de tickets y facturas (foto o PDF).
- Control de tarjetas: fechas de corte, pagos y meses sin intereses mes a mes.
- Presupuestos por categoría y plan familiar (se comparte solo lo que el usuario elige).
- Suscripciones, varias monedas, importación de estados de cuenta y exportación a Excel.
- Español e inglés.

## Precios
- Gratis, sin vencimiento.
- Premium: $107 MXN al mes o $1,037 MXN al año, con 7 días de prueba.

## Páginas
- [Inicio](https://controlfinanzaspersonales.com/)
- [Captura automática en Android](https://controlfinanzaspersonales.com/registrar-gastos-automaticamente)
- [Escaneo de tickets](https://controlfinanzaspersonales.com/escanear-tickets)
- [Tarjetas, fechas de corte y MSI](https://controlfinanzaspersonales.com/control-de-tarjetas-y-msi)
- [Presupuesto personal y familiar](https://controlfinanzaspersonales.com/presupuesto-personal-y-familiar)
- [Quiénes somos](https://controlfinanzaspersonales.com/quienes-somos)
- [Política de privacidad](https://controlfinanzaspersonales.com/privacidad)
- [English version](https://controlfinanzaspersonales.com/en)
```
(Precios: se generan de `PRICES` al construir, para no desincronizarse.)

## 7. Pendientes fuera de este lote

- **Correo de contacto** (otra sesión): reemplazar el Gmail personal en `PrivacyPolicyPage` y añadirlo en Quiénes somos y `llms.txt`.
- **Textos legales**: la política de privacidad aún describe la sincronización con Gmail/Outlook, que ya no existe.
