import { NavLink } from 'react-router-dom'
import { Bell } from 'lucide-react'
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
      className="relative rounded-md p-1.5 text-slate-600 dark:text-slate-300 transition-colors sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
    >
      <Bell className="h-5 w-5" aria-hidden="true" />
      {count > 0 && (
        <span className="absolute right-0.5 top-0.5 inline-flex min-w-[1.1rem] items-center justify-center rounded-full bg-line-amber px-1 text-[10px] font-semibold leading-4 text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </NavLink>
  )
}
