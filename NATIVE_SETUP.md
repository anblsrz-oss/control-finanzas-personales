# Ahorbit — Guía de app nativa (Capacitor) y sincronización de datos

Fase 8. La PWA React se empaqueta como app nativa con **Capacitor** y se añaden
tres vías propias de ingesta de movimientos (import CSV, correo, SMS) más el
andamiaje para un agregador Premium futuro.

> Estas notas cubren lo que hay que hacer **en tu equipo** (requiere Android
> Studio / Xcode, que no viven en el repo). El código y la config ya están listos.

---

## 1. Requisitos

- Node 18+ y el proyecto instalado (`npm install`).
- **Android**: Android Studio (SDK + emulador o teléfono con depuración USB).
- **iOS**: una **Mac** con Xcode. Sin Mac no se puede compilar iOS.

## 2. Añadir las plataformas nativas (una sola vez)

```bash
npm run build            # genera dist/
npx cap add android
npx cap add ios          # solo en Mac
```

Esto crea las carpetas `android/` e `ios/`. Después de cada cambio de código:

```bash
npm run cap:android      # build + sync + abre Android Studio
npm run cap:ios          # build + sync + abre Xcode (Mac)
```

## 3. Iconos de la app

Los iconos base ya se generan con `node scripts/gen-icons.mjs`
(`public/icon-source-1024.png` es la fuente). Para propagarlos a Android/iOS:

```bash
npm i -D @capacitor/assets
npx capacitor-assets generate --iconBackgroundColor '#0f766e' --iconBackgroundColorDark '#0f766e'
```

## 4. Login con Google en la app (deep link)

El código ya cambia solo según plataforma (ver [src/lib/nativeAuth.ts](src/lib/nativeAuth.ts)).
Falta registrar el esquema `com.ahorbit.app://auth-callback` en cada plataforma:

**Android** — `android/app/src/main/AndroidManifest.xml`, dentro de la `<activity>`:

```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="com.ahorbit.app" android:host="auth-callback" />
</intent-filter>
```

**iOS** — `ios/App/App/Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array><string>com.ahorbit.app</string></array>
  </dict>
</array>
```

**Supabase** (Authentication → URL Configuration → Redirect URLs) y **Google Cloud**
(OAuth client → Authorized redirect URIs): añadir
`com.ahorbit.app://auth-callback` junto con las URLs de Vercel ya existentes.

## 5. Sincronizar correo (Gmail) — multiplataforma

Dos modos: **manual** (`sync-email`, siempre disponible) y **tiempo real**
(Gmail push por Pub/Sub, opt-in).

- UI: [src/features/email/EmailSyncPage.tsx](src/features/email/EmailSyncPage.tsx).
  Funciones (repo `finzen-backend`): `sync-email` (pull manual), `gmail-watch`
  (activa el push), `gmail-push` (webhook), `gmail-watch-renew` (cron). El parseo
  está compartido en `supabase/functions/_shared/parseEmail.ts`.
- Scope `https://www.googleapis.com/auth/gmail.readonly`. En Google Cloud habilita
  la **Gmail API** y agrega el scope en la pantalla de consentimiento OAuth.
- **`Error 403: access_denied`** = la app OAuth está en *Testing* y `gmail.readonly`
  es restringido. Solución: Google Cloud → *Pantalla de consentimiento de OAuth* →
  **Usuarios de prueba** → añadir el correo (máx. 100). Para uso público hay que
  pasar la **verificación de Google (CASA)**. En *Testing* los refresh tokens
  caducan a los ~7 días → hay que reconectar Gmail cada semana.
- Desplegar el pull manual: `npx supabase functions deploy sync-email`.

### 5.1. Correo en TIEMPO REAL (Gmail push / Pub/Sub)

1. **Migración**: aplica `0033_gmail_connections.sql` (guarda por usuario el
   `refresh_token`, `history_id` y `watch_expiration`; el `refresh_token` no es
   legible por el cliente).
2. **Google Cloud → Pub/Sub**:
   - Habilita la **Pub/Sub API**.
   - Crea un **topic** (ej. `gmail-push`). Dale rol **Pub/Sub Publisher** a
     `gmail-api-push@system.gserviceaccount.com` (así Gmail puede publicar).
   - Crea una **push subscription** al topic con endpoint:
     `https://<REF>.supabase.co/functions/v1/gmail-push?token=<GMAIL_PUSH_SECRET>`.
3. **OAuth offline**: `connectGmail` ya pide `access_type=offline` + `prompt=consent`,
   así Google devuelve `provider_refresh_token`. El botón "Activar tiempo real"
   llama a `gmail-watch`, que guarda el refresh token y activa `users.watch`.
