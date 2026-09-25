import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { App } from '@capacitor/app'
import { Link } from 'react-router-dom'
import { useAuth } from '@/store/useAuth'
import { useAccounts } from '@/hooks/useAccounts'
import { useCategories } from '@/hooks/useCategories'
import {
  useParsingRules,
  useSaveParsingRule,
  useDeleteParsingRule,
} from '@/hooks/useImports'
import {
  useNotificationAppCatalog,
  useRecentIngestSignals,
  signalLabel,
} from '@/hooks/useIngestSignals'
import { isAndroidNative } from '@/lib/smsSync'
import {
  disableNotificationCapture,
  enableNotificationCapture,
  getListenedPackages,
  isNotificationAccessGranted,
  isNotificationCaptureEnabled,
  listInstalledApps,
  openNotificationAccessSettings,
  setListenedPackages,
  type InstalledApp,
} from '@/lib/notificationSync'
import { getPlatform } from '@/lib/nativeAuth'
import { formatMoney } from '@/lib/format'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { BrandBatteryGuide } from '@/features/help/BrandBatteryGuide'
import type { IngestSignalRow, NotificationAppCatalogRow, ParsingRuleRow } from '@/types/db'

const KIND_LABEL: Record<NotificationAppCatalogRow['kind'], string> = {
  bank: 'Banco',
  fintech: 'Fintech',
  wallet: 'Wallet',
  shopping: 'Compras',
}

function catalogFor(
  catalog: NotificationAppCatalogRow[],
  app: InstalledApp,
): NotificationAppCatalogRow | null {
  const byPkg = catalog.find((c) => c.package_name === app.packageName)
  if (byPkg) return byPkg
  return (
    catalog.find((c) => {
      if (!c.label_pattern) return false
      try {
        return new RegExp(c.label_pattern, 'i').test(app.label)
      } catch {
        return false
      }
    }) ?? null
  )
}

