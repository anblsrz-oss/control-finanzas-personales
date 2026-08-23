import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

// Reemplaza a los banners globales (BudgetAlertBanner/SubscriptionAlertBanner/
// CardPaymentAlertBanner, antes montados en AppShell sobre cada pantalla):
// un solo ícono con contador que lleva a /notificaciones. El total ya viene
// calculado en AppShell (suma de los tres useUnread*Count existentes) para no
// triplicar queries entre el header y esta campana.
export function NotificationBell({ count }: { count: number }) {
  const { t } = useTranslation()
  return (
    <NavLink
      to="/notificaciones"
      title={t('Notificaciones')}
      aria-label={t('Notificaciones')}
      className="relative rounded-lg p-2 text-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
    >
      🔔
      {count > 0 && (
        <span className="absolute right-0.5 top-0.5 inline-flex min-w-[1.1rem] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-semibold leading-4 text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </NavLink>
  )
}
