# Declaraciones de contenido de la app

Respuestas para **Play Console → Política → Contenido de la app**, en el orden en que aparecen.

## Política de privacidad

```
https://controlfinanzaspersonales.com/privacidad
```

## Anuncios

**No**, la app no contiene anuncios.

## Acceso a la app

Elegir **"Todas las funciones o algunas de ellas están restringidas"** → agregar instrucciones:

- Nombre: `Cuenta demo`
- Usuario: `demo@controlfinanzaspersonales.com`
- Contraseña: la de la cuenta demo (en `PROYECTO.md`, fuera del repo; no la escribas aquí).
- Instrucciones:

```
Abre la app, toca "Iniciar sesión" y entra con correo y contraseña (no con Google). La cuenta tiene Premium activo y datos de ejemplo: cuentas, tarjetas, tres meses de movimientos, compras a meses sin intereses, presupuestos y suscripciones. La captura por notificaciones y la sincronización de correo son opcionales y se activan desde el menú "Más".
```

La cuenta demo es Premium por `premium_source = 'admin'` y tiene `has_seen_tutorial = true` para que
el revisor no se tope con el recorrido. No la borres ni le quites Premium mientras la app esté en revisión.

## Clasificación de contenido

- Categoría: **Todos los demás tipos de apps** (no es juego, ni red social, ni noticias).
- Violencia, contenido sexual, lenguaje, drogas, apuestas: **No** en todo.
- ¿Los usuarios interactúan o intercambian contenido? **No**. (El plan familiar comparte cuentas solo
  con personas invitadas por correo, sin chat ni contenido público.)
- ¿Comparte la ubicación del usuario? **No**.
- ¿Permite compras digitales? **Sí** (suscripción Premium con Google Play).
- Resultado esperado: **Para todos / IARC 3+**. Aun así el público objetivo es 18+ (siguiente sección).

## Público objetivo y contenido

- Grupo de edad: solo **18 años o más**.
- ¿Podría atraer a niños sin querer? **No**.

## Apps de noticias / Gobierno / Salud / COVID

**No** en todas.

## Funciones financieras

Marcar solo: **"Mi app ofrece otras funciones financieras"** → gestión de finanzas personales /
presupuestos. **No** marcar préstamos, préstamos personales, criptomonedas, banca, pagos, trading
ni seguros: la app no presta, no mueve dinero y no se conecta a cuentas bancarias por API.

Si pide explicación:

```
Es un registro de finanzas personales. El usuario anota o captura sus propios movimientos, saldos, tarjetas y presupuestos para verlos en reportes. La app no ofrece préstamos, no procesa pagos entre personas ni mueve dinero, y no se conecta a bancos: la captura automática lee avisos (notificaciones o correos) que el usuario elige.
```

## Eliminación de datos

- URL: `https://controlfinanzaspersonales.com/eliminar-cuenta`
- ¿Se puede pedir borrar algunos datos sin borrar la cuenta? **Sí**: el usuario puede borrar
  movimientos, cuentas, tarjetas y desconectar el correo o el calendario desde la app.

## Seguridad de los datos

Ver `seguridad-datos.md`.

## Acceso a notificaciones (NotificationListenerService)

La variante `play` declara `BIND_NOTIFICATION_LISTENER_SERVICE`. Play no tiene un formulario
propio para ese permiso, pero lo revisa contra la política de **Divulgación destacada y
consentimiento** y la de datos personales y sensibles. Lo que ya cumple la app:

- La captura está apagada por defecto. Antes de mandar al usuario a los ajustes de Android, la app
  muestra un aviso propio que explica qué se lee, para qué y que lo puede apagar.
- Solo se leen las apps que el usuario marca y solo se envían al servidor las notificaciones con monto
  o confirmación de pago; el texto no se guarda.

Si Play pide la explicación (por ejemplo en una reclamación o en "Permisos sensibles"):

```
La app usa el acceso a notificaciones solo si el usuario activa "Captura por notificaciones" en la pestaña Más. Sirve para registrar automáticamente los gastos e ingresos que anuncian las apps de banco que el usuario elige: de esas notificaciones se extraen el monto, la fecha, el comercio y la terminación de la tarjeta, y se crea el movimiento en su cuenta. Las notificaciones de otras apps no se leen, el texto de la notificación no se guarda y la función se puede apagar en cualquier momento. Antes de pedir el permiso la app muestra un aviso que explica todo esto.
```

Video (si lo piden): grabar en el teléfono con la app de Play: Más → Captura por notificaciones →
aviso propio → Aceptar → ajuste de Android → volver → elegir la app del banco → llega una
notificación → aparece el movimiento en Movimientos.
