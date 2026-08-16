import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAuth } from '@/store/useAuth'
import { useMoneyFormat } from '@/components/ui/Money'
import {
  useUnreadCardPaymentAlerts,
  useMarkCardPaymentAlertRead,
  type CardPaymentAlertWithLabel,
} from '@/hooks/useCardPaymentAlerts'

function labelFor(alert: CardPaymentAlertWithLabel, t: (key: string) => string): string {
  return (
    alert.installment_plan?.description ||
    alert.credit_line?.name ||
    alert.card?.name ||
    t('tu tarjeta')
  )
}

// Avisos de pago de tarjeta/MSI sin leer. Vive en el AppShell junto a
// BudgetAlertBanner/SubscriptionAlertBanner, por la misma razón: la fecha de
// pago se acerca sin que el usuario haga nada, puede estar en cualquier
// pantalla cuando corresponde avisarle.
export function CardPaymentAlertBanner() {
  const { t } = useTranslation()
  const { session } = useAuth()
  const userId = session?.user?.id
  const money = useMoneyFormat()
  const alertsQuery = useUnreadCardPaymentAlerts(userId)
  const markRead = useMarkCardPaymentAlertRead()

  const alerts = alertsQuery.data || []
  if (alerts.length === 0) return null

  return (
    <div className="mb-4 space-y-2">
      {alerts.map((alert) => {
        const isMsi = alert.kind === 'msi_due'
        const label = labelFor(alert, t)

        return (
          <div
            key={alert.id}
            className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200"
          >
            <span className="flex-1">
              <span aria-hidden>💳</span>{' '}
              {isMsi
                ? t('Mensualidad de {{name}}{{amount}} vence el {{date}}.', {
                    name: label,
                    amount: alert.amount != null ? ` (${money(alert.amount, alert.currency)})` : '',
                    date: alert.due_date,
                  })
                : t('El pago de {{name}}{{amount}} vence el {{date}}.', {
                    name: label,
                    amount: alert.amount != null ? ` (${money(alert.amount, alert.currency)})` : '',
                    date: alert.due_date,
                  })}
            </span>
            <Link to="/tarjetas" className="font-medium underline underline-offset-2">
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
