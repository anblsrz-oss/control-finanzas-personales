import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { formatMoney } from '@/lib/format'
import type { CategoryRow } from '@/types/db'

export interface LineDraft {
  concept: string
  amount: number
  categoryId?: string
}

interface TransactionLinesFieldsProps {
  lines: LineDraft[]
  onChange: (index: number, patch: Partial<LineDraft>) => void
  onAdd: () => void
  onRemove: (index: number) => void
  categories: CategoryRow[]
  currency: string
  totalAmount: number
}

// Presentacional, sin acoplarse a react-hook-form: lo usan tanto
// TransactionForm.tsx (con useFieldArray de RHF por encima) como
// ReceiptPage.tsx (con useState simple, igual que ya hace con
// statementRows) — cada uno maneja su propio estado y le pasa lines/onChange.
export function TransactionLinesFields({
  lines,
  onChange,
  onAdd,
  onRemove,
  categories,
  currency,
  totalAmount,
}: TransactionLinesFieldsProps) {
  const { t } = useTranslation()
  const linesTotal = lines.reduce((sum, l) => sum + (Number(l.amount) || 0), 0)
  const remaining = Math.round(((Number(totalAmount) || 0) - linesTotal) * 100) / 100
  const matches = Math.abs(remaining) < 0.01

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {t('Detalle (opcional)')}
        </p>
        <Button type="button" size="sm" variant="ghost" onClick={onAdd}>
          + {t('Agregar línea')}
        </Button>
      </div>

      {lines.length > 0 && (
        <div className="space-y-2">
          {lines.map((line, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <Input
                className="min-w-0 flex-1"
                placeholder={t('Concepto')}
                value={line.concept}
                onChange={(e) => onChange(i, { concept: e.target.value })}
              />
              <Input
                className="w-24"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={line.amount || ''}
                onChange={(e) => onChange(i, { amount: Number(e.target.value) || 0 })}
              />
              <Select
                className="w-40"
                value={line.categoryId ?? ''}
                onChange={(e) => onChange(i, { categoryId: e.target.value })}
                options={[
                  { value: '', label: t('Sin categoría') },
                  ...categories.map((c) => ({
                    value: c.id,
                    label: `${c.icon ? `${c.icon} ` : ''}${c.name}`,
                  })),
                ]}
              />
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="text-slate-400 hover:text-red-500"
                aria-label={t('Quitar línea')}
                title={t('Quitar línea')}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {lines.length > 0 && (
        <p
          className={`text-xs font-medium ${
            matches ? 'text-green-600' : remaining > 0 ? 'text-amber-600' : 'text-red-600'
          }`}
        >
          {matches
            ? t('La suma cuadra con el total.')
            : remaining > 0
              ? t('Restan {{amount}} por asignar', { amount: formatMoney(remaining, currency) })
              : t('Te pasaste por {{amount}}', {
                  amount: formatMoney(Math.abs(remaining), currency),
                })}
        </p>
      )}
    </div>
  )
}
