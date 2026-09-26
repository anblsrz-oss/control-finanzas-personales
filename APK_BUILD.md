# APK de Mi Control de Finanzas Personales (Android) — build, firma y publicación

> `Ahorbit.keystore` y el alias `Ahorbit` son identificadores reales de la firma:
> no los renombres o el APK ya instalado no podrá actualizarse.
> El repo es `anblsrz-oss/control-finanzas-personales` y el Release publica dos
> APKs idénticos: `finzen.apk` (nombre fijo, para `releases/latest/download`) y
> `finzen-vX.Y.Z.apk` (con la versión en el nombre, para saber cuál tienes bajado).

Hay dos caminos. **Recomendado: GitHub Actions** (compila y firma en la nube; tu
equipo no necesita Android Studio). El proyecto `android/` ya está generado y
versionado, y el workflow `.github/workflows/build-apk.yml` ya está listo.

---

## Opción A (recomendada): GitHub Actions

### 1. Genera la llave de firma (una sola vez)
La keystore es un secreto **tuyo** que debes conservar de por vida (sin ella no
podrás publicar actualizaciones que el sistema acepte como la misma app).
Necesitas `keytool` (viene con cualquier JDK). En una terminal:

```bash
keytool -genkey -v -keystore Ahorbit.keystore -alias Ahorbit \
  -keyalg RSA -keysize 2048 -validity 10000
```
Te pedirá una contraseña (guárdala) y algunos datos. Genera `Ahorbit.keystore`.

Conviértela a base64 para guardarla como secret:
```bash
# Linux/macOS/Git Bash:
base64 -w0 Ahorbit.keystore > Ahorbit.keystore.b64
# Windows PowerShell:
[Convert]::ToBase64String([IO.File]::ReadAllBytes("Ahorbit.keystore")) > Ahorbit.keystore.b64
```

> Guarda `Ahorbit.keystore` y las contraseñas en un lugar seguro (gestor de
> contraseñas). NO las subas al repo.

### 2. Agrega los secrets al repo
GitHub → tu repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Valor |
|--------|-------|
| `ANDROID_KEYSTORE_BASE64` | contenido de `Ahorbit.keystore.b64` |
| `ANDROID_KEYSTORE_PASSWORD` | la contraseña del keystore |
| `ANDROID_KEY_ALIAS` | `Ahorbit` |
| `ANDROID_KEY_PASSWORD` | la contraseña de la llave (suele ser la misma) |
| `GOOGLE_SERVICES_JSON_BASE64` | `android/app/google-services.json` (de Firebase) en base64, para que el push funcione |

`google-services.json` no está versionado (identifica el proyecto Firebase),
así que sin este secret el APK compila igual pero **sin push**: el build
detecta que falta el archivo y sigue de largo en silencio.

```powershell
# Windows PowerShell, para obtener el valor de GOOGLE_SERVICES_JSON_BASE64:
[Convert]::ToBase64String([IO.File]::ReadAllBytes("android\app\google-services.json")) | Set-Clipboard
```

### 3. Publica una versión
- **Automático (crea el Release):** empuja una etiqueta de versión:
  ```bash
  git tag v0.1.0
  git push origin v0.1.0
  ```
  El workflow compila, firma y **publica el Release con `finzen.apk` y
  `finzen-vX.Y.Z.apk`** adjuntos. El botón "Descargar app" de la landing apunta
  al nombre fijo (`releases/latest/download/finzen.apk`).

- **Manual (solo probar):** GitHub → **Actions → Build Android APK → Run workflow**.
  El APK firmado queda como *artifact* descargable del run (no crea Release).

### 4. Avisar de la actualización (opcional pero recomendado)
En cada versión nueva, antes de etiquetar:
1. Sube `version` en `package.json` (p. ej. `0.1.0` → `0.2.0`) y crea la etiqueta
   `vX.Y.Z` (misma versión). El workflow toma el `versionName` del tag.
2. Cuando el Release ya exista y `releases/latest/download/finzen.apk` responda
   200, actualiza `public/version.json` (`version` + `notes`, y opcionalmente
   `apkUrl` al asset con versión de ese Release) **en su propio commit**.

- **Web/PWA:** al desplegar, los usuarios ven "Hay una nueva versión → Actualizar".
- **App nativa:** al abrir, si `version.json` tiene una versión mayor, ven
  "Descarga la actualización" con enlace al APK.

---

## Opción B: build local (si prefieres tu equipo)
Requiere **Android Studio / SDK** + **JDK 17**.
```bash
npm run build
npx cap sync android
cd android
./gradlew assembleGithubRelease  # Windows: .\gradlew.bat assembleGithubRelease
```
APK sin firmar en `android/app/build/outputs/apk/github/release/app-github-release-unsigned.apk`.

Hay dos variantes (`productFlavors` en `android/app/build.gradle`):
- `github`: el APK de siempre (con captura de SMS).
- `play`: AAB para Google Play. Compilar el web con `VITE_DISTRIBUTION=play npm run build`,
  luego `npx cap sync android` y `./gradlew bundlePlayRelease` →
  `android/app/build/outputs/bundle/playRelease/app-play-release.aab`. Sin permisos de
  SMS, sin compra con Stripe y sin aviso de actualización por APK (ver `src/lib/distribution.ts`).
  El CI lo genera solo con cada tag (`finzen-play-vX.Y.Z.aab` en el Release).
Fírmalo con Android Studio (Build → Generate Signed Bundle / APK) o con
`apksigner`, y súbelo al Release como `finzen.apk` (y una copia
`finzen-vX.Y.Z.apk`).

---

## Notas
- El APK se hospeda en **GitHub Releases** (no usamos Supabase Storage).
- La URL del APK es configurable con la variable `VITE_APK_URL` (por defecto
  `https://github.com/anblsrz-oss/control-finanzas-personales/releases/latest/download/finzen.apk`).
- `android/` está versionado; los archivos generados (build, assets web, plugins
  cordova) están en `.gitignore` y se regeneran con `cap sync` en cada build.
