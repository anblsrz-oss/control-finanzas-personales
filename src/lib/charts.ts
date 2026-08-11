// Metadatos de los gráficos de Resumen y Reportes: fuente única de qué gráficos
// existen, en qué orden y qué es configurable en cada uno. Lo consumen el panel
// de configuración, la barra de acciones (ChartCard) y las páginas.

export type ChartId =
  | 'incomeExpense'
  | 'category'
  | 'byCard'
  | 'byAccount'
  | 'creditUsage'
  | 'budget'
  | 'subscriptions'

export type ChartPage = 'dashboard' | 'reports'

export interface ChartSeriesMeta {
  key: string
  // Clave i18n de la etiqueta (en español, que es la clave natural).
  labelKey: string
  defaultColor: string
  // Si el usuario puede ocultarla. Las series estructurales (p. ej. el
  // "disponible" del crédito) no se ocultan.
  togglable: boolean
}

export interface ChartMeta {
  id: ChartId
  titleKey: string
  series: ChartSeriesMeta[]
  // true cuando cada punto de la gráfica es una entidad con color propio
  // (categorías): se permite override de color y ocultar por punto.
  perPointColors: boolean
}

const INCOME_COLOR = '#16a34a'
const EXPENSE_COLOR = '#ef4444'
const CREDIT_COLOR = '#6366f1'

// Series ingreso/egreso compartidas por las barras agrupadas.
const incomeExpenseSeries: ChartSeriesMeta[] = [
  { key: 'income', labelKey: 'Ingresos', defaultColor: INCOME_COLOR, togglable: true },
  { key: 'expense', labelKey: 'Egresos', defaultColor: EXPENSE_COLOR, togglable: true },
]

// El gráfico mensual añade el crédito usado; los desgloses por tarjeta/cuenta no.
const incomeExpenseCreditSeries: ChartSeriesMeta[] = [
  ...incomeExpenseSeries,
  { key: 'credit', labelKey: 'Crédito usado', defaultColor: CREDIT_COLOR, togglable: true },
]

export const CHART_META: Record<ChartId, ChartMeta> = {
  incomeExpense: {
    id: 'incomeExpense',
    titleKey: 'Ingresos vs Egresos',
    series: incomeExpenseCreditSeries,
    perPointColors: false,
  },
  category: {
    id: 'category',
    titleKey: 'Gastos por Categoría',
    // Una sola serie de valor; el color real vive por punto (categoría).
    series: [{ key: 'value', labelKey: 'Gasto', defaultColor: '#0ea5e9', togglable: false }],
    perPointColors: true,
  },
  byCard: {
    id: 'byCard',
    titleKey: 'Ingresos y Egresos por Tarjeta',
    series: incomeExpenseSeries,
    perPointColors: false,
  },
  byAccount: {
    id: 'byAccount',
    titleKey: 'Ingresos y Egresos por Cuenta',
    series: incomeExpenseSeries,
    perPointColors: false,
  },
  creditUsage: {
    id: 'creditUsage',
    titleKey: 'Uso de línea de crédito',
    // Los tres umbrales del semáforo + el color del disponible. No se ocultan.
    series: [
      { key: 'low', labelKey: 'Uso bajo', defaultColor: '#16a34a', togglable: false },
      { key: 'medium', labelKey: 'Uso medio', defaultColor: '#f59e0b', togglable: false },
      { key: 'high', labelKey: 'Uso alto', defaultColor: '#ef4444', togglable: false },
      { key: 'available', labelKey: 'Disponible', defaultColor: '#e2e8f0', togglable: false },
    ],
    perPointColors: false,
  },
  budget: {
    id: 'budget',
    titleKey: 'Presupuestos',
    // Mismo esquema que el crédito: semáforo + restante. La diferencia es que
    // aquí los cortes del semáforo no son fijos, los pone el umbral de cada
    // presupuesto (ver BUDGET_STATUS_COLORS en lib/budgets.ts).
    series: [
      { key: 'ok', labelKey: 'Dentro del presupuesto', defaultColor: '#16a34a', togglable: false },
      { key: 'warn', labelKey: 'Cerca del límite', defaultColor: '#f59e0b', togglable: false },
      { key: 'over', labelKey: 'Excedido', defaultColor: '#ef4444', togglable: false },
      { key: 'available', labelKey: 'Restante', defaultColor: '#e2e8f0', togglable: false },
    ],
    perPointColors: false,
  },
  subscriptions: {
    id: 'subscriptions',
    titleKey: 'Gasto por Suscripción',
    // Una sola serie de valor; el color real vive por punto (suscripción),
    // igual que 'category'.
    series: [{ key: 'value', labelKey: 'Gasto', defaultColor: '#8b5cf6', togglable: false }],
    perPointColors: true,
  },
}

// Orden por defecto de cada página (refleja el orden histórico del código).
// Los presupuestos van primero en Resumen: es lo más accionable de la pantalla.
export const DEFAULT_ORDER: Record<ChartPage, ChartId[]> = {
  dashboard: ['budget', 'creditUsage', 'incomeExpense', 'category'],
  reports: ['incomeExpense', 'category', 'subscriptions', 'byCard', 'byAccount', 'creditUsage', 'budget'],
}

// Reconciliación entre el orden guardado (que puede estar incompleto o traer IDs
// viejos) y los gráficos realmente disponibles ahora: respeta el orden guardado,
// agrega al final los disponibles que falten y descarta lo que ya no existe.
export function reconcileOrder(
  saved: ChartId[] | undefined,
  available: ChartId[],
): ChartId[] {
  const availableSet = new Set(available)
  const seen = new Set<ChartId>()
  const result: ChartId[] = []
  for (const id of saved ?? []) {
    if (availableSet.has(id) && !seen.has(id)) {
      result.push(id)
      seen.add(id)
    }
  }
  for (const id of available) {
    if (!seen.has(id)) result.push(id)
  }
  return result
}

// Color efectivo de una serie: override del usuario o el default del metadato.
export function seriesColor(
  config: { seriesColors?: Record<string, string> } | undefined,
  meta: ChartMeta,
  key: string,
): string {
  const override = config?.seriesColors?.[key]
  if (override) return override
  return meta.series.find((s) => s.key === key)?.defaultColor ?? '#64748b'
}

// Categoría de sistema con la que se registran los ajustes de saldo por
// mensualidades MSI ya pagadas. No es flujo de efectivo real: se excluye de los
// totales de reportes, pero sí netea la deuda en card_usage/credit_line_usage.
export const BALANCE_ADJUSTMENT_CATEGORY = 'Ajuste de saldo'
