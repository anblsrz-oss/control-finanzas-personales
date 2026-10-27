import type { ReactNode } from 'react'

// Piezas compartidas de los formularios grandes (tarjeta, transacción): secciones
// con título, selector segmentado para pocas opciones e interruptor con
// descripción. Los campos de texto siguen siendo Input/Select.

export function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="space-y-4 border-t border-slate-200 pt-5 first:border-t-0 first:pt-0 dark:border-slate-700/70">
      <div>
        <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
      {children}
    </section>
  )
}

export interface SegmentedOption<T extends string> {
  value: T
  label: string
  icon?: ReactNode
}

// Para 2–4 opciones excluyentes que conviene ver todas a la vez (en vez de un <select>).
export function Segmented<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label?: string
  value: T
  onChange: (v: T) => void
  options: SegmentedOption<T>[]
}) {
  return (
    <div>
      {label && (
        <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
      )}
      <div role="radiogroup" aria-label={label} className="flex rounded-md bg-slate-100 p-1 dark:bg-slate-800">
        {options.map((o) => {
          const selected = o.value === value
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(o.value)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-2 text-sm font-semibold transition-colors ${
                selected
                  ? 'bg-surface text-brand-700 shadow-sm dark:bg-slate-700 dark:text-slate-100'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {o.icon}
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex w-full items-start gap-3 rounded-md text-start disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span
        aria-hidden="true"
        className={`relative mt-0.5 inline-flex h-6 w-10 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-600'
        }`}
      >
        <span
          className={`absolute start-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-150 ${
            checked ? 'translate-x-4 rtl:-translate-x-4' : ''
          }`}
        />
      </span>
      <span>
        <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">{label}</span>
        {description && <span className="block text-xs text-slate-500 dark:text-slate-400">{description}</span>}
      </span>
    </button>
  )
}
