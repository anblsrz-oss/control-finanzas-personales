import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/store/useAuth'
import { useSettings } from '@/store/useSettings'
import { useAppConfig } from '@/hooks/useAppConfig'
import { usePendingCount } from '@/hooks/useTransactions'
import { useUnreadBudgetAlertsCount } from '@/hooks/useBudgets'
import { BudgetAlertBanner } from '@/components/budgets/BudgetAlertBanner'
import { BudgetAlertWatcher } from '@/components/budgets/BudgetAlertWatcher'
import { APK_URL } from '@/lib/appUpdate'
import { isNative } from '@/lib/nativeAuth'

interface NavItem {
  to: string
  label: string
  icon: string
}

const NAV: NavItem[] = [
  { to: '/', label: 'Resumen', icon: '📊' },
  { to: '/cuentas', label: 'Cuentas', icon: '🏦' },
  { to: '/tarjetas', label: 'Tarjetas', icon: '💳' },
  { to: '/lineas-credito', label: 'Líneas de crédito', icon: '💠' },
  { to: '/transacciones', label: 'Transacciones', icon: '💸' },
  { to: '/presupuestos', label: 'Presupuestos', icon: '🎯' },
  { to: '/importar', label: 'Importar', icon: '📥' },
  { to: '/recibos', label: 'Escanear recibo', icon: '🧾' },
  { to: '/familia', label: 'Familia', icon: '👨‍👩‍👧‍👦' },
  { to: '/correo', label: 'Sincronizar correo', icon: '📧' },
  { to: '/sms', label: 'Sincronizar SMS', icon: '📱' },
  { to: '/conectar', label: 'Conexión automática', icon: '🔗' },
  { to: '/categorias', label: 'Categorías', icon: '🏷️' },
  { to: '/rendimientos', label: 'Rendimientos', icon: '📈' },
  { to: '/reportes', label: 'Reportes', icon: '📑' },
  { to: '/configuracion', label: 'Configuración', icon: '⚙️' },
]

// Accesos principales para la barra inferior en móvil.
const MOBILE_NAV: NavItem[] = [
  { to: '/', label: 'Resumen', icon: '📊' },
  { to: '/cuentas', label: 'Cuentas', icon: '🏦' },
  { to: '/transacciones', label: 'Movs.', icon: '💸' },
  { to: '/reportes', label: 'Reportes', icon: '📑' },
]

// Resto de secciones, accesibles desde el menú "Más" en móvil.
const MORE_NAV: NavItem[] = [
  { to: '/presupuestos', label: 'Presup.', icon: '🎯' },
  { to: '/tarjetas', label: 'Tarjetas', icon: '💳' },
  { to: '/lineas-credito', label: 'Crédito', icon: '💠' },
  { to: '/recibos', label: 'Recibos', icon: '🧾' },
  { to: '/familia', label: 'Familia', icon: '👨‍👩‍👧‍👦' },
  { to: '/importar', label: 'Importar', icon: '📥' },
  { to: '/categorias', label: 'Categorías', icon: '🏷️' },
  { to: '/correo', label: 'Correo', icon: '📧' },
  { to: '/sms', label: 'SMS', icon: '📱' },
  { to: '/conectar', label: 'Conectar', icon: '🔗' },
  { to: '/rendimientos', label: 'Rendim.', icon: '📈' },
  { to: '/configuracion', label: 'Ajustes', icon: '⚙️' },
]

// Insignia con un conteo (movimientos por revisar, avisos de presupuesto).
function PendingBadge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <span className="ml-auto inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-amber-500 px-1.5 text-[11px] font-semibold leading-5 text-white">
      {count > 99 ? '99+' : count}
    </span>
  )
}

const DEFAULT_APP_TITLE = 'Mi Control de Finanzas Personales'

// Logo de la marca: imagen subida por el admin, o el emoji 💰 por defecto.
function BrandLogo({ logoUrl }: { logoUrl: string | null | undefined }) {
  if (logoUrl) {
    return <img src={logoUrl} alt="" className="h-6 w-6 shrink-0 rounded object-cover" />
  }
  return <span className="text-xl">💰</span>
}

