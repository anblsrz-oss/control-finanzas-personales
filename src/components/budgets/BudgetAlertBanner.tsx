import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAuth } from '@/store/useAuth'
import { useMoneyFormat } from '@/components/ui/Money'
import { useUnreadBudgetAlerts, useMarkBudgetAlertRead } from '@/hooks/useBudgets'
import { GENERAL_BUDGET_LABEL } from '@/lib/budgets'

// Avisos de presupuesto sin leer. Vive en el AppShell para que aparezca sin
// importar en qué pantalla estaba el usuario cuando cruzó el umbral: el gasto
// puede registrarse desde Movimientos, desde el escáner de recibos o llegar
// solo por SMS/correo.
//
// No calcula nada: los avisos ya vienen decididos por record_budget_alerts, con
// los montos congelados al momento en que se cruzó el umbral.
export function BudgetAlertBanner() {
  const { t } = useTranslation()
  const { session } = useAuth()
  const userId = session?.user?.id
  const money = useMoneyFormat()
  const alertsQuery = useUnreadBudgetAlerts(userId)
  const markRead = useMarkBudgetAlertRead()

  const alerts = alertsQuery.data || []
  if (alerts.length === 0) return null

  return (
    <div className="mb-4 space-y-2">
      {alerts.map((alert) => {
        const isOver = alert.level === 'over'
        const name =
          alert.budget?.category_id === null
            ? t(GENERAL_BUDGET_LABEL)
            : (alert.budget?.category?.name ?? t('tu presupuesto'))

        return (
          <div
            key={alert.id}
            className={`flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border p-3 text-sm ${
              isOver
                ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200'
                : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200'
            }`}
          >
            <span className="flex-1">
              <span aria-hidden>{isOver ? '🚨' : '🎯'}</span>{' '}
              {isOver
                ? t('Excediste tu presupuesto de {{name}}: llevas {{spent}} de {{amount}}.', {
                    name,
                    spent: money(alert.spent, undefined),
                    amount: money(alert.amount, undefined),
                  })
                : t('Llevas {{percent}}% de tu presupuesto de {{name}} ({{spent}} de {{amount}}).', {
                    percent: Math.round(alert.percent),
                    name,
                    spent: money(alert.spent, undefined),
                    amount: money(alert.amount, undefined),
                  })}
            </span>
            <Link
              to="/presupuestos"
              className="font-medium underline underline-offset-2"
            >
              {t('Ver')}
            </Link>
            <button
              type="button"
              onClick={() => markRead.mutate({ id: alert.id, userId: userId! })}
              className="font-medium underline underline-offset-2"
            >
              {t('Entendido')}
            </button>
          </div>
        )
      })}
    </div>
  )
}
