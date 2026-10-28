import type { ReactNode } from 'react'
import { Card } from '@/components/ui/Card'

export type StatTone = 'green' | 'scarlet' | 'cobalt' | 'amber'

// Clases completas (no interpoladas) para que Tailwind las detecte.
const TONES: Record<StatTone, { bar: string; ring: string; text: string }> = {
  green: { bar: 'bg-line-green', ring: 'border-line-green', text: 'text-line-green' },
  scarlet: { bar: 'bg-line-scarlet', ring: 'border-line-scarlet', text: 'text-line-scarlet' },
  cobalt: { bar: 'bg-line-cobalt', ring: 'border-line-cobalt', text: 'text-line-cobalt' },
  amber: { bar: 'bg-line-amber', ring: 'border-line-amber', text: 'text-line-amber' },
}

export interface StatItem {
  label: string
  value: ReactNode
  tone: StatTone
  hint?: string
}

// Resumen de cifras del periodo: un tramo de línea de color por cifra.
export function StatStrip({ items, className = '' }: { items: StatItem[]; className?: string }) {
  const cols = items.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'
  return (
    <Card className={`!p-0 ${className}`}>
      <dl className={`grid divide-y divide-slate-200 dark:divide-slate-700/70 sm:divide-x sm:divide-y-0 ${cols}`}>
        {items.map((item) => (
          <div key={item.label} className="px-5 py-4">
            {/* Tramo de línea con parada: dentro de la celda, sin tocar el borde. */}
            <span aria-hidden="true" className="mb-3 flex items-center">
              <span className={`h-3 w-3 shrink-0 rounded-full border-[3px] bg-surface ${TONES[item.tone].ring}`} />
              <span className={`h-1 flex-1 rounded-e-full ${TONES[item.tone].bar}`} />
            </span>
            <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">{item.label}</dt>
            <dd className={`mt-1 text-2xl font-bold tracking-tight ${TONES[item.tone].text}`}>{item.value}</dd>
            {item.hint && <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{item.hint}</p>}
          </div>
        ))}
      </dl>
    </Card>
  )
}