export function AppShell() {
  const { t } = useTranslation()
  const { profile, session } = useAuth()
  const { data: appConfig } = useAppConfig()
  const appTitle = appConfig?.app_title || DEFAULT_APP_TITLE
  const pendingCount = usePendingCount(session?.user?.id).data ?? 0
  const budgetAlertCount = useUnreadBudgetAlertsCount(session?.user?.id).data ?? 0
  const hideAmounts = useSettings((s) => s.hideAmounts)
  const toggleHideAmounts = useSettings((s) => s.toggleHideAmounts)
  const [moreOpen, setMoreOpen] = useState(false)
  const [sheetRendered, setSheetRendered] = useState(false)
  const [sheetVisible, setSheetVisible] = useState(false)

  useEffect(() => {
    if (moreOpen) {
      setSheetRendered(true)
      const raf = requestAnimationFrame(() => setSheetVisible(true))
      return () => cancelAnimationFrame(raf)
    }
    setSheetVisible(false)
    const timeout = setTimeout(() => setSheetRendered(false), 220)
    return () => clearTimeout(timeout)
  }, [moreOpen])
  const location = useLocation()

  // Cierra el menú "Más" al navegar a otra ruta.
  useEffect(() => {
    setMoreOpen(false)
  }, [location.pathname])

  const moreNav: NavItem[] = profile?.is_admin
    ? [...MORE_NAV, { to: '/admin', label: 'Admin', icon: '🛠️' }]
    : MORE_NAV

  const moreActive = moreNav.some((item) =>
    location.pathname.startsWith(item.to),
  )

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Sidebar */}
      <aside className="hidden w-60 flex-col border-r border-slate-200 dark:border-slate-700 bg-surface md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 dark:border-slate-700 px-5">
          <BrandLogo logoUrl={appConfig?.logo_url} />
          <span className="font-semibold text-slate-800 dark:text-slate-100">{appTitle}</span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-800/40 text-brand-700 dark:text-brand-500'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`
              }
            >
              <span>{item.icon}</span>
              {t(item.label)}
              {item.to === '/transacciones' && <PendingBadge count={pendingCount} />}
              {item.to === '/presupuestos' && <PendingBadge count={budgetAlertCount} />}
            </NavLink>
          ))}
          {profile?.is_admin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-800/40 text-brand-700 dark:text-brand-500'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`
              }
            >
              <span>🛠️</span>
              Admin
            </NavLink>
          )}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        {/* Topbar */}
        <header className="safe-top flex items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-surface px-6 py-3">
          <div className="flex items-center gap-2 md:hidden">
            <BrandLogo logoUrl={appConfig?.logo_url} />
            <span className="font-semibold text-slate-800 dark:text-slate-100">{appTitle}</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {profile?.is_premium && (
              <span className="rounded-full bg-amber-100 dark:bg-amber-900/40 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                Premium
              </span>
            )}
            <span className="hidden text-sm text-slate-600 dark:text-slate-300 sm:inline">
              {profile?.full_name ?? profile?.email ?? t('Usuario')}
            </span>
            <button
              type="button"
              onClick={toggleHideAmounts}
              title={hideAmounts ? t('Mostrar montos') : t('Ocultar montos')}
              aria-label={hideAmounts ? t('Mostrar montos') : t('Ocultar montos')}
              className="rounded-lg p-2 text-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              {hideAmounts ? '🙈' : '👁️'}
            </button>
            <NavLink
              to="/configuracion"
              title={t('Configuración')}
              className="rounded-lg p-2 text-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              ⚙️
            </NavLink>
          </div>
        </header>

        {/* pb-nav deja hueco para la barra inferior fija + área segura */}
        <main className="pb-nav flex-1 p-4 md:p-6">
          {/* El aviso de presupuesto va aquí y no en una pantalla concreta: el
              gasto que cruza el umbral puede registrarse desde Movimientos,
              desde el escáner de recibos o llegar solo por SMS/correo. */}
          <BudgetAlertWatcher />
          <BudgetAlertBanner />
          <Outlet />
        </main>
      </div>

      {/* Hoja "Más" (solo móvil) */}
      {sheetRendered && (
        <div
          className={`fixed inset-0 z-30 bg-black/40 transition-opacity duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] md:hidden ${
            sheetVisible ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMoreOpen(false)}
        >
          <div
            className={`safe-bottom fixed inset-x-0 bottom-0 z-40 rounded-t-2xl bg-surface p-4 pb-6 shadow-xl transition-transform duration-[280ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-opacity motion-reduce:duration-200 ${
              sheetVisible ? 'translate-y-0' : 'translate-y-full'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
              {t('Más opciones')}
            </p>
            <div className="grid grid-cols-4 gap-3">
              {moreNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-center text-[11px] font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-50 dark:bg-brand-800/40 text-brand-700 dark:text-brand-500'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`
                  }
                >
                  <span className="text-2xl">{item.icon}</span>
                  {t(item.label)}
                </NavLink>
              ))}
              {/* Enlace externo, no una ruta: va aparte de moreNav. Dentro del
                  APK se omite porque la app ya está instalada. */}
              {!isNative() && (
                <a
                  href={APK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMoreOpen(false)}
                  className="flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-center text-[11px] font-medium text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <span className="text-2xl">⬇️</span>
                  {t('Descargar')}
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Barra de navegación inferior (solo móvil) */}
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-slate-200 dark:border-slate-700 bg-surface md:hidden">
        {MOBILE_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors ${
                isActive ? 'text-brand-700 dark:text-brand-500' : 'text-slate-500 dark:text-slate-400'
              }`
            }
          >
            <span className="relative text-lg">
              {item.icon}
              {item.to === '/transacciones' && pendingCount > 0 && (
                <span className="absolute -right-2 -top-1 inline-flex min-w-[1rem] items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-semibold leading-4 text-white">
                  {pendingCount > 99 ? '99+' : pendingCount}
                </span>
              )}
            </span>
            {t(item.label)}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors ${
            moreActive || moreOpen ? 'text-brand-700 dark:text-brand-500' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <span className="relative text-lg">
            ⋯
            {/* Presupuestos vive dentro de "Más" en móvil: sin este punto, un
                aviso pendiente quedaría invisible hasta abrir la hoja. */}
            {budgetAlertCount > 0 && (
              <span className="absolute -right-1.5 -top-0.5 h-2 w-2 rounded-full bg-amber-500" />
            )}
          </span>
          {t('Más')}
        </button>
      </nav>
    </div>
  )
}
