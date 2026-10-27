import type { SelectHTMLAttributes, ForwardedRef, KeyboardEvent } from 'react'
import { forwardRef, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  /** Más bajo y angosto, para celdas de tabla. */
  compact?: boolean
}

// Con más opciones que esto se muestra un buscador dentro de la lista.
const SEARCHABLE_FROM = 8

function norm(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

// Lista desplegable propia. Por debajo sigue habiendo un <select> nativo (oculto) que
// es el que recibe el ref, el name y el onChange de react-hook-form: elegir una opción
// asigna su valor y dispara un evento 'change', así que todos los usos existentes
// (register(), value/onChange controlado) siguen funcionando sin cambios.
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, options, className = '', compact, disabled, id, onFocus, ...props },
    ref: ForwardedRef<HTMLSelectElement>,
  ) => {
    const { t } = useTranslation()
    const autoId = useId()
    const selectId = id ?? autoId
    const selectRef = useRef<HTMLSelectElement | null>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)
    const listRef = useRef<HTMLDivElement>(null)
    const searchRef = useRef<HTMLInputElement>(null)

    const [open, setOpen] = useState(false)
    const [rendered, setRendered] = useState(false)
    const [query, setQuery] = useState('')
    const [highlight, setHighlight] = useState(0)
    const [pos, setPos] = useState<{ left: number; width: number; top?: number; bottom?: number; maxH: number } | null>(null)
    // Valor actual: el del <select> oculto, que puede cambiar por register()/setValue sin re-render propio.
    const [current, setCurrent] = useState<string>(
      props.value != null ? String(props.value) : String(props.defaultValue ?? ''),
    )

    const setRefs = useCallback(
      (el: HTMLSelectElement | null) => {
        selectRef.current = el
        if (typeof ref === 'function') ref(el)
        else if (ref) (ref as { current: HTMLSelectElement | null }).current = el
      },
      [ref],
    )

    // Sincroniza con el valor real del <select> tras cada render (cubre reset/setValue de RHF).
    useEffect(() => {
      const v = props.value != null ? String(props.value) : (selectRef.current?.value ?? '')
      if (v !== current) setCurrent(v)
    })

    const selected = options.find((o) => o.value === current) ?? options[0]
    const searchable = options.length >= SEARCHABLE_FROM
    const visible = useMemo(() => {
      const q = norm(query.trim())
      return q ? options.filter((o) => norm(o.label).includes(q)) : options
    }, [options, query])

    function place() {
      const r = triggerRef.current?.getBoundingClientRect()
      if (!r) return
      const spaceBelow = window.innerHeight - r.bottom - 12
      const spaceAbove = r.top - 12
      const openUp = spaceBelow < 220 && spaceAbove > spaceBelow
      const maxH = Math.max(160, Math.min(320, openUp ? spaceAbove : spaceBelow))
      setPos(
        openUp
          ? { left: r.left, width: r.width, bottom: window.innerHeight - r.top + 4, maxH }
          : { left: r.left, width: r.width, top: r.bottom + 4, maxH },
      )
    }

    function openList() {
      if (disabled) return
      setQuery('')
      setHighlight(Math.max(0, options.findIndex((o) => o.value === current)))
      place()
      setRendered(true)
      setOpen(true)
    }
    function closeList(returnFocus = true) {
      setOpen(false)
      if (returnFocus) triggerRef.current?.focus()
      window.setTimeout(() => setRendered(false), 120)
    }

    function choose(value: string) {
      const el = selectRef.current
      if (el && el.value !== value) {
        el.value = value
        el.dispatchEvent(new Event('change', { bubbles: true }))
      }
      setCurrent(value)
      closeList()
    }

    // Cierra al hacer clic fuera, al redimensionar o al desplazar la página.
    useEffect(() => {
      if (!open) return
      const onDown = (e: MouseEvent | TouchEvent) => {
        const n = e.target as Node
        if (!triggerRef.current?.contains(n) && !listRef.current?.contains(n)) closeList(false)
      }
      const onScroll = (e: Event) => {
        if (listRef.current?.contains(e.target as Node)) return
        closeList(false)
      }
      document.addEventListener('mousedown', onDown)
      document.addEventListener('touchstart', onDown)
      window.addEventListener('resize', place)
      window.addEventListener('scroll', onScroll, true)
      return () => {
        document.removeEventListener('mousedown', onDown)
        document.removeEventListener('touchstart', onDown)
        window.removeEventListener('resize', place)
        window.removeEventListener('scroll', onScroll, true)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    useLayoutEffect(() => {
      if (open && searchable) searchRef.current?.focus()
    }, [open, searchable])

    // Mantiene visible la opción resaltada.
    useEffect(() => {
      if (!open) return
      listRef.current?.querySelector<HTMLElement>(`[data-idx="${highlight}"]`)?.scrollIntoView({ block: 'nearest' })
    }, [highlight, open, visible])

    function onKeyDown(e: KeyboardEvent) {
      if (!open) {
        if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
          e.preventDefault()
          openList()
        }
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        closeList()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHighlight((h) => Math.min(visible.length - 1, h + 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlight((h) => Math.max(0, h - 1))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const o = visible[highlight]
        if (o) choose(o.value)
      } else if (e.key === 'Tab') {
        closeList(false)
      }
    }

    return (
      <div>
        {label && (
          <label htmlFor={`${selectId}-trigger`} className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
            {label}
          </label>
        )}
        <div className={`relative ${className.includes("w-") ? className : `w-full ${className}`}`}>
          {/* <select> real, fuera de la vista: conserva ref/name/onChange/validación nativa. */}
          <select
            ref={setRefs}
            id={selectId}
            tabIndex={-1}
            aria-hidden="true"
            disabled={disabled}
            onFocus={(e) => {
              triggerRef.current?.focus()
              onFocus?.(e)
            }}
            className="pointer-events-none absolute h-px w-px opacity-0"
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            ref={triggerRef}
            id={`${selectId}-trigger`}
            type="button"
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={`${selectId}-list`}
            disabled={disabled}
            onClick={() => (open ? closeList() : openList())}
            onKeyDown={onKeyDown}
            className={`flex w-full items-center justify-between gap-2 rounded-md border bg-surface ${compact ? 'px-2 py-1' : 'px-3 py-2'} text-start text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 ${
              error ? 'border-line-scarlet' : 'border-slate-300 dark:border-slate-600'
            } ${current === '' ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'}`}
          >
            <span className="min-w-0 truncate">{selected?.label ?? ''}</span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-line-scarlet">{error}</p>}

        {rendered &&
          pos &&
          createPortal(
            <div
              ref={listRef}
              id={`${selectId}-list`}
              role="listbox"
              onClick={(e) => e.stopPropagation()}
              aria-label={label}
              style={{
                position: 'fixed',
                left: pos.left,
                width: pos.width,
                top: pos.top,
                bottom: pos.bottom,
                maxHeight: pos.maxH,
                transformOrigin: pos.top != null ? 'top' : 'bottom',
              }}
              className={`z-[70] flex flex-col overflow-hidden rounded-md border border-slate-200 bg-surface shadow-xl transition-[opacity,transform] duration-100 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none dark:border-slate-700 ${
                open ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
              }`}
            >
              {searchable && (
                <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2 dark:border-slate-700">
                  <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                  <input
                    ref={searchRef}
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value)
                      setHighlight(0)
                    }}
                    onKeyDown={onKeyDown}
                    placeholder={t('Buscar…')}
                    className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none focus-visible:outline-none dark:text-slate-100"
                  />
                </div>
              )}
              <div className="overflow-y-auto overscroll-contain py-1">
                {visible.length === 0 && (
                  <p className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400">{t('Sin resultados')}</p>
                )}
                {visible.map((o, i) => {
                  const isSel = o.value === current
                  return (
                    <button
                      key={o.value}
                      type="button"
                      role="option"
                      aria-selected={isSel}
                      data-idx={i}
                      onMouseEnter={() => setHighlight(i)}
                      onClick={() => choose(o.value)}
                      className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-start text-sm ${
                        i === highlight ? 'bg-brand-50 dark:bg-slate-800' : ''
                      } ${
                        isSel
                          ? 'font-semibold text-brand-700 dark:text-brand-500'
                          : o.value === ''
                            ? 'text-slate-500 dark:text-slate-400'
                            : 'text-slate-800 dark:text-slate-100'
                      }`}
                    >
                      <span className="min-w-0 truncate">{o.label}</span>
                      {isSel && <Check className="h-4 w-4 shrink-0" strokeWidth={2.4} aria-hidden="true" />}
                    </button>
                  )
                })}
              </div>
            </div>,
            document.body,
          )}
      </div>
    )
  },
)
Select.displayName = 'Select'