4. **Secrets de las funciones** (`npx supabase secrets set ...`):
   `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (los mismos del proveedor Google en
   Supabase Auth), `GMAIL_PUBSUB_TOPIC` (`projects/<proj>/topics/gmail-push`),
   `GMAIL_PUSH_SECRET` (aleatorio), `CRON_SECRET` (aleatorio).
5. **Desplegar**:
   ```bash
   npx supabase functions deploy gmail-watch
   npx supabase functions deploy gmail-push --no-verify-jwt
   npx supabase functions deploy gmail-watch-renew --no-verify-jwt
   ```
6. **Renovación del watch** (expira <7 días). Programa `gmail-watch-renew` a diario
   con pg_cron + pg_net (Supabase → Database → Extensions: habilita `pg_cron` y
   `pg_net`), en el SQL Editor:
   ```sql
   select cron.schedule('gmail-watch-renew-daily', '0 6 * * *', $$
     select net.http_post(
       url    := 'https://<REF>.supabase.co/functions/v1/gmail-watch-renew',
       headers:= jsonb_build_object('x-cron-secret', '<CRON_SECRET>')
     );
   $$);
   ```

## 6. Captura automática de SMS — solo Android (tiempo real)

- Código: [src/lib/smsSync.ts](src/lib/smsSync.ts) +
  [src/features/sms/SmsSyncPage.tsx](src/features/sms/SmsSyncPage.tsx) +
  nativo `android/app/src/main/java/com/ahorbit/app/SmsReceiver.java` y
  `SmsCapturePlugin.java` (registrado en `MainActivity.java`). Backend: Edge
  Function `ingest-sms` + migración `0032_sms_device_tokens.sql`.
- **Cómo funciona**: `SmsReceiver` intercepta el SMS al llegar (app abierta o
  cerrada) y lo POSTea a `ingest-sms`, que parsea, detecta ingreso/gasto,
  deduplica e inserta como **pendiente**. Un token de dispositivo (hash en BD)
  autentica al receptor. Al abrir la app hay un auto-sync de respaldo que lee el
  inbox por si el receptor fue throttleado por batería.
- **Instalar** el lector de inbox (fallback) y sincronizar el proyecto nativo:
  ```bash
  npm i @ao627515/capacitor-sms-vault
  npx cap sync android
  ```
  (`capacitor-sms-inbox`, la opción original, solo declara soporte para
  Capacitor 7 — este proyecto usa Capacitor 8. `@ao627515/capacitor-sms-vault`
  sí declara soporte 7||8; su código nativo se auditó antes de integrarlo:
  solo hace consultas parametrizadas al ContentResolver, sin llamadas de red.
  Se usa únicamente `getSmsList`/`checkPermissions`/`requestPermissions` para
  el fallback — su propio listener en tiempo real NO sirve para "app cerrada"
  porque se registra dinámicamente y muere con el proceso, por eso el
  `SmsReceiver.java` nativo propio sigue siendo imprescindible.)
- Permisos ya declarados en `AndroidManifest.xml`: `RECEIVE_SMS`, `READ_SMS`,
  `POST_NOTIFICATIONS` (+ el `<receiver>` de `SmsReceiver`). El manifest también
  elimina explícitamente (`tools:node="remove"`) los permisos `SEND_SMS`,
  `READ_PHONE_STATE` y `READ_PHONE_NUMBERS` que `capacitor-sms-vault` declara
  para funciones que esta app no usa.
- **Desplegar** el backend:
  ```bash
  # aplicar 0032_sms_device_tokens.sql (SQL Editor o supabase db push)
  npx supabase functions deploy ingest-sms --no-verify-jwt
  ```
- **Batería**: pide al usuario **excluir la app de la optimización de batería**
  para que el receptor no se mate con la app cerrada.
- **Google Play**: `READ_SMS`/`RECEIVE_SMS` son permisos restringidos y Play casi
  siempre los rechaza para finanzas personales → mantener distribución por **APK**.
- En iOS/web la pantalla muestra "no disponible" automáticamente.

## 7. Base de datos

Aplica la migración [0002_ingestion.sql](https://github.com/anblsrz-oss/finzen-backend/blob/main/supabase/migrations/0002_ingestion.sql)
(repo `finzen-backend`) en Supabase (SQL Editor o `supabase db push`). Es idempotente. Agrega a
`transactions` los campos `source / external_id / pending / raw_ref`, crea
`statement_imports`, `import_staging`, `parsing_rules`, `bank_connections`, y
recrea las vistas de saldo para **excluir** movimientos pendientes.

## 8. Publicación en tiendas (costos)

- **Google Play**: cuenta de desarrollador, **$25 USD** pago único.
- **App Store**: **Apple Developer Program, $99 USD/año** (+ Mac para compilar).

## 9. Agregador (Premium futuro)

[sync-aggregator](https://github.com/anblsrz-oss/finzen-backend/blob/main/supabase/functions/sync-aggregator/index.ts)
(repo `finzen-backend`) es un stub. Cuando el negocio justifique el costo (~$1,000 USD/mes de Belvo),
se implementa el widget + webhooks y se insertan movimientos con
`source='aggregator'`. La tabla `bank_connections` ya existe.
