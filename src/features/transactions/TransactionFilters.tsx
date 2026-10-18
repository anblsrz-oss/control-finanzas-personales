import { useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { MultiSelect } from '@/components/ui/MultiSelect'
import { PeriodSelector } from '@/components/ui/PeriodSelector'
import { CURRENCY_LABELS } from '@/lib/format'
import type { AccountRow, CardRow, CategoryRow, CreditLineRow, TxKind } from '@/types/db'

// Estado crudo del formulario. Los montos viven como string porque un input
// vacío no es 0: "" significa "sin filtro" y 0 es un filtro legítimo.
export interface FilterState {
  startDate: string
  endDate: string
  cardIds: string[]
  creditLineIds: string[]
  accountIds: string[]
  categoryIds: string[]
  kinds: TxKind[]
  status: '' | 'pending' | 'settled'
  currencies: string[]
  minAmount: string
  maxAmount: string
  search: string
}

export const EMPTY_FILTERS: FilterState = {
  startDate: '',
  endDate: '',
  cardIds: [],
  creditLineIds: [],
  accountIds: [],
  categoryIds: [],
  kinds: [],
  status: '',
  currencies: [],
  minAmount: '',
  maxAmount: '',
  search: '',
}

export function countActiveFilters(f: FilterState): number {
  let n = 0
  if (f.startDate) n++
  if (f.endDate) n++
  if (f.cardIds.length) n++
  if (f.creditLineIds.length) n++
  if (f.accountIds.length) n++
  if (f.categoryIds.length) n++
  if (f.kinds.length) n++
  if (f.status) n++
  if (f.currencies.length) n++
  if (f.minAmount) n++
  if (f.maxAmount) n++
  if (f.search.trim()) n++
  return n
}

interface TransactionFiltersProps {
  value: FilterState
  onChange: (next: FilterState) => void
  accounts: AccountRow[]
  cards: CardRow[]
  creditLines: CreditLineRow[]
  categories: CategoryRow[]
  /** Monedas que se ofrecen en el filtro de moneda. */
  currencyOptions: string[]
  /** Cuántas transacciones está mostrando la lista con estos filtros. */
  resultCount: number
  /** Si puede usar el selector de periodo (Hoy/Semana/Mes/Personalizado) o solo Desde/Hasta crudos. */
  canUsePeriodFilter: boolean
  /** Movimientos pendientes de confirmar (total, sin importar los filtros). */
  pendingCount: number
}

export function TransactionFilters({
  value,
  onChange,
  accounts,
  cards,
  creditLines,
  categories,
  currencyOptions,
  resultCount,
  canUsePeriodFilter,
  pendingCount,
}: TransactionFiltersProps) {
  const { t } = useTranslation()
  const active = countActiveFilters(value)
  // Colapsado por defecto: en móvil el panel completo empujaría la lista
  // fuera de pantalla.
  const [open, setOpen] = useState(false)

  const set = <K extends keyof FilterState>(key: K, v: FilterState[K]) =>
    onChange({ ...value, [key]: v })

  const chips: { id: FilterState['status']; label: string; count?: number }[] = [
    { id: '', label: t('Todas') },
    { id: 'pending', label: t('Pendientes'), count: pendingCount },
    { id: 'settled', label: t('Confirmadas') },
  ]

  return (
    <>
      {/* Filtro rápido: siempre visible, sin abrir el panel de filtros. */}
      <div role="group" aria-label={t('Estado')} className="mb-3 flex flex-wrap gap-2">
        {chips.map((c) => {
          const selected = value.status === c.id
          return (
            <button
              key={c.id || 'all'}
              type="button"
              aria-pressed={selected}
              onClick={() => set('status', c.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                selected
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-slate-300 bg-surface text-slate-700 hover:border-brand-600 dark:border-slate-600 dark:text-slate-200'
              }`}
            >
              {c.label}
              {c.count != null && c.count > 0 && (
                <span
                  className={`min-w-[1.25rem] rounded-full px-1.5 text-center text-xs font-bold leading-5 ${
                    selected ? 'bg-white/25 text-white' : 'bg-line-amber text-white'
                  }`}
                >
                  {c.count > 99 ? '99+' : c.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

    <Card className="mb-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
          aria-expanded={open}
        >
          <span className="inline-flex items-center gap-1.5"><Search className="h-4 w-4" aria-hidden="true" /> {t('Filtros')}</span>
          {active > 0 && (
            <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs font-medium text-white">
              {active}
            </span>
          )}
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {t('{{count}} transacciones', { count: resultCount })}
          </span>
          {active > 0 && (
            <button
              type="button"
              onClick={() => onChange(EMPTY_FILTERS)}
              className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
            >
              {t('Limpiar filtros')}
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {canUsePeriodFilter ? (
            <PeriodSelector
              startDate={value.startDate}
              endDate={value.endDate}
              onChange={(range) => onChange({ ...value, ...range })}
            />
          ) : (
            <>
              <Input
                label={t('Desde')}
                type="date"
                value={value.startDate}
                onChange={(e) => set('startDate', e.target.value)}
              />
              <Input
                label={t('Hasta')}
                type="date"
                value={value.endDate}
                onChange={(e) => set('endDate', e.target.value)}
              />
            </>
          )}
          <Input
            label={t('Buscar')}
            type="search"
            placeholder={t('Concepto o nota…')}
            value={value.search}
            onChange={(e) => set('search', e.target.value)}
          />

          <MultiSelect
            label={t('Tarjeta')}
            options={cards.map((c) => ({ value: c.id, label: c.name }))}
            value={value.cardIds}
            onChange={(v) => set('cardIds', v)}
          />
          <MultiSelect
            label={t('Línea de crédito')}
            options={creditLines.map((l) => ({ value: l.id, label: l.name }))}
            value={value.creditLineIds}
            onChange={(v) => set('creditLineIds', v)}
          />
          <MultiSelect
            label={t('Cuenta')}
            options={accounts.map((a) => ({ value: a.id, label: a.name }))}
            value={value.accountIds}
            onChange={(v) => set('accountIds', v)}
          />
          <MultiSelect
            label={t('Categoría')}
            options={categories.map((c) => ({
              value: c.id,
              label: `${c.icon || ''} ${t(c.name)}`.trim(),
            }))}
            value={value.categoryIds}
            onChange={(v) => set('categoryIds', v)}
          />

          <MultiSelect
            label={t('Tipo')}
            placeholder={t('Todos')}
            value={value.kinds}
            onChange={(v) => set('kinds', v as TxKind[])}
            options={[
              { value: 'income', label: t('Ingreso') },
              { value: 'expense', label: t('Egreso') },
              { value: 'transfer', label: t('Transferencia') },
              { value: 'card_payment', label: t('Pago de tarjeta') },
              { value: 'refund', label: t('Reembolso') },
            ]}
          />
          <Select
            label={t('Estado')}
            value={value.status}
            onChange={(e) => set('status', e.target.value as FilterState['status'])}
            options={[
              { value: '', label: t('Todos') },
              { value: 'pending', label: t('Pendientes') },
              { value: 'settled', label: t('Conciliadas') },
            ]}
          />
          {currencyOptions.length > 1 && (
            <MultiSelect
              label={t('Moneda')}
              value={value.currencies}
              onChange={(v) => set('currencies', v)}
              options={[
                ...currencyOptions.map((c) => ({
                  value: c,
                  label: CURRENCY_LABELS[c] ? `${c} — ${CURRENCY_LABELS[c]}` : c,
                })),
              ]}
            />
          )}
          <div className="grid grid-cols-2 gap-2">
            <Input
              label={t('Monto mín.')}
              type="number"
              inputMode="decimal"
              value={value.minAmount}
              onChange={(e) => set('minAmount', e.target.value)}
            />
            <Input
              label={t('Monto máx.')}
              type="number"
              inputMode="decimal"
              value={value.maxAmount}
              onChange={(e) => set('maxAmount', e.target.value)}
            />
          </div>
        </div>
      )}
    </Card>
    </>
  )
}
