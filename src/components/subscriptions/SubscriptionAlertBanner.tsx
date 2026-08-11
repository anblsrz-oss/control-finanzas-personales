import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAuth } from '@/store/useAuth'
import { useMoneyFormat } from '@/components/ui/Money'
import { useUnreadSubscriptionAlerts, useMarkSubscriptionAlertRead } from '@/hooks/useSubscriptions'

// Avisos de suscripciones sin leer (próximo cobro / cambio de precio). Vive
// en el AppShell junto a BudgetAlertBanner, por la misma razón: el cargo que
// dispara el aviso puede llegar solo por SMS/correo mientras el usuario está
// en cualquier otra pantalla.
export function SubscriptionAlertBanner() {
  const { t } = useTranslation()
  const { session } = useAuth()
  const userId = session?.user?.id
  const money = useMoneyFormat()
  const alertsQuery = useUnreadSubscriptionAlerts(userId)
  const markRead = useMarkSubscriptionAlertRead()

  const alerts = alertsQuery.data || []
  if (alerts.length === 0) return null

  return (
    <div className="mb-4 space-y-2">
      {alerts.map((alert) => {
        const isPriceChange = alert.kind === 'price_change'
        const name = alert.subscription?.name ?? t('tu suscripción')
        const icon = alert.subscription?.icon ?? '🔁'

        return (
          <div
            key={alert.id}
            className={`flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border p-3 text-sm ${
              isPriceChange
                ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200'
                : 'border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-800 dark:bg-teal-900/20 dark:text-teal-200'
            }`}
          >
            <span className="flex-1">
              <span aria-hidden>{isPriceChange ? '💸' : icon}</span>{' '}
              {isPriceChange
                ? t('{{name}} subió de {{old}} a {{new}}.', {
                    name,
                    old: money(alert.old_amount ?? 0, alert.currency),
                    new: money(alert.new_amount, alert.currency),
                  })
                : t('{{name}} te cobrará {{amount}} el {{date}}.', {
                    name,
                    amount: money(alert.new_amount, alert.currency),
                    date: alert.charge_date ?? '',
                  })}
            </span>
            <Link to="/suscripciones" className="font-medium underline underline-offset-2">
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
