import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/store/useAuth'
import { useSettings, type ThemePref, type LanguagePref } from '@/store/useSettings'
import { useMyFamilies, useMyInvitations } from '@/hooks/useFamily'
import { useStartCheckout, useOpenBillingPortal } from '@/hooks/useBilling'
import {
  useUpdateMainCurrency,
  useUpdateBudgetAlertThreshold,
  useUpdateBudgetAlertsEmail,
  useUpdateCalendarSubscriptionReminders,
  useUpdateCalendarCardPaymentReminders,
} from '@/hooks/useProfile'
import { EMAIL_SYNC_PROVIDER_KEY, getProviderToken, getProviderRefreshToken } from '@/hooks/useEmailSync'
import {
  connectGoogleCalendar,
  useGoogleCalendarConnection,
  useEnableGoogleCalendar,
  useDisconnectGoogleCalendar,
} from '@/hooks/useGoogleCalendar'
import { DEFAULT_ALERT_THRESHOLD } from '@/lib/budgets'
import { useEntitlements } from '@/hooks/useAppConfig'
import { CURRENCIES } from '@/lib/format'
import { APK_URL, APP_VERSION } from '@/lib/appUpdate'
import { isNative } from '@/lib/nativeAuth'
import { PhoneSection } from './PhoneSection'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

const THEME_OPTIONS: { value: ThemePref; label: string; icon: string }[] = [
  { value: 'light', label: 'Claro', icon: '☀️' },
  { value: 'dark', label: 'Oscuro', icon: '🌙' },
  { value: 'system', label: 'Sistema', icon: '🖥️' },
]

const LANGUAGE_OPTIONS: { value: LanguagePref; label: string }[] = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
]

