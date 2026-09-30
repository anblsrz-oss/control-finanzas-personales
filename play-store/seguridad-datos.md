# Formulario de Seguridad de los datos

Respuestas para **Play Console → Política → Contenido de la app → Seguridad de los datos**.
Salen del código de la variante `play` (sin SMS) al 2026-09-29. Si agregas una función que mande
datos a un servicio nuevo, actualiza este archivo, el formulario y `PrivacyPolicyPage.tsx`.

Criterio de Google: pasarle datos a un **proveedor que los procesa en tu nombre** (Supabase, OpenAI,
Resend, Firebase) **no cuenta como "compartir"**. Tampoco lo que el usuario manda a propósito a
otro servicio (sus eventos de Google Calendar). Por eso la respuesta a "compartir" es "no" en todo.

## 1. Recopilación y seguridad

| Pregunta | Respuesta |
|---|---|
| ¿Tu app recopila o comparte alguno de los tipos de datos del usuario obligatorios? | **Sí** |
| ¿Todos los datos se encriptan en tránsito? | **Sí** (HTTPS a Supabase y a todos los proveedores) |
| ¿Ofreces una forma de que los usuarios soliciten que se borren sus datos? | **Sí**, en la app (Configuración → Eliminar mi cuenta) y en `https://controlfinanzaspersonales.com/eliminar-cuenta` |

## 2. Tipos de datos

Marca solo estos. Todo lo demás queda sin marcar (ubicación, contactos, salud, audio,
historial web, calendario, etc.).

| Categoría → tipo | Recopilado | Compartido | ¿Efímero? | ¿Obligatorio? | Propósitos |
|---|---|---|---|---|---|
| Información personal → **Nombre** | Sí | No | No | Opcional | Funcionalidad de la app; Administración de la cuenta |
| Información personal → **Dirección de correo electrónico** | Sí | No | No | Obligatorio | Funcionalidad de la app; Administración de la cuenta; Comunicaciones del desarrollador |
| Información personal → **ID de usuario** | Sí | No | No | Obligatorio | Funcionalidad de la app; Administración de la cuenta |
| Información financiera → **Historial de compras** | Sí | No | No | Obligatorio | Funcionalidad de la app |
| Información financiera → **Otra información financiera** | Sí | No | No | Obligatorio | Funcionalidad de la app |
| Mensajes → **Correos electrónicos** | Sí | No | **Sí** | Opcional | Funcionalidad de la app |
| Mensajes → **Otros mensajes en la app** | Sí | No | **Sí** | Opcional | Funcionalidad de la app |
| Fotos y videos → **Fotos** | Sí | No | **Sí** | Opcional | Funcionalidad de la app |
| Archivos y documentos → **Archivos y documentos** | Sí | No | **Sí** | Opcional | Funcionalidad de la app |
| Actividad en la app → **Otro contenido generado por el usuario** | Sí | No | No | Opcional | Funcionalidad de la app |
| Identificadores de dispositivo → **ID de dispositivo u otros ID** | Sí | No | No | Opcional | Funcionalidad de la app (notificaciones push) |

Por qué cada uno:

- **Nombre, correo, ID de usuario**: la cuenta (Supabase Auth; con Google, el nombre viene de Google).
  El correo también recibe los avisos de presupuesto, suscripciones y reportes (Resend).
- **Historial de compras / Otra información financiera**: las transacciones, saldos, tarjetas,
  límites, MSI y presupuestos que el usuario registra o que la app captura. Se guardan en Supabase.
  El número de tarjeta **no** se recopila (solo los últimos 4 dígitos que escribe el usuario), por
  eso "Información de pago del usuario" queda sin marcar. La compra de Premium la procesa Google Play.
- **Correos electrónicos** (efímero): con Gmail/Outlook conectado, el servidor lee los correos de los
  remitentes que el usuario configura, extrae monto, fecha y concepto y **no guarda el correo**.
- **Otros mensajes en la app** (efímero): el texto de las notificaciones de las apps de banco que el
  usuario elige. Se manda al servidor para extraer el movimiento y no se guarda.
- **Fotos** (efímero): tickets y facturas para el OCR. La imagen va a la función `ocr-receipt`, que la
  manda a OpenAI para extraer los datos; no se guarda en Supabase.
- **Archivos y documentos** (efímero): estados de cuenta que se importan o se concilian; mismo camino
  que las fotos.
- **Otro contenido generado por el usuario**: notas, nombres de categorías, reglas de correo y
  comentarios que el usuario manda desde la app.
- **ID de dispositivo**: el token de Firebase Cloud Messaging (tabla `push_tokens`) para las
  notificaciones push. Se borra al cerrar sesión o eliminar la cuenta.

No se marca **Registros de fallas** ni **Diagnóstico**: la app no tiene Crashlytics, Sentry ni
analítica. No se marca **Eventos del calendario**: la app crea eventos en un calendario propio del
usuario, pero no lee ni guarda sus eventos.

## 3. Resumen que verá el usuario (para revisar que cuadre)

- Datos compartidos con terceros: **ninguno**.
- Datos recopilados: información personal, información financiera, mensajes, fotos, archivos y
  documentos, actividad en la app, ID del dispositivo.
- Los datos se encriptan en tránsito. Puedes solicitar que se borren.

## 4. Coherencia con la política de privacidad

Google compara este formulario con `/privacidad`. Al 2026-09-29 la política no nombraba a OpenAI
(OCR) ni a Resend (correos de la app); se agregaron en `PrivacyPolicyPage.tsx` junto con este archivo.
Hay que desplegar la web antes de mandar el formulario a revisión.
