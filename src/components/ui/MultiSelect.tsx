import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, Search } from 'lucide-react'

interface MultiSelectProps {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  value: string[]
  onChange: (values: string[]) => void
  /** Texto cuando no hay nada seleccionado (= sin filtro). */
  placeholder?: string
  className?: string
}

// Con más opciones que esto se muestra un buscador dentro de la lista.
const SEARCHABLE_FROM = 6

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// Selección múltiple con chips. Mismo lenguaje visual que Select, pero no se
// puede construir sobre <select multiple>: en móvil es inusable.
export function MultiSelect({
  label,
  error,
  options,
  value,
  onChange,
  placeholder,
  className = '',
}: MultiSelectProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [dropdownRendered, setDropdownRendered] = useState(false)
  const [dropdownVisible, setDropdownVisible] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (open) {
      setDropdownRendered(true)
      const raf = requestAnimationFrame(() => setDropdownVisible(true))
      return () => cancelAnimationFrame(raf)
    }
    setDropdownVisible(false)
    const timeout = setTimeout(() => setDropdownRendered(false), 120)
    return () => clearTimeout(timeout)
  }, [open])

  const toggle = (v: string) => {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])
  }

  const selected = options.filter((o) => value.includes(o.value))
  const searchable = options.length >= SEARCHABLE_FROM
  const visible = useMemo(() => {
    const q = norm(query.trim())
    return q ? options.filter((o) => norm(o.label).includes(q)) : options
  }, [options, query])

  // Al abrir, el cursor cae en el buscador; al cerrar, se limpia la búsqueda.
  useEffect(() => {
    if (open && searchable) searchRef.current?.focus()
    if (!open) setQuery('')
  }, [open, searchable])

  return (
    <div className={className} ref={containerRef}>
      {label && (
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className={`flex w-full items-center justify-between gap-2 rounded-md border bg-surface px-3 py-2 text-left text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
            error ? 'border-line-scarlet' : 'border-slate-300 dark:border-slate-600'
          }`}
        >
          <span className="flex min-w-0 flex-wrap gap-1">
            {selected.length === 0 ? (
              <span className="text-slate-400 dark:text-slate-500">
                {placeholder || t('Todas')}
              </span>
            ) : (
              selected.map((o) => (
                <span
                  key={o.value}
                  className="inline-flex max-w-full items-center gap-1 rounded bg-brand-50 dark:bg-brand-900/30 px-1.5 py-0.5 text-xs text-brand-700 dark:text-brand-200"
                >
                  <span className="truncate">{o.label}</span>
                  {/* Dentro de un <button> no puede ir otro <button>: span con rol. */}
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={t('Quitar')}
                    className="cursor-pointer opacity-60 transition-opacity hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggle(o.value)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        e.stopPropagation()
                        toggle(o.value)
                      }
                    }}
                  >
                    ×
                  </span>
                </span>
              ))
            )}
          </span>
          <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>

        {dropdownRendered && (
          <div
            className={`absolute z-20 mt-1 flex max-h-72 w-full origin-top flex-col overflow-hidden rounded-md border border-slate-200 shadow-xl dark:border-slate-600 bg-surface shadow-lg transition-[transform,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:scale-100 motion-reduce:transition-opacity ${
              dropdownVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}
          >
            {searchable && (
              <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2 dark:border-slate-700">
                <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('Buscar…')}
                  className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none focus-visible:outline-none dark:text-slate-100"
                />
              </div>
            )}
            <div className="overflow-y-auto overscroll-contain py-1">
            {options.length === 0 && (
              <p className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
                {t('Sin opciones')}
              </p>
            )}
            {options.length > 0 && visible.length === 0 && (
              <p className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
                {t('Sin resultados')}
              </p>
            )}
            {visible.map((o) => (
              <label
                key={o.value}
                className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-slate-800"
              >
                <input
                  type="checkbox"
                  className="accent-brand-500"
                  checked={value.includes(o.value)}
                  onChange={() => toggle(o.value)}
                />
                <span className="truncate">{o.label}</span>
              </label>
            ))}
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-line-scarlet">{error}</p>}
    </div>
  )
}
