// Novedades de la app, más reciente primero. Cada vez que se agregue o
// cambie una funcionalidad que valga la pena avisar, se agrega una entrada
// aquí — el punto rojo del botón "Novedades" se enciende solo hasta que el
// usuario lo abre.
//
// Solo se conservan las entradas de las DOS fechas más recientes: al agregar
// una entrada de una fecha nueva, borra las de la fecha más antigua.

export interface ChangelogEntry {
  id: string
  date: string
  title: string
  description: string
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    id: '2026-10-17-pago-tarjeta-y-diferir',
    date: '2026-10-17',
    title: 'Pago de tarjeta a tu medida y compras a meses con intereses',
    description:
      'Al pagar una tarjeta ahora eliges si es un abono parcial, el pago del periodo o el total adeudado (el monto se llena solo). Si el banco te pasó una compra a meses después de hacerla, usa Diferir en Transacciones: eliges meses y tasa (% mensual o total) y ves la mensualidad y el total con intereses. Además, la captura automática ya no registra avisos de aumento de límite (te lo sugerimos en Líneas de crédito), promociones tipo "50% de devolución" ni el cobro bruto de Stripe antes del depósito.',
  },
  {
    id: '2026-10-17-taffy-animada',
    date: '2026-10-17',
    title: 'Taffy cobra vida',
    description:
      'Taffy ahora reacciona: se mueve cuando la tocas, inclina la cabeza mientras piensa, se alegra al responderte y te saluda de vez en cuando desde la burbuja. En la app del celular también vibra un poco al tocarla.',
  },
  {
    id: '2026-10-16-asistente-y-guias',
    date: '2026-10-16',
    title: 'Asistente de ayuda y guías de todas las funciones',
    description:
      'Conoce a Taffy, el nuevo asistente (la burbuja de abajo a la derecha): contesta tus dudas sobre la app y te ayuda a crear cuentas, tarjetas, categorías, presupuestos y suscripciones; antes de guardar nada te pide confirmación. Además, Preguntas frecuentes ahora trae una guía paso a paso de cada sección.',
  },
  {
    id: '2026-10-16-nuevo-diseno',
    date: '2026-10-16',
    title: 'Nuevo diseño, inicio de la app y página de Suscripción',
    description:
      'Estrenamos diseño: nueva paleta, tipografía y gráficas, ventanas de confirmación propias, listas desplegables con búsqueda y formularios más claros. En la app del celular hay una pantalla de inicio propia y la pantalla de arranque con tu logo, y los planes viven ahora en la página de Suscripción. En Transacciones puedes filtrar rápido lo pendiente de confirmar y elegir un motivo rápido (duplicado, error de captura…) al eliminar.',
  },
  {
    id: '2026-10-11-captura-cuenta-o-tarjeta-por-palabras',
    date: '2026-10-11',
    title: 'Captura automática: cuenta o tarjeta según el aviso, y menos falsos movimientos',
    description:
      'En Captura por notificaciones → Ajustes de cada app ahora puedes decir a qué cuenta o tarjeta va un aviso según sus palabras (por ejemplo, en Mercado Pago "debitamos" a tu cuenta y "compra" a tu tarjeta de crédito), para las apps que no dicen la terminación. Además: las compras de DiDi Card que avisa DiDi Food ya se registran, las promociones con monto ("¿Vas por los $30,000 mensuales?", "¡Continúas con el 12% anual!") ya no entran como movimientos, un SMS ya no se registra dos veces, y una transferencia entre tus cuentas avisada por los dos bancos queda como un solo movimiento.',
  },
]
