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
