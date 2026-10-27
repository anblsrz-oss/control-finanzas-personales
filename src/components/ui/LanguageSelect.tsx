import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Emoji } from '@/components/ui/Emoji'
import { LANGUAGES, langInfo, type Lang } from '@/i18n/languages'

interface LanguageSelectProps {
  value: string
  onChange: (lang: Lang) => void
  /** 'dark' para cabeceras sobre fondo oscuro (landing). */
  tone?: 'default' | 'dark'
}

// Selector de idioma: bandera + nombre del idioma en su propio idioma (sin traducir).
export function LanguageSelect({ value, onChange, tone = 'default' }: LanguageSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = langInfo(value)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open])

  const trigger =
    tone === 'dark'
      ? 'border-white/25 bg-white/10 text-white hover:bg-white/20'
      : 'border-slate-300 dark:border-slate-600 bg-surface text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'

  return (
    <div ref={ref} className="relative inline-block text-sm">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-medium transition-colors ${trigger}`}
      >
        <Emoji emoji={current.flag} />
        <span>{current.native}</span>
        <ChevronDown className="h-4 w-4 opacity-70" aria-hidden="true" />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute end-0 z-50 mt-1 max-h-80 w-48 overflow-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-surface p-1 text-slate-700 dark:text-slate-200 shadow-lg"
        >
          {LANGUAGES.map((l) => (
            <li key={l.code} role="option" aria-selected={l.code === current.code}>
              <button
                type="button"
                lang={l.code}
                onClick={() => {
                  setOpen(false)
                  onChange(l.code)
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-start ${
                  l.code === current.code
                    ? 'bg-brand-50 dark:bg-brand-800/40 font-semibold text-brand-700 dark:text-brand-500'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Emoji emoji={l.flag} />
                {l.native}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
