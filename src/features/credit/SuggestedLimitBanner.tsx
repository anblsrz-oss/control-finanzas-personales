import { TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useUpdateCreditLine } from '@/hooks/useCreditLines'
import { formatMoney } from '@/lib/format'
import { Button } from '@/components/ui/Button'
import type { CreditLineRow } from '@/types/db'

// El banco avisó que subió el límite ("aumentamos tu límite de crédito a
// $X"): la captura lo deja como sugerencia en vez de registrarlo como gasto.
export function SuggestedLimitBanner({ line, userId }: { line: CreditLineRow; userId: string }) {
  const { t } = useTranslation()
  const update = useUpdateCreditLine()
  if (line.suggested_limit == null) return null

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line-green/30 bg-line-green/10 p-3">
      <p className="text-sm text-slate-700 dark:text-slate-200">
        <TrendingUp className="me-1.5 inline h-4 w-4 align-[-2px] text-line-green" aria-hidden="true" />
        {t('{{name}} subió tu límite a {{amount}}. ¿Lo actualizo?', {
          name: line.name,
          amount: formatMoney(line.suggested_limit, line.currency),
        })}
      </p>
      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={update.isPending}
          onClick={() =>
            update.mutate({ id: line.id, userId, credit_limit: line.suggested_limit!, suggested_limit: null })
          }
        >
          {t('Aplicar')}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={update.isPending}
          onClick={() => update.mutate({ id: line.id, userId, suggested_limit: null })}
        >
          {t('Descartar')}
        </Button>
      </div>
    </div>
  )
}