export function SettingsPage() {
  const { t } = useTranslation()
  const { session, profile, signOut } = useAuth()
  const theme = useSettings((s) => s.theme)
  const setTheme = useSettings((s) => s.setTheme)
  const language = useSettings((s) => s.language)
  const setLanguage = useSettings((s) => s.setLanguage)
  const showAccountsTotal = useSettings((s) => s.showAccountsTotal)
  const setShowAccountsTotal = useSettings((s) => s.setShowAccountsTotal)

  const userId = session?.user?.id
  const email = session?.user?.email ?? profile?.email
  const { data: families = [] } = useMyFamilies(userId)
  const { data: invitations = [] } = useMyInvitations(email)
  const family = families[0]

  const startCheckout = useStartCheckout()
  const openPortal = useOpenBillingPortal()
  const updateMainCurrency = useUpdateMainCurrency()
  const mainCurrency = profile?.main_currency ?? 'MXN'
  const updateThreshold = useUpdateBudgetAlertThreshold()
  const updateAlertsEmail = useUpdateBudgetAlertsEmail()
  const alertThreshold = profile?.budget_alert_threshold ?? DEFAULT_ALERT_THRESHOLD
  const { canUseFamily } = useEntitlements()

  const calendarConnQuery = useGoogleCalendarConnection(userId)
  const calendarConnected = !!calendarConnQuery.data
  const enableCalendar = useEnableGoogleCalendar()
  const disconnectCalendar = useDisconnectGoogleCalendar()
  const updateCalendarSubReminders = useUpdateCalendarSubscriptionReminders()
  const updateCalendarCardReminders = useUpdateCalendarCardPaymentReminders()
  const [calendarProviderToken, setCalendarProviderToken] = useState<string | null>(null)
  const [calendarProviderRefreshToken, setCalendarProviderRefreshToken] = useState<string | null>(
    null,
  )

  useEffect(() => {
    // Solo nos interesa el token si el consentimiento que se acaba de
    // completar fue el de Calendar (mismo flag que EmailSyncPage usa para
    // Gmail/Outlook, ver useEmailSync.ts) — evita confundirlo con un token
    // de otra página si el usuario venía de conectar correo.
    if (sessionStorage.getItem(EMAIL_SYNC_PROVIDER_KEY) !== 'calendar') return
    void (async () => {
      const [token, refreshToken] = await Promise.all([
        getProviderToken(),
        getProviderRefreshToken(),
      ])
      setCalendarProviderToken(token)
      setCalendarProviderRefreshToken(refreshToken)
    })()
  }, [session])

  async function handleEnableCalendar() {
    if (!userId || !calendarProviderToken) return
    try {
      await enableCalendar.mutateAsync({
        userId,
        providerToken: calendarProviderToken,
        providerRefreshToken: calendarProviderRefreshToken,
      })
      sessionStorage.removeItem(EMAIL_SYNC_PROVIDER_KEY)
      setCalendarProviderToken(null)
    } catch (e) {
      alert(`${t('Error:')} ${(e as Error).message}`)
    }
  }

  async function handleDisconnectCalendar() {
    if (!userId) return
    if (!window.confirm(t('¿Desconectar Google Calendar? Los recordatorios ya creados se quedan en tu calendario.'))) return
    try {
      await disconnectCalendar.mutateAsync({ userId })
    } catch (e) {
      alert(`${t('Error:')} ${(e as Error).message}`)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title={t('Configuración')}
        subtitle={t('Tu cuenta y preferencias')}
        helpId="configuracion"
      />

      <div className="grid gap-4">
        {/* Perfil */}
        <Card>
          <p className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
            👤 {t('Perfil')}
          </p>
          <div className="flex items-center gap-3">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="h-12 w-12 rounded-full"
              />
            ) : (
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-xl">
                👤
              </span>
            )}
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                {profile?.full_name ?? t('Usuario')}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {profile?.email}
              </p>
            </div>
            {profile?.is_premium && (
              <Badge className="ml-auto bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                Premium
              </Badge>
            )}
          </div>
          <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
            {t('El nombre y la foto vienen de tu cuenta de Google.')}
          </p>
        </Card>

        {/* Apariencia */}
        <Card>
          <p className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
            🎨 {t('Apariencia')}
          </p>
          <div className="flex gap-2">
            {THEME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTheme(opt.value)}
                className={`flex flex-1 flex-col items-center gap-1 rounded-lg border px-3 py-3 text-sm font-medium transition-colors ${
                  theme === opt.value
                    ? 'border-brand-600 bg-brand-50 dark:bg-brand-800/40 text-brand-700 dark:text-brand-500'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <span className="text-xl">{opt.icon}</span>
                {t(opt.label)}
              </button>
            ))}
          </div>
        </Card>

        {/* Idioma */}
        <Card>
          <p className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
            🌐 {t('Idioma')}
          </p>
          <div className="flex gap-2">
            {LANGUAGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setLanguage(opt.value)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  language === opt.value
                    ? 'border-brand-600 bg-brand-50 dark:bg-brand-800/40 text-brand-700 dark:text-brand-500'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Privacidad / visibilidad */}
        <Card>
          <p className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
            👁️ {t('Visibilidad')}
          </p>
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              className="mt-0.5 cursor-pointer"
              checked={showAccountsTotal}
              onChange={(e) => setShowAccountsTotal(e.target.checked)}
            />
            <span className="text-sm text-slate-700 dark:text-slate-200">
              {t('Mostrar total de cuentas')}
              <span className="block text-xs text-slate-400 dark:text-slate-500">
                {t('El apartado con la suma de todas tus cuentas, arriba del listado.')}
              </span>
            </span>
          </label>
        </Card>

        {/* Moneda principal */}
        <Card>
          <p className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
            💱 {t('Moneda principal')}
          </p>
          <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
            {t('Tu balance y reportes se muestran en esta moneda. Los movimientos en otra moneda se convierten con el tipo de cambio.')}
          </p>
          <div className="flex flex-wrap gap-2">
            {CURRENCIES.map((cur) => (
              <button
                key={cur}
                type="button"
                disabled={updateMainCurrency.isPending}
                onClick={() => {
                  if (userId && cur !== mainCurrency) {
                    updateMainCurrency.mutate(
                      { userId, mainCurrency: cur },
                      { onError: (e: any) => alert(`${t('Error:')} ${e.message}`) },
                    )
                  }
                }}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                  mainCurrency === cur
                    ? 'border-brand-600 bg-brand-50 dark:bg-brand-800/40 text-brand-700 dark:text-brand-500'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {cur}
              </button>
            ))}
          </div>
        </Card>

        {/* Presupuestos */}
        <Card>
          <p className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
            🎯 {t('Presupuestos')}
          </p>
          <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
            {t('Se usa en los presupuestos que no definen su propio umbral. Te avisamos una vez por periodo al cruzarlo, y otra si lo excedes.')}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-slate-700 dark:text-slate-200">
              {t('Avisarme al llegar a')}
            </label>
            <input
              type="number"
              min={1}
              max={100}
              defaultValue={alertThreshold}
              disabled={updateThreshold.isPending}
              // onBlur y no onChange: guardar en cada tecla dispararía una
              // escritura por dígito ("8" antes de "80").
              onBlur={(e) => {
                const value = Number(e.target.value)
                if (!userId || !Number.isFinite(value)) return
                const clamped = Math.min(100, Math.max(1, Math.round(value)))
                e.target.value = String(clamped)
                if (clamped === alertThreshold) return
                updateThreshold.mutate(
                  { userId, threshold: clamped },
                  { onError: (err: any) => alert(`${t('Error:')} ${err.message}`) },
                )
              }}
              className="w-20 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <span className="text-sm text-slate-700 dark:text-slate-200">%</span>
            <Link
              to="/presupuestos"
              className="ml-auto text-sm font-medium text-brand-700 dark:text-brand-500 hover:underline"
            >
              {t('Ver mis presupuestos')} →
            </Link>
          </div>

          <label className="mt-4 flex items-start gap-2">
            <input
              type="checkbox"
              className="mt-0.5 cursor-pointer"
              checked={!!profile?.budget_alerts_email}
              disabled={updateAlertsEmail.isPending}
              onChange={(e) => {
                if (!userId) return
                updateAlertsEmail.mutate(
                  { userId, enabled: e.target.checked },
                  { onError: (err: any) => alert(`${t('Error:')} ${err.message}`) },
                )
              }}
            />
            <span className="text-sm text-slate-700 dark:text-slate-200">
              {t('Avisarme también por correo')}
              <span className="block text-xs text-slate-400 dark:text-slate-500">
                {t('Un correo al día con los presupuestos que cruzaron su límite. Nunca se repite el mismo aviso.')}
              </span>
            </span>
          </label>
        </Card>

        {/* Google Calendar */}
        <Card>
          <p className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
            📅 {t('Recordatorios en Google Calendar')}
          </p>
          <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
            {t('Crea un evento en tu calendario cuando se acerca el próximo cobro de una suscripción o la fecha de pago de una tarjeta/MSI.')}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {!calendarConnected ? (
              !calendarProviderToken ? (
                <Button onClick={() => void connectGoogleCalendar()}>
                  {t('Conectar Google Calendar')}
                </Button>
              ) : (
                <Button onClick={handleEnableCalendar} disabled={enableCalendar.isPending}>
                  {enableCalendar.isPending ? t('Activando…') : t('Activar recordatorios')}
                </Button>
              )
            ) : (
              <>
                <span className="text-sm text-green-600">
                  ✓ {t('Conectado{{email}}', {
                    email: calendarConnQuery.data?.email ? ` (${calendarConnQuery.data.email})` : '',
                  })}
                </span>
                <Button
                  variant="secondary"
                  onClick={handleDisconnectCalendar}
                  disabled={disconnectCalendar.isPending}
                >
                  {t('Desconectar')}
                </Button>
              </>
            )}
          </div>

          {calendarConnected && (
            <div className="mt-4 grid gap-2">
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-0.5 cursor-pointer"
                  checked={!!profile?.calendar_subscription_reminders}
                  disabled={updateCalendarSubReminders.isPending}
                  onChange={(e) => {
                    if (!userId) return
                    updateCalendarSubReminders.mutate(
                      { userId, enabled: e.target.checked },
                      { onError: (err: any) => alert(`${t('Error:')} ${err.message}`) },
                    )
                  }}
                />
                <span className="text-sm text-slate-700 dark:text-slate-200">
                  {t('Próximo cobro de suscripciones')}
                </span>
              </label>
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-0.5 cursor-pointer"
                  checked={!!profile?.calendar_card_payment_reminders}
                  disabled={updateCalendarCardReminders.isPending}
                  onChange={(e) => {
                    if (!userId) return
                    updateCalendarCardReminders.mutate(
                      { userId, enabled: e.target.checked },
                      { onError: (err: any) => alert(`${t('Error:')} ${err.message}`) },
                    )
                  }}
                />
                <span className="text-sm text-slate-700 dark:text-slate-200">
                  {t('Pago de tarjeta / MSI')}
                </span>
              </label>
            </div>
          )}
        </Card>

        {/* Teléfono */}
        <Card>
          <p className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
            📱 {t('Teléfono')}
          </p>
          <PhoneSection />
        </Card>

        {/* Suscripción */}
        <Card>
          <p className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
            ⭐ {t('Suscripción')}
          </p>
          {profile?.is_premium ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                  Premium
                </Badge>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {t('Tienes acceso a todas las funciones.')}
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                disabled={openPortal.isPending}
                onClick={() =>
                  openPortal.mutate(undefined, {
                    onError: (e: any) => alert(`${t('Error:')} ${e.message}`),
                  })
                }
              >
                {t('Gestionar suscripción')}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t('Plan gratuito. Premium desbloquea plan familiar, MSI/diferidos y rendimientos.')}
              </p>
              <Button
                className="self-start"
                disabled={startCheckout.isPending}
                onClick={() =>
                  startCheckout.mutate(undefined, {
                    onError: (e: any) => alert(`${t('Error:')} ${e.message}`),
                  })
                }
              >
                {startCheckout.isPending ? t('Abriendo…') : t('Hacerse Premium')}
              </Button>
            </div>
          )}
        </Card>

        {/* Familia */}
        <Card>
          <p className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
            👨‍👩‍👧‍👦 {t('Plan familiar')}
          </p>
          {invitations.length > 0 && (
            <p className="mb-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 p-2 text-sm text-amber-700 dark:text-amber-300">
              {t('Tienes {{count}} invitación(es) pendiente(s).', {
                count: invitations.length,
              })}
            </p>
          )}
          {family ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-slate-700 dark:text-slate-200">
                {family.name}{' '}
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {family.owner_id === userId
                    ? t('(eres el jefe de familia)')
                    : t('(miembro)')}
                </span>
              </p>
              <Link to="/familia">
                <Button size="sm" variant="secondary">
                  {t('Ver familia')}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t('No participas en ningún plan familiar.')}
                {!canUseFamily && ' ' + t('Crearlo requiere Premium.')}
              </p>
              <Link to="/familia">
                <Button size="sm" variant="secondary">
                  {canUseFamily
                    ? t('Crear plan familiar')
                    : t('Saber más')}
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Aplicación. Dentro del APK no tiene sentido ofrecer descargarlo:
            ahí el que avisa de versiones nuevas es NativeUpdatePrompt. */}
        {!isNative() && (
          <Card>
            <p className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
              📲 {t('Aplicación')}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t('Instala Mi Control de Finanzas Personales en tu teléfono y llévala contigo.')}
                <span className="block text-xs text-slate-400 dark:text-slate-500">
                  {t('Versión {{version}}', { version: APP_VERSION })}
                </span>
              </p>
              <a href={APK_URL} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="secondary">
                  ⬇️ {t('Descargar app (Android)')}
                </Button>
              </a>
            </div>
          </Card>
        )}

        {/* Sesión */}
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              🚪 {t('Sesión')}
            </p>
            <Button variant="danger" size="sm" onClick={() => signOut()}>
              {t('Cerrar sesión')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
