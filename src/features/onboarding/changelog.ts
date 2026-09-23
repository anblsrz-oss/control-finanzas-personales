// Novedades de la app, más reciente primero. Cada vez que se agregue o
// cambie una funcionalidad que valga la pena avisar, se agrega una entrada
// aquí — el punto rojo del botón "Novedades" se enciende solo hasta que el
// usuario lo abre.

export interface ChangelogEntry {
  id: string
  date: string
  title: string
  description: string
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    id: '2026-09-22-captura-notificaciones',
    date: '2026-09-22',
    title: 'Captura por notificaciones (Android)',
    description:
      'Nueva sección "Captura por notificaciones": marca las apps de tu banco, wallet o tiendas y los cargos que te avisen se registran solos, aun con la app cerrada. Además, si el mismo cargo llega por notificación, SMS y correo ahora se registra una sola vez; si hay duda, se marca como "Posible duplicado" para que lo revises.',
  },
  {
    id: '2026-09-17-rendimientos-tramos-apartados',
    date: '2026-09-17',
    title: 'Tramos, apartados y rendimientos que sí contabilizan',
    description:
      'En Cuentas, una cuenta con rendimiento ahora puede tener tramos por monto (ej. "primeros $50,000 a una tasa, el excedente a otra") y apartados con su propio saldo y tasa, como las cajitas. Además, "Verificar" en Rendimientos ya no es solo comparar: crea una transacción real de ingreso con la categoría "Rendimientos".',
  },
  {
    id: '2026-09-16-vista-tabla-transacciones',
    date: '2026-09-16',
    title: 'Vista de tabla en Transacciones',
    description:
      'Alterna entre la vista de tarjetas y una vista de tabla compacta. Si un movimiento tiene subpartidas, haz clic para ver el detalle en una ventana superpuesta.',
  },
  {
    id: '2026-09-16-subpartidas',
    date: '2026-09-16',
    title: 'Subpartidas en tus transacciones',
    description:
      'Desglosa un gasto (ej. el ticket del súper) en líneas con su propio concepto, monto y categoría. La suma debe cuadrar exacto con el total, y los reportes por categoría ahora usan el detalle si lo capturaste. El OCR de recibos también intenta detectar las líneas del ticket.',
  },
  {
    id: '2026-09-16-suscripciones-auto',
    date: '2026-09-16',
    title: 'Cobro automático de suscripciones',
    description:
      'Para suscripciones que no llegan por correo/SMS, activa "Generar el cargo automáticamente" y la app registrará el cargo sola cada ciclo. Las que sí llegan por correo/SMS ahora se confirman solas si ya estaban activas.',
  },
  {
    id: '2026-09-09-conciliacion',
    date: '2026-09-09',
    title: 'Conciliación con estados de cuenta',
    description:
      'Nueva sección: sube el estado de cuenta (PDF o foto) de una tarjeta o cuenta y la app lo compara con tus movimientos registrados para detectar faltantes, sobrantes y montos distintos. Puedes agregar los faltantes con un clic.',
  },
  {
    id: '2026-09-09-monedas',
    date: '2026-09-09',
    title: 'Más monedas y conversión visible',
    description:
      'El selector de moneda ahora tiene buscador e incluye monedas de Latinoamérica (DOP, ARS, COP, CLP, PEN y más). En el historial, cada movimiento en otra moneda muestra su equivalente en tu moneda principal, y puedes filtrar por moneda.',
  },
  {
    id: '2026-08-09-periodo-pagado',
    date: '2026-08-09',
    title: 'Panel de tarjeta pagada',
    description:
      'Cuando ya pagaste el periodo de una línea de crédito, ahora se muestra el gasto que llevas acumulado para el periodo siguiente en vez del saldo ya confirmado.',
  },
  {
    id: '2026-08-09-tutorial',
    date: '2026-08-09',
    title: 'Tutorial guiado',
    description:
      'Los usuarios nuevos ven un recorrido inicial por las secciones principales. Puedes volver a consultarlo en cualquier momento con el botón "?" de cada sección.',
  },
]
