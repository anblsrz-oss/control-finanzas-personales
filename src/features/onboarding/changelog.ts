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
    id: '2026-10-18-conciliacion-mas-confiable',
    date: '2026-10-18',
    title: 'Conciliación más confiable',
    description:
      'Compara el estado de cuenta contra una línea de crédito completa (tarjeta física y virtual juntas) con el nuevo selector "Línea". Los movimientos se empatan aunque el banco cambie el nombre o la fecha unos días, y ya se leen bien los cargos en moneda extranjera y las compras de los estados de NU. Además el botón Comparar responde al instante, muestra el avance real y la lectura de los estados de cuenta escaneados es mucho más precisa.',
  },
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
]
