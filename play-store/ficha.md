# Ficha de Google Play

Textos para **Play Console → Crecimiento → Presencia en la tienda → Ficha principal de la tienda**.
Idioma: Español (Latinoamérica) `es-419`.

Reglas que respetan estos textos (no cambiarlas al editar):
- Nada de "cómpralo en la web", precios de Stripe ni enlaces para pagar fuera de Play (anti-steering).
- Nada de SMS: la variante `play` no los lee.
- No se prometen funciones como gratuitas: qué es Premium lo decide la configuración del admin.

## Nombre de la app (≤ 30, usa los 30)

```
Control de Finanzas Personales
```

## Descripción breve (≤ 80)

```
Registra gastos, tarjetas, meses sin intereses y presupuestos en un solo lugar.
```

## Descripción completa (≤ 4000)

```
Mi Control de Finanzas Personales te ayuda a saber en qué se va tu dinero, cuánto debes en tus tarjetas y cuánto te queda para el resto del mes. Pensada para México: tarjetas de crédito con fecha de corte y de pago, meses sin intereses y pesos mexicanos, aunque también maneja otras monedas.

CUENTAS Y TARJETAS
• Registra tus cuentas de nómina, ahorro, inversión y efectivo, con su saldo al día.
• Tarjetas de crédito, débito y vales, con fecha de corte, fecha de pago y límite.
• Líneas de crédito compartidas por varias tarjetas (titular y adicionales).
• Rendimientos de tus cuentas de ahorro, incluso por tramos, y apartados (cajitas).

MOVIMIENTOS
• Ingresos, gastos, transferencias entre tus cuentas y pagos de tarjeta.
• Compras a meses sin intereses: ve cuánto te toca pagar cada mes.
• Reembolsos y cancelaciones de compras.
• Categorías con emoji, subpartidas y notas.
• Busca y filtra por fecha, cuenta, tarjeta, categoría o moneda.

CAPTURA AUTOMÁTICA (opcional)
• Lee las notificaciones de tu app del banco y registra el movimiento por ti. Tú eliges qué apps; las demás notificaciones no se leen.
• Conecta tu correo de Gmail u Outlook con permiso de solo lectura para capturar los avisos de compra de tu banco, según las reglas de remitente que tú configuras.
• Toma una foto de tu ticket o factura y la app extrae el monto, la fecha y el comercio.
• Importa tu estado de cuenta desde un archivo.
• Detecta cargos repetidos para que no registres dos veces la misma compra.

PRESUPUESTOS Y SUSCRIPCIONES
• Fija cuánto quieres gastar por categoría y recibe un aviso antes de pasarte.
• Detecta tus suscripciones (streaming, música, nube) y te avisa antes de cada cobro o si cambia el precio.
• Recordatorios de pago de tarjeta en Google Calendar.

REPORTES
• Resumen del mes: ingresos, gastos, balance y crédito usado.
• Gráficas por categoría, cuenta y tarjeta, con el periodo que tú elijas.
• Compara tus movimientos con el estado de cuenta del banco (conciliación).
• Exporta tus movimientos y reportes a Excel.

EN FAMILIA
• Comparte cuentas y movimientos con tu pareja o familia, cada quien con su usuario.

TU INFORMACIÓN ES TUYA
• Sin anuncios y sin venta de datos.
• Conexión cifrada y cada usuario ve solo su información.
• Oculta los montos con un toque cuando estés en público.
• Borra tu cuenta y todos tus datos desde la app cuando quieras.

La app se puede usar gratis. Premium, una suscripción mensual o anual dentro de la app, desbloquea las funciones avanzadas y quita los límites del plan gratuito.

Dudas o sugerencias: anbl.srz@gmail.com
```

## Datos de contacto (Ficha → Detalles de la tienda)

- Correo: `anbl.srz@gmail.com`
- Sitio web: `https://controlfinanzaspersonales.com`
- Política de privacidad: `https://controlfinanzaspersonales.com/privacidad`
- Categoría: **Finanzas**. Etiquetas sugeridas: presupuesto, gastos, finanzas personales.

## Gráficos

| Campo en Play Console | Archivo |
|---|---|
| Ícono de la app (512×512) | `icono-512.png` |
| Gráfico de funciones (1024×500) | `grafico-destacado-1024x500.png` |
| Capturas de teléfono (1080×2160, en este orden) | `capturas/1-resumen.png` … `capturas/6-suscripciones.png` |

Las capturas son de la cuenta demo (`declaraciones.md` → Acceso a la app), con datos ficticios.
Para rehacerlas: correr la web con `VITE_DISTRIBUTION=play`, entrar con la cuenta demo en un
viewport de 405×810 a escala 2.667 (sale 1080×2160, la proporción máxima que acepta Play es 2:1).
