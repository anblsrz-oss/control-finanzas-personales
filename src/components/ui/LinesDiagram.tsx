import { useEffect, useId, useState } from 'react'

// Motivo de marca: tres líneas de colores que se cruzan en una interconexión (solo
// ángulos de 45° y 90°). Pensado para fondos oscuros (esmalte medianoche).
// Anima al aparecer: las líneas se trazan, las estaciones surgen en cadena, la
// interconexión pulsa y un "tren" recorre cada ruta. Con "reducir movimiento" queda
// estático (CSS en index.css para el trazo; los trenes simplemente no se montan).

const LINES = [
  { id: 'r', d: 'M20 40 H120 L180 100 H300', color: 'rgb(255 99 110)', delay: 0.1, train: { dur: 7, begin: 2.2 } },
  { id: 'b', d: 'M20 180 H110 L170 120 V30', color: 'rgb(107 148 255)', delay: 0.3, train: { dur: 6, begin: 3.4 } },
  { id: 'a', d: 'M300 190 H220 L170 140 L110 80 H20', color: 'rgb(251 176 52)', delay: 0.5, train: { dur: 8, begin: 2.8 } },
] as const

const STATIONS: [number, number][] = [[60, 40], [120, 40], [240, 100], [60, 180], [250, 190], [60, 80]]

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(true) // por defecto sin trenes hasta confirmar
  useEffect(() => {
    const q = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(q.matches)
    const on = () => setReduced(q.matches)
    q.addEventListener('change', on)
    return () => q.removeEventListener('change', on)
  }, [])
  return reduced
}

export function LinesDiagram({ className = 'w-full max-w-sm' }: { className?: string }) {
  const uid = useId().replace(/:/g, '')
  const reduced = usePrefersReducedMotion()
  return (
    <svg viewBox="0 0 320 220" className={className} aria-hidden="true" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {LINES.map((l) => (
        <path
          key={l.id}
          id={`${uid}-${l.id}`}
          d={l.d}
          pathLength={1}
          stroke={l.color}
          strokeWidth="8"
          className="metro-line"
          style={{ '--d': `${l.delay}s` } as React.CSSProperties}
        />
      ))}
      {STATIONS.map(([x, y], i) => (
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r="5"
          fill="rgb(8 13 32)"
          stroke="#fff"
          strokeWidth="3"
          className="metro-station"
          style={{ '--d': `${0.7 + i * 0.12}s` } as React.CSSProperties}
        />
      ))}
      {/* Interconexión: anillo que late suavemente detrás del nodo central */}
      <circle cx="170" cy="110" r="14" fill="#fff" className="metro-ping" />
      <circle cx="170" cy="110" r="14" fill="#fff" stroke="rgb(8 13 32)" strokeWidth="4" className="metro-station" style={{ '--d': '1.2s' } as React.CSSProperties} />

      {/* Trenes: un punto por línea que recorre la ruta en bucle */}
      {!reduced &&
        LINES.map((l) => (
          <circle key={`t-${l.id}`} r="4.5" fill="#fff" stroke={l.color} strokeWidth="2.5" opacity="0">
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.05;0.95;1" dur={`${l.train.dur}s`} begin={`${l.train.begin}s`} repeatCount="indefinite" />
            <animateMotion dur={`${l.train.dur}s`} begin={`${l.train.begin}s`} repeatCount="indefinite" rotate="auto">
              <mpath href={`#${uid}-${l.id}`} />
            </animateMotion>
          </circle>
        ))}
    </svg>
  )
}
