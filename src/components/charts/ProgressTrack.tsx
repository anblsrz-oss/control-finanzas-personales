// Pista de progreso con forma de tramo de línea: el tramo usado va en el color de
// estado, termina en una parada, y el resto de la pista queda en tono neutro.
export function ProgressTrack({
  percent,
  color,
  trackColor,
  label,
}: {
  percent: number
  color: string
  // Color del tramo disponible; si no se da, usa el neutro del tema.
  trackColor?: string
  label: string
}) {
  const pct = Math.max(0, Math.min(100, percent))
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      className="relative h-3 w-full rounded-full bg-slate-200 dark:bg-slate-700/70"
      style={trackColor ? { backgroundColor: trackColor } : undefined}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
      {pct > 0 && (
        <span
          aria-hidden="true"
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] bg-surface transition-[left] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
          style={{ left: `${Math.min(pct, 97)}%`, borderColor: color }}
        />
      )}
    </div>
  )
}
