import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAuth } from '@/store/useAuth'
import { useMoneyFormat } from '@/components/ui/Money'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { GENERAL_BUDGET_LABEL } from '@/lib/budgets'
import { useUnreadBudgetAlerts, useMarkBudgetAlertRead } from '@/hooks/useBudgets'
import { useUnreadSubscriptionAlerts, useMarkSubscriptionAlertRead } from '@/hooks/useSubscriptions'
import {
  useUnreadCardPaymentAlerts,
  useMarkCardPaymentAlertRead,
  type CardPaymentAlertWithLabel,
} from '@/hooks/useCardPaymentAlerts'

// Página dedicada de notificaciones: reemplaza los banners globales que vivían
// en AppShell (BudgetAlertBanner/SubscriptionAlertBanner/CardPaymentAlertBanner)
// por una sola sección a la que se llega desde la campana del header. Reutiliza
// los mismos hooks de "no leídos" y "marcar leído" que usaban los banners —
// el estado de lectura ya persiste en el backend, aquí solo cambia dónde se
// muestra.
function NotificationRow({
  icon,
  message,
  viewTo,
  tone,
  onMarkRead,
}: {
  icon: string
  message: ReactNode
  viewTo: string
  tone: 'amber' | 'red' | 'teal'
  onMarkRead: () => void
}) {
  const { t } = useTranslation()
  const toneClass = {
    amber:
      'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200',
    red: 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200',
    teal: 'border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-800 dark:bg-teal-900/20 dark:text-teal-200',
  }[tone]

  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border p-3 text-sm ${toneClass}`}
    >
      <span className="flex-1">
        <span aria-hidden>{icon}</span> {message}
      </span>
      <Link to={viewTo} className="font-medium underline underline-offset-2">
        {t('Ver')}
      </Link>
      <button type="button" onClick={onMarkRead} className="font-medium underline underline-offset-2">
        {t('Entendido')}
      </button>
    </div>
  )
}

function cardAlertLabel(alert: CardPaymentAlertWithLabel, t: (key: string) => string): string {
  return (
    alert.installment_plan?.description ||
    alert.credit_line?.name ||
    alert.card?.name ||
    t('tu tarjeta')
  )
}

export function NotificationsPage() {
  const { t } = useTranslation()
  const { session } = useAuth()
  const userId = session?.user?.id
  const money = useMoneyFormat()

  const budgetAlertsQuery = useUnreadBudgetAlerts(userId)
  const markBudgetRead = useMarkBudgetAlertRead()
  const subscriptionAlertsQuery = useUnreadSubscriptionAlerts(userId)
  const markSubscriptionRead = useMarkSubscriptionAlertRead()
  const cardAlertsQuery = useUnreadCardPaymentAlerts(userId)
  const markCardRead = useMarkCardPaymentAlertRead()

  const budgetAlerts = budgetAlertsQuery.data || []
  const subscriptionAlerts = subscriptionAlertsQuery.data || []
  const cardAlerts = cardAlertsQuery.data || []
  const total = budgetAlerts.length + subscriptionAlerts.length + cardAlerts.length
  const loading =
    budgetAlertsQuery.isLoading || subscriptionAlertsQuery.isLoading || cardAlertsQuery.isLoading

  return (
    <div>
      <PageHeader title={t('Notificaciones')} subtitle={t('Avisos pendientes de presupuestos, suscripciones y pagos de tarjeta.')} />

      {!loading && total === 0 && (
        <Card>
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            {t('No tienes notificaciones pendientes.')}
          </p>
        </Card>
      )}

      <div className="space-y-4">
        {cardAlerts.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              {t('Pagos de tarjeta')}
            </h2>
            {cardAlerts.map((alert) => {
              const isMsi = alert.kind === 'msi_due'
              const label = cardAlertLabel(alert, t)
              return (
                <NotificationRow
                  key={alert.id}
                  icon="💳"
                  tone="amber"
                  viewTo="/tarjetas"
                  onMarkRead={() => markCardRead.mutate({ id: alert.id, userId: userId! })}
                  message={
                    isMsi
                      ? t('Mensualidad de {{name}}{{amount}} vence el {{date}}.', {
                          name: label,
                          amount: alert.amount != null ? ` (${money(alert.amount, alert.currency)})` : '',
                          date: alert.due_date,
                        })
                      : t('El pago de {{name}}{{amount}} vence el {{date}}.', {
                          name: label,
                          amount: alert.amount != null ? ` (${money(alert.amount, alert.currency)})` : '',
                          date: alert.due_date,
                        })
                  }
                />
              )
            })}
          </div>
        )}

        {subscriptionAlerts.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              {t('Suscripciones')}
            </h2>
            {subscriptionAlerts.map((alert) => {
              const isPriceChange = alert.kind === 'price_change'
              const name = alert.subscription?.name ?? t('tu suscripción')
              return (
                <NotificationRow
                  key={alert.id}
                  icon={isPriceChange ? '💸' : (alert.subscription?.icon ?? '🔁')}
                  tone={isPriceChange ? 'red' : 'teal'}
                  viewTo="/suscripciones"
                  onMarkRead={() => markSubscriptionRead.mutate({ id: alert.id, userId: userId! })}
                  message={
                    isPriceChange
                      ? t('{{name}} subió de {{old}} a {{new}}.', {
                          name,
                          old: money(alert.old_amount ?? 0, alert.currency),
                          new: money(alert.new_amount, alert.currency),
                        })
                      : t('{{name}} te cobrará {{amount}} el {{date}}.', {
                          name,
                          amount: money(alert.new_amount, alert.currency),
                          date: alert.charge_date ?? '',
                        })
                  }
                />
              )
            })}
          </div>
        )}

        {budgetAlerts.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              {t('Presupuestos')}
            </h2>
            {budgetAlerts.map((alert) => {
              const isOver = alert.level === 'over'
              const name =
                alert.budget?.category_id === null
                  ? t(GENERAL_BUDGET_LABEL)
                  : (alert.budget?.category?.name ?? t('tu presupuesto'))
              return (
                <NotificationRow
                  key={alert.id}
                  icon={isOver ? '🚨' : '🎯'}
                  tone={isOver ? 'red' : 'amber'}
                  viewTo="/presupuestos"
                  onMarkRead={() => markBudgetRead.mutate({ id: alert.id, userId: userId! })}
                  message={
                    isOver
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
                        })
                  }
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