export function NotificationCapturePage() {
  const { t } = useTranslation()
  const { session } = useAuth()
  const userId = session?.user?.id

  const available = isAndroidNative()
  const platform = getPlatform()

  const catalogQuery = useNotificationAppCatalog()
  const rulesQuery = useParsingRules(userId, 'notification')
  const accountsQuery = useAccounts(userId)
  const categoriesQuery = useCategories(userId, 'expense')
  const signalsQuery = useRecentIngestSignals(userId)
  const saveRule = useSaveParsingRule()
  const deleteRule = useDeleteParsingRule()

  const catalog = catalogQuery.data || []
  const rules = rulesQuery.data || []

  const [granted, setGranted] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [apps, setApps] = useState<InstalledApp[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loadingApps, setLoadingApps] = useState(false)
  const [search, setSearch] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [settingsFor, setSettingsFor] = useState<InstalledApp | null>(null)

  const refreshAccess = useCallback(async () => {
    setGranted(await isNotificationAccessGranted())
  }, [])

  // El permiso se da en Ajustes de Android: al volver a la app, revisarlo.
  useEffect(() => {
    if (!available) return
    void refreshAccess()
    void isNotificationCaptureEnabled().then(setEnabled)
    const sub = App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) void refreshAccess()
    })
    return () => {
      void sub.then((h) => h.remove())
    }
  }, [available, refreshAccess])

  // Apps instaladas + selección guardada (o, la primera vez, las del catálogo).
  useEffect(() => {
    if (!available || catalogQuery.isLoading) return
    let cancelled = false
    setLoadingApps(true)
    void (async () => {
      try {
        const [installed, saved] = await Promise.all([listInstalledApps(), getListenedPackages()])
        if (cancelled) return
        setApps(installed)
        setSelected(
          new Set(
            saved.length > 0
              ? saved
              : installed
                  .filter((a) => catalogFor(catalog, a)?.default_on)
                  .map((a) => a.packageName),
          ),
        )
      } catch (e) {
        if (!cancelled) setMsg(`${t('Error:')} ${(e as Error).message}`)
      } finally {
        if (!cancelled) setLoadingApps(false)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [available, catalogQuery.isLoading])

  // Conocidas (banco/fintech/tiendas) primero; luego el resto por nombre.
  const sortedApps = useMemo(() => {
    const q = search.trim().toLowerCase()
    return apps
      .filter((a) => !q || a.label.toLowerCase().includes(q) || a.packageName.includes(q))
      .map((a) => ({ app: a, cat: catalogFor(catalog, a) }))
      .sort((x, y) => {
        const sx = selected.has(x.app.packageName) ? 0 : x.cat ? 1 : 2
        const sy = selected.has(y.app.packageName) ? 0 : y.cat ? 1 : 2
        return sx - sy || x.app.label.localeCompare(y.app.label, 'es')
      })
  }, [apps, catalog, search, selected])

  const ruleFor = (pkg: string): ParsingRuleRow | undefined =>
    rules.find((r) => (r.config.senders ?? []).includes(pkg))

  async function toggleApp(pkg: string) {
    const next = new Set(selected)
    if (next.has(pkg)) next.delete(pkg)
    else next.add(pkg)
    setSelected(next)
    if (enabled) await setListenedPackages([...next])
  }

  async function handleToggleCapture() {
    if (!userId) return
    setBusy(true)
    setMsg(null)
    try {
      if (enabled) {
        await disableNotificationCapture(userId)
        setEnabled(false)
        setMsg(t('Captura de notificaciones desactivada.'))
      } else {
        if (selected.size === 0) {
          setMsg(t('Marca al menos una app (tu banco, por ejemplo) antes de activar.'))
          return
        }
        await enableNotificationCapture(userId, [...selected])
        setEnabled(true)
        setMsg(
          granted
            ? t('Captura activada. Los cargos que te avisen esas apps se registrarán solos.')
            : t('Captura activada. Falta darle a la app "Acceso a notificaciones" en Ajustes.'),
        )
      }
    } catch (e) {
      setMsg(`${t('Error:')} ${(e as Error).message}`)
    } finally {
      setBusy(false)
    }
  }

  const outcomeLabel = (s: IngestSignalRow) =>
    s.outcome === 'inserted'
      ? t('Registrado')
      : s.outcome === 'merged'
        ? t('Unido a un cargo que ya existía')
        : t('Posible duplicado, por revisar')

  return (
    <>
      <PageHeader
        title={t('Captura por notificaciones')}
        subtitle={t('Registra solos los cargos que te avisan las apps de tu banco, wallet o tiendas. Disponible solo en la app de Android.')}
        helpId="notif-capture"
      />

      {!available ? (
        <Card className="border-dashed">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {platform === 'ios'
              ? t('📵 Apple no permite que las apps lean las notificaciones de otras apps. En iPhone usa "Sincronizar correo" o "Importar" tu estado de cuenta.')
              : t('Esta función solo está disponible en la app instalada de Android.')}
          </p>
          <Link
            to="/ayuda#captura-notificaciones"
            className="mt-2 inline-block text-xs font-medium text-brand-700 dark:text-brand-500 hover:underline"
          >
            {t('¿Por qué? Ver preguntas frecuentes →')}
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4">
          <Card className="grid gap-3">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {t('1. Acceso a notificaciones')}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {granted
                ? t('✅ Acceso concedido.')
                : t('Android pide activar este permiso a mano: se abrirá Ajustes, busca esta app y activa "Permitir acceso a notificaciones".')}
            </p>
            {!granted && (
              <div>
                <Button onClick={() => void openNotificationAccessSettings()}>
                  {t('Dar acceso a notificaciones')}
                </Button>
              </div>
            )}
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {t('Privacidad: solo se leen las apps que marques abajo y solo se envían los avisos que traen un monto. El texto de la notificación no se guarda; solo el movimiento que se detecte.')}
            </p>
          </Card>

          <Card className="grid gap-3">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {t('2. Apps que se escuchan')}
            </h3>
            <Input
              label={t('Buscar app')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="BBVA, Nu, Amazon…"
            />
            {loadingApps ? (
              <p className="text-sm text-slate-500">{t('Cargando apps…')}</p>
            ) : (
              <ul className="grid max-h-96 gap-1 overflow-y-auto">
                {sortedApps.map(({ app, cat }) => {
                  const on = selected.has(app.packageName)
                  const rule = ruleFor(app.packageName)
                  return (
                    <li
                      key={app.packageName}
                      className="flex items-center gap-3 rounded-md px-1 py-1 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => void toggleApp(app.packageName)}
                        className="h-4 w-4"
                        aria-label={app.label}
                      />
                      {app.icon ? (
                        <img src={app.icon} alt="" className="h-7 w-7 rounded" />
                      ) : (
                        <span className="h-7 w-7" />
                      )}
                      <span className="min-w-0 flex-1 truncate text-sm text-slate-700 dark:text-slate-200">
                        {app.label}
                        {cat && (
                          <span className="ml-1.5 rounded bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-300">
                            {t(KIND_LABEL[cat.kind])}
                          </span>
                        )}
                        {rule && (
                          <span className="ml-1 text-[10px] text-brand-600 dark:text-brand-400">⚙️</span>
                        )}
                      </span>
                      {on && (
                        <button
                          type="button"
                          onClick={() => setSettingsFor(app)}
                          className="text-xs font-medium text-brand-700 dark:text-brand-500 hover:underline"
                        >
                          {t('Ajustes')}
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>

          <Card className="grid gap-3">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {t('3. Captura automática')}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {enabled
                ? t('✅ Activada para {{n}} apps.', { n: selected.size })
                : t('Actívala para que los cargos se registren solos, aun con la app cerrada.')}
            </p>
            <div>
              <Button data-tour="notif-capture" onClick={handleToggleCapture} disabled={busy}>
                {busy
                  ? t('Un momento…')
                  : enabled
                    ? t('Desactivar captura')
                    : t('Activar captura automática')}
              </Button>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {t('Si el mismo cargo llega también por SMS o correo, se registra una sola vez. Los de apps de compras entran como pendientes. En Xiaomi, Huawei, Oppo y similares permite el "inicio automático" y quita la optimización de batería, o el sistema apaga la captura.')}
            </p>
          </Card>

          {msg && (
            <Card className="border-brand-200 bg-brand-50 dark:bg-brand-800/40">
              <p className="text-sm font-medium text-brand-700 dark:text-brand-500">{msg}</p>
            </Card>
          )}

          <TroubleshootGuide />

          <Card className="grid gap-2">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {t('Últimos avisos recibidos')}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {t('Si activaste todo y aun así no ves nada aquí después de un cargo real, el aviso ni siquiera llegó al teléfono a tiempo — revisa la guía de arriba.')}
            </p>
            {(signalsQuery.data ?? []).length === 0 ? (
              <p className="text-sm text-slate-500">{t('Aún no llega ninguno.')}</p>
            ) : (
              <ul className="grid gap-1 text-sm">
                {(signalsQuery.data ?? []).map((s) => (
                  <li key={s.id} className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-slate-700 dark:text-slate-200">
                      {signalLabel(s, t)}
                      {s.amount != null && (
                        <strong className="ml-1.5">{formatMoney(s.amount, s.currency ?? 'MXN')}</strong>
                      )}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {outcomeLabel(s)} · {new Date(s.created_at).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}

      <AppSettingsModal
        app={settingsFor}
        rule={settingsFor ? ruleFor(settingsFor.packageName) : undefined}
        defaultShopping={settingsFor ? catalogFor(catalog, settingsFor)?.kind === 'shopping' : false}
        accounts={(accountsQuery.data ?? []).map((a) => ({ value: a.id, label: a.name }))}
        categories={(categoriesQuery.data ?? []).map((c) => ({ value: c.id, label: c.name }))}
        busy={saveRule.isPending || deleteRule.isPending}
        onClose={() => setSettingsFor(null)}
        onSave={async (cfg) => {
          if (!userId || !settingsFor) return
          const existing = ruleFor(settingsFor.packageName)
          if (existing && existing.bank_name !== settingsFor.label) {
            await deleteRule.mutateAsync({ userId, id: existing.id })
          }
          await saveRule.mutateAsync({
            userId,
            bankName: settingsFor.label,
            channel: 'notification',
            config: { senders: [settingsFor.packageName], ...cfg },
          })
          setSettingsFor(null)
        }}
      />
    </>
  )
}

function TroubleshootGuide() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <Card className="grid gap-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center justify-between text-left"
      >
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {t('🔧 ¿No te está funcionando?')}
        </h3>
        <span className="text-xs font-medium text-brand-700 dark:text-brand-500">
          {open ? t('▲ Ocultar') : t('▼ Ver guía')}
        </span>
      </button>

      {open && (
        <div className="grid gap-3">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {t('Si ya diste el permiso y marcaste tu banco pero un cargo real no aparece, casi siempre es el propio teléfono cerrando la app en segundo plano para "ahorrar batería". Busca tu marca y sigue los pasos.')}
          </p>
          <BrandBatteryGuide />
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {t('¿Sigue sin funcionar después de todo esto? Mientras tanto, esos cargos no se pierden: sigue registrándolos con "Importar" o capturándolos a mano, y cuando puedas cuéntanos la marca y modelo de tu teléfono para revisarlo.')}
          </p>
          <Link
            to="/ayuda#captura-notificaciones"
            className="w-fit text-xs font-medium text-brand-700 dark:text-brand-500 hover:underline"
          >
            {t('Ver todas las preguntas frecuentes de esta función →')}
          </Link>
        </div>
      )}
    </Card>
  )
}

// Ajustes por app (se guardan como parsing_rules channel='notification' con
// el paquete como remitente): cuenta y categoría por defecto, y si es tienda.
function AppSettingsModal({
  app,
  rule,
  defaultShopping,
  accounts,
  categories,
  busy,
  onClose,
  onSave,
}: {
  app: InstalledApp | null
  rule: ParsingRuleRow | undefined
  defaultShopping: boolean
  accounts: { value: string; label: string }[]
  categories: { value: string; label: string }[]
  busy: boolean
  onClose: () => void
  onSave: (cfg: { defaultAccountId?: string; categoryId?: string; shopping: boolean }) => Promise<void>
}) {
  const { t } = useTranslation()
  const [accountId, setAccountId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [shopping, setShopping] = useState(false)

  useEffect(() => {
    setAccountId(rule?.config.defaultAccountId ?? '')
    setCategoryId(rule?.config.categoryId ?? '')
    setShopping(rule?.config.shopping ?? defaultShopping)
  }, [app, rule, defaultShopping])

  return (
    <Modal open={!!app} title={app?.label ?? ''} onClose={onClose}>
      <div className="grid gap-3">
        <Select
          label={t('Cuenta por defecto')}
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          options={[{ value: '', label: t('Según la terminación del aviso') }, ...accounts]}
        />
        <Select
          label={t('Categoría fija (opcional)')}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          options={[{ value: '', label: t('Adivinar por el texto') }, ...categories]}
        />
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            checked={shopping}
            onChange={(e) => setShopping(e.target.checked)}
            className="h-4 w-4"
          />
          {t('Es una app de compras (sus cargos entran pendientes y aportan el comercio)')}
        </label>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {t('La cuenta por defecto se usa cuando el aviso no menciona la terminación de tu tarjeta o cuenta (por ejemplo, Mercado Pago).')}
        </p>
        <div className="flex gap-2">
          <Button
            onClick={() =>
              void onSave({
                defaultAccountId: accountId || undefined,
                categoryId: categoryId || undefined,
                shopping,
              })
            }
            disabled={busy}
          >
            {t('Guardar')}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            {t('Cancelar')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
