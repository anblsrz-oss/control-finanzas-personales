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
    id: '2026-10-11-captura-cuenta-o-tarjeta-por-palabras',
    date: '2026-10-11',
    title: 'Captura automática: cuenta o tarjeta según el aviso, y menos falsos movimientos',
    description:
      'En Captura por notificaciones → Ajustes de cada app ahora puedes decir a qué cuenta o tarjeta va un aviso según sus palabras (por ejemplo, en Mercado Pago "debitamos" a tu cuenta y "compra" a tu tarjeta de crédito), para las apps que no dicen la terminación. Además: las compras de DiDi Card que avisa DiDi Food ya se registran, las promociones con monto ("¿Vas por los $30,000 mensuales?", "¡Continúas con el 12% anual!") ya no entran como movimientos, un SMS ya no se registra dos veces, y una transferencia entre tus cuentas avisada por los dos bancos queda como un solo movimiento.',
  },
  {
    id: '2026-10-03-rendimientos-y-reglas-sin-regex',
    date: '2026-10-03',
    title: 'Rendimientos más exactos y reglas de correo sin regex',
    description:
      'El aviso mensual de Mercado Pago "Ganaste $X en septiembre" ahora se registra solo como el rendimiento de ese mes en tu cuenta (antes entraba como un gasto pendiente), y las invitaciones tipo "Asegura tus ganancias" se ignoran. En Rendimientos, el esperado ya no usa tu saldo de hoy: se calcula con el saldo que tuviste cada día de ese mes, y al elegir un mes pasado se recalcula. En Sincronizar correo ya no necesitas saber regex: pega un correo de ejemplo, escribe el monto, el comercio y la tarjeta que ves, y la app arma la regla con vista previa.',
  },
]
