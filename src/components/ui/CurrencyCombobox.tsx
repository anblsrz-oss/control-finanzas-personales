import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CURRENCIES,
  CURRENCY_LABELS,
  isValidCurrencyCode,
  normalizeCurrencyCode,
} from '@/lib/format'

interface CurrencyComboboxProps {
  label?: string
  error?: string
  value: string
  onChange: (code: string) => void
  id?: string
  className?: string
}

// Selección de moneda con buscador. Ya son demasiadas para un <select> plano:
// el usuario escribe "peso", "dop", "libra"… y se filtra. Si teclea un código
// ISO de 3 letras que no está en el catálogo, se ofrece usarlo igual (esto
// cubre el caso "otra moneda" sin un campo aparte).
// Construido sobre el mismo patrón de dropdown que MultiSelect.
function norm(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

export function CurrencyCombobox({
  label,
  error,
  value,
  onChange,
  id,
  className = '',
}: CurrencyComboboxProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)
  const [dropdownRendered, setDropdownRendered] = useState(false)
  const [dropdownVisible, setDropdownVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
    }
  }, [open])

  useEffect(() => {
    if (open) {
      setDropdownRendered(true)
      setQuery('')
      setHighlight(0)
      const raf = requestAnimationFrame(() => {
        setDropdownVisible(true)
        inputRef.current?.focus()
      })
      return () => cancelAnimationFrame(raf)
    }
    setDropdownVisible(false)
    const timeout = setTimeout(() => setDropdownRendered(false), 120)
    return () => clearTimeout(timeout)
  }, [open])

  const q = normalizeCurrencyCode(query)
  const nq = norm(query)

  const filtered = useMemo(() => {
    if (!query.trim()) return [...CURRENCIES]
    return CURRENCIES.filter(
      (c) => c.includes(q) || norm(CURRENCY_LABELS[c] ?? '').includes(nq),
    )
  }, [query, q, nq])

  // Código válido que el usuario tecleó y que no está en el catálogo: se
  // ofrece como primera fila.
  const customCode =
    isValidCurrencyCode(q) && !CURRENCIES.includes(q as never) ? q : null

  const rows: { code: string; label: string; custom?: boolean }[] = [
    ...(customCode
      ? [{ code: customCode, label: t('Usar «{{code}}»', { code: customCode }), custom: true }]
      : []),
    ...filtered.map((c) => ({ code: c, label: CURRENCY_LABELS[c] ?? c })),
  ]

  useEffect(() => {
    setHighlight(0)
  }, [query])

  useEffect(() => {
    if (!open) return
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${highlight}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [highlight, open])

  const pick = (code: string) => {
    onChange(normalizeCurrencyCode(code))
    setOpen(false)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => Math.min(h + 1, rows.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const row = rows[highlight]
      if (row) pick(row.code)
    }
  }

  const valueLabel = CURRENCY_LABELS[value]

  return (
    <div className={className} ref={containerRef}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <button
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
            error ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
          }`}
        >
          <span className="flex min-w-0 items-baseline gap-1.5">
            <span className="font-medium text-slate-800 dark:text-slate-100">
              {value || t('Selecciona')}
            </span>
            {valueLabel && (
              <span className="truncate text-xs text-slate-400 dark:text-slate-500">
                {valueLabel}
              </span>
            )}
          </span>
          <span className="shrink-0 text-slate-400">▾</span>
        </button>

        {dropdownRendered && (
          <div
            className={`absolute z-20 mt-1 w-full origin-top rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg transition-[transform,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:scale-100 motion-reduce:transition-opacity ${
              dropdownVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}
          >
            <div className="border-b border-slate-100 dark:border-slate-700 p-1.5">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={t('Buscar moneda…')}
                aria-activedescendant={`currency-opt-${highlight}`}
                className="w-full rounded-md border border-slate-200 dark:border-slate-600 bg-transparent px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div ref={listRef} className="max-h-60 overflow-auto py-1">
              {rows.length === 0 && (
                <p className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
                  {t('Sin resultados. Escribe un código de 3 letras.')}
                </p>
              )}
              {rows.map((row, idx) => (
                <button
                  key={`${row.code}-${row.custom ? 'c' : ''}`}
                  id={`currency-opt-${idx}`}
                  data-idx={idx}
                  type="button"
                  role="option"
                  aria-selected={row.code === value}
                  onMouseEnter={() => setHighlight(idx)}
                  onClick={() => pick(row.code)}
                  className={`flex w-full items-baseline gap-2 px-3 py-1.5 text-left text-sm ${
                    idx === highlight
                      ? 'bg-slate-100 dark:bg-slate-700'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <span className="font-medium text-slate-800 dark:text-slate-100">
                    {row.code}
                  </span>
                  <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {row.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}
