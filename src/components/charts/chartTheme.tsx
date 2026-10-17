import { useSettings, resolveIsDark } from '@/store/useSettings'

// Lenguaje visual compartido de las gráficas: rejilla mínima, ejes sin línea,
// tooltip y leyenda propios (con el tramo de línea de cada serie) y estaciones
// como marcadores de punto. Todo lo que dibujamos en HTML usa clases del tema;
// lo que dibuja recharts (SVG) recibe los colores resueltos aquí.
export function useChartTheme() {
  const theme = useSettings((s) => s.theme)
  const dark = resolveIsDark(theme)
  return {
    dark,
    axisColor: dark ? '#8593b3' : '#5f6e91',
    gridColor: dark ? '#1f2b52' : '#e1e6f2',
    surface: dark ? '#111a36' : '#ffffff',
    cursorFill: dark ? 'rgba(133,147,179,0.10)' : 'rgba(31,79,216,0.06)',
  }
}

export const AXIS_TICK = { fontSize: 11, fontWeight: 500 }

// 1,200,000 → 1.2M. Los ejes no necesitan la cifra completa; el tooltip sí.
const compactFmt = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })
export const compact = (n: number) => compactFmt.format(n)

interface TooltipRow {
  name?: string | number
  value?: number | string
  color?: string
  fill?: string
  stroke?: string
  payload?: { color?: string }
}

interface ChartTooltipProps {
  active?: boolean
  payload?: TooltipRow[]
  label?: string | number
  format: (value: number, name: string) => string
  // Cuando el nombre de la fila ya es la etiqueta (pastel), no repetirla arriba.
  hideLabel?: boolean
}

export function ChartTooltip({ active, payload, label, format, hideLabel }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="min-w-[9rem] rounded-md border border-slate-200 bg-surface px-3 py-2 text-xs shadow-lg dark:border-slate-700">
      {!hideLabel && label != null && (
        <p className="mb-1.5 font-semibold text-slate-900 dark:text-slate-100">{label}</p>
      )}
      <ul className="space-y-1">
        {payload.map((row, i) => (
          <li key={i} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <span
                aria-hidden="true"
                className="h-1 w-3.5 rounded-full"
                style={{ backgroundColor: row.payload?.color ?? row.color ?? row.fill ?? row.stroke }}
              />
              {row.name}
            </span>
            <span className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">
              {format(Number(row.value), String(row.name))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

interface LegendRow {
  value?: string | number
  color?: string
}

// Leyenda: cada serie con su tramo de línea, centrada y sin recuadros.
export function ChartLegend({ payload }: { payload?: LegendRow[] }) {
  if (!payload?.length) return null
  return (
    <ul className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-slate-600 dark:text-slate-300">
      {payload.map((row, i) => (
        <li key={i} className="flex items-center gap-2">
          <span aria-hidden="true" className="h-1 w-4 rounded-full" style={{ backgroundColor: row.color }} />
          {row.value}
        </li>
      ))}
    </ul>
  )
}

// Parada de línea: círculo relleno del color de la superficie con borde del color
// de la serie. Se usa como `dot` / `activeDot` de <Line>.
export function stationDot(color: string, surface: string, r = 4) {
  return { r, fill: surface, stroke: color, strokeWidth: 3 }
}
