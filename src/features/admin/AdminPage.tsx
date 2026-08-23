import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/store/useAuth'
import { useListUsers, useSetUserPremium, useSetUserAdmin } from '@/hooks/useAdmin'
import { useAppConfig, useUpdateAppConfig } from '@/hooks/useAppConfig'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import type { AppConfigRow } from '@/types/db'
import { DEFAULT_THEME_COLORS, applyThemeColors } from '@/lib/themeColors'
import type { ThemeColors } from '@/lib/themeColors'
import { PAGE_NAV_ITEMS, orderByPageOrder } from '@/lib/pageOrder'

const DEFAULT_APP_TITLE = 'Mi Control de Finanzas Personales'
const MAX_LOGO_BYTES = 2 * 1024 * 1024

// Editor de la marca: nombre de la app y logo (imagen subida a Supabase Storage).
function BrandingEditor() {
  const { t } = useTranslation()
  const { data: config } = useAppConfig()
  const updateConfig = useUpdateAppConfig()
  const [title, setTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (config) setTitle(config.app_title ?? '')
  }, [config])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(null)

    if (!file.type.startsWith('image/')) {
      setError(t('El logo debe ser una imagen.'))
      return
    }
    if (file.size > MAX_LOGO_BYTES) {
      setError(t('La imagen no debe superar 2 MB.'))
      return
    }

    setUploading(true)
    try {
      const ext = file.name.split('.').pop() || 'png'
      const path = `logo-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('branding')
        .upload(path, file, { upsert: true })
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('branding').getPublicUrl(path)
      await updateConfig.mutateAsync({ logo_url: data.publicUrl })
    } catch (err: any) {
      setError(err.message ?? t('Error al subir el logo.'))
    } finally {
      setUploading(false)
    }
  }

  const handleSaveTitle = () => {
    updateConfig.mutate(
      { app_title: title.trim() || null },
      { onError: (e: any) => alert(`${t('Error:')} ${e.message}`) },
    )
  }

  const handleReset = () => {
    setTitle('')
    updateConfig.mutate(
      { app_title: null, logo_url: null },
      { onError: (e: any) => alert(`${t('Error:')} ${e.message}`) },
    )
  }

  return (
    <Card className="mb-6">
      <p className="mb-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
        🏷️ {t('Marca de la app')}
      </p>
      <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
        {t('Personaliza el nombre y el logo que se ven en la barra lateral y la pestaña del navegador.')}
      </p>

      <div className="flex items-center gap-4">
        {config?.logo_url ? (
          <img
            src={config.logo_url}
            alt=""
            className="h-12 w-12 shrink-0 rounded object-cover border border-slate-200 dark:border-slate-700"
          />
        ) : (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded border border-slate-200 dark:border-slate-700 text-2xl">
            💰
          </span>
        )}
        <div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? t('Subiendo…') : t('Cambiar logo')}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}

      <div className="mt-4">
        <Input
          label={t('Nombre de la app')}
          value={title}
          placeholder={DEFAULT_APP_TITLE}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button disabled={updateConfig.isPending} onClick={handleSaveTitle}>
          {updateConfig.isPending ? t('Guardando…') : t('Guardar nombre')}
        </Button>
        <Button variant="ghost" disabled={updateConfig.isPending} onClick={handleReset}>
          {t('Restablecer')}
        </Button>
        {updateConfig.isSuccess && (
          <span className="text-xs text-green-600 dark:text-green-400">{t('Guardado ✓')}</span>
        )}
      </div>
    </Card>
  )
}

// Editor de colores de tema (acento + fondos/superficies claro y oscuro).
function ThemeEditor() {
  const { t } = useTranslation()
  const { data: config } = useAppConfig()
  const updateConfig = useUpdateAppConfig()
  const [colors, setColors] = useState<ThemeColors>(DEFAULT_THEME_COLORS)

  useEffect(() => {
    if (config) setColors(config.theme_colors ?? DEFAULT_THEME_COLORS)
  }, [config])

  // Vista previa en vivo mientras se editan los colores.
  const update = (next: ThemeColors) => {
    setColors(next)
    applyThemeColors(next)
  }

  const swatch = (label: string, value: string, onChange: (v: string) => void) => (
    <label className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2">
      <span className="text-sm text-slate-700 dark:text-slate-200">{label}</span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-12 cursor-pointer rounded border border-slate-300 dark:border-slate-600 bg-transparent"
      />
    </label>
  )

  return (
    <Card className="mb-6">
      <p className="mb-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
        🎨 {t('Colores de la app')}
      </p>
      <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
        {t('Personaliza el color de acento y los fondos. Aplica a toda la web y la app.')}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {swatch(t('Acento (marca)'), colors.brand, (v) => update({ ...colors, brand: v }))}
        <div />
        {swatch(t('Fondo (claro)'), colors.light.bg, (v) =>
          update({ ...colors, light: { ...colors.light, bg: v } }),
        )}
        {swatch(t('Superficie (claro)'), colors.light.surface, (v) =>
          update({ ...colors, light: { ...colors.light, surface: v } }),
        )}
        {swatch(t('Fondo (oscuro)'), colors.dark.bg, (v) =>
          update({ ...colors, dark: { ...colors.dark, bg: v } }),
        )}
        {swatch(t('Superficie (oscuro)'), colors.dark.surface, (v) =>
          update({ ...colors, dark: { ...colors.dark, surface: v } }),
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          disabled={updateConfig.isPending}
          onClick={() =>
            updateConfig.mutate(
              { theme_colors: colors },
              { onError: (e: any) => alert(`${t('Error:')} ${e.message}`) },
            )
          }
        >
          {updateConfig.isPending ? t('Guardando…') : t('Guardar colores')}
        </Button>
        <Button
          variant="ghost"
          disabled={updateConfig.isPending}
          onClick={() => {
            setColors(DEFAULT_THEME_COLORS)
            applyThemeColors(null)
            updateConfig.mutate(
              { theme_colors: null },
              { onError: (e: any) => alert(`${t('Error:')} ${e.message}`) },
            )
          }}
        >
          {t('Restablecer')}
        </Button>
        {updateConfig.isSuccess && (
          <span className="text-xs text-green-600 dark:text-green-400">{t('Guardado ✓')}</span>
        )}
      </div>
    </Card>
  )
}

// Editor de límites del plan gratis y de qué funciones son premium.
function ConfigEditor() {
  const { t } = useTranslation()
  const { data: config } = useAppConfig()
  const updateConfig = useUpdateAppConfig()
  const [form, setForm] = useState<AppConfigRow | null>(null)

  useEffect(() => {
    if (config) setForm(config)
  }, [config])

  if (!form) return null

  const setNum = (key: keyof AppConfigRow) => (v: string) =>
    setForm({ ...form, [key]: Math.max(0, parseInt(v, 10) || 0) })
  const setBool = (key: keyof AppConfigRow) => (v: boolean) =>
    setForm({ ...form, [key]: v })

  const FEATURES: { key: keyof AppConfigRow; label: string }[] = [
    { key: 'family_is_premium', label: t('Plan familiar') },
    { key: 'yields_is_premium', label: t('Rendimientos') },
    { key: 'installments_is_premium', label: t('Meses sin intereses / diferido') },
    { key: 'reports_filters_is_premium', label: t('Filtros de reportes') },
    { key: 'dashboard_period_filter_is_premium', label: t('Selector de periodo en Resumen') },
    { key: 'transactions_period_filter_is_premium', label: t('Selector de periodo en Movimientos') },
    { key: 'budgets_is_premium', label: t('Presupuestos') },
  ]

  return (
    <Card className="mb-6">
      <p className="mb-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
        ⚙️ {t('Planes y límites')}
      </p>
      <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
        {t('Define los límites del plan gratis (0 = ilimitado) y qué funciones requieren Premium.')}
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          label={t('Máx. cuentas (gratis)')}
          type="number"
          min="0"
          value={form.free_max_accounts}
          onChange={(e) => setNum('free_max_accounts')(e.target.value)}
        />
        <Input
          label={t('Máx. tarjetas (gratis)')}
          type="number"
          min="0"
          value={form.free_max_cards}
          onChange={(e) => setNum('free_max_cards')(e.target.value)}
        />
        <Input
          label={t('Máx. transacciones (gratis)')}
          type="number"
          min="0"
          value={form.free_max_transactions}
          onChange={(e) => setNum('free_max_transactions')(e.target.value)}
        />
        <Input
          label={t('Máx. presupuestos (gratis)')}
          type="number"
          min="0"
          value={form.free_max_budgets}
          onChange={(e) => setNum('free_max_budgets')(e.target.value)}
        />
      </div>

      <p className="mb-2 mt-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
        {t('Funciones que requieren Premium')}
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <label key={f.key} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              className="cursor-pointer"
              checked={!!form[f.key]}
              onChange={(e) => setBool(f.key)(e.target.checked)}
            />
            {f.label}
          </label>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button
          disabled={updateConfig.isPending}
          onClick={() =>
            updateConfig.mutate(
              {
                free_max_accounts: form.free_max_accounts,
                free_max_cards: form.free_max_cards,
                free_max_transactions: form.free_max_transactions,
                free_max_budgets: form.free_max_budgets,
                family_is_premium: form.family_is_premium,
                yields_is_premium: form.yields_is_premium,
                installments_is_premium: form.installments_is_premium,
                reports_filters_is_premium: form.reports_filters_is_premium,
                dashboard_period_filter_is_premium: form.dashboard_period_filter_is_premium,
                transactions_period_filter_is_premium: form.transactions_period_filter_is_premium,
                budgets_is_premium: form.budgets_is_premium,
              },
              { onError: (e: any) => alert(`${t('Error:')} ${e.message}`) },
            )
          }
        >
          {updateConfig.isPending ? t('Guardando…') : t('Guardar configuración')}
        </Button>
        {updateConfig.isSuccess && (
          <span className="text-xs text-green-600 dark:text-green-400">{t('Guardado ✓')}</span>
        )}
      </div>
    </Card>
  )
}

// Editor del orden de páginas del sidebar/menú "Más" (y, de paso, del
// recorrido guiado). Sin librería de drag-and-drop: para una lista corta de
// uso admin-only poco frecuente, mover con ↑/↓ es más simple y accesible.
function PageOrderEditor() {
  const { t } = useTranslation()
  const { data: config } = useAppConfig()
  const updateConfig = useUpdateAppConfig()
  const [order, setOrder] = useState<string[]>(PAGE_NAV_ITEMS.map((p) => p.to))

  useEffect(() => {
    const current = orderByPageOrder(PAGE_NAV_ITEMS, config?.page_order ?? null)
    setOrder(current.map((p) => p.to))
  }, [config?.page_order])

  const items = order
    .map((to) => PAGE_NAV_ITEMS.find((p) => p.to === to))
    .filter((p): p is (typeof PAGE_NAV_ITEMS)[number] => !!p)

  const move = (index: number, dir: -1 | 1) => {
    const next = [...order]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    setOrder(next)
  }

  return (
    <Card className="mb-6">
      <p className="mb-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
        📋 {t('Orden de páginas')}
      </p>
      <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
        {t('Define en qué orden aparecen las secciones en el menú y en el recorrido guiado.')}
      </p>

      <div className="divide-y divide-slate-200 dark:divide-slate-700 rounded-lg border border-slate-200 dark:border-slate-700">
        {items.map((item, i) => (
          <div key={item.to} className="flex items-center gap-3 px-3 py-2">
            <span className="text-lg">{item.icon}</span>
            <span className="flex-1 text-sm text-slate-700 dark:text-slate-200">{t(item.label)}</span>
            <Button
              variant="ghost"
              size="sm"
              disabled={i === 0}
              onClick={() => move(i, -1)}
              aria-label={t('Subir')}
              title={t('Subir')}
            >
              ↑
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={i === items.length - 1}
              onClick={() => move(i, 1)}
              aria-label={t('Bajar')}
              title={t('Bajar')}
            >
              ↓
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          disabled={updateConfig.isPending}
          onClick={() =>
            updateConfig.mutate(
              { page_order: order },
              { onError: (e: any) => alert(`${t('Error:')} ${e.message}`) },
            )
          }
        >
          {updateConfig.isPending ? t('Guardando…') : t('Guardar orden')}
        </Button>
        <Button
          variant="ghost"
          disabled={updateConfig.isPending}
          onClick={() =>
            updateConfig.mutate(
              { page_order: null },
              { onError: (e: any) => alert(`${t('Error:')} ${e.message}`) },
            )
          }
        >
          {t('Restablecer')}
        </Button>
        {updateConfig.isSuccess && (
          <span className="text-xs text-green-600 dark:text-green-400">{t('Guardado ✓')}</span>
        )}
      </div>
    </Card>
  )
}

export function AdminPage() {
  const { t } = useTranslation()
  const { session } = useAuth()
  const currentUserId = session?.user?.id
  const queryClient = useQueryClient()
  const { data: users, isLoading, error } = useListUsers()
  const { mutate: setPremium, isPending } = useSetUserPremium()
  const { mutate: setAdmin, isPending: isAdminPending } = useSetUserAdmin()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const refreshUsers = () =>
    queryClient.invalidateQueries({ queryKey: ['list_users'] })

  const handleTogglePremium = (userId: string, currentPremium: boolean) => {
    setLoadingId(userId)
    setPremium(
      { userId, isPremium: !currentPremium },
      {
        onSuccess: () => {
          refreshUsers()
          setLoadingId(null)
        },
        onError: (e: any) => {
          alert(`${t('Error:')} ${e.message}`)
          setLoadingId(null)
        },
      },
    )
  }

  const handleToggleAdmin = (userId: string, currentAdmin: boolean) => {
    setLoadingId(userId)
    setAdmin(
      { userId, isAdmin: !currentAdmin },
      {
        onSuccess: () => {
          refreshUsers()
          setLoadingId(null)
        },
        onError: (e: any) => {
          alert(`${t('Error:')} ${e.message}`)
          setLoadingId(null)
        },
      },
    )
  }

  return (
    <>
      <PageHeader
        title={t('Panel Admin')}
        subtitle={t('Gestiona usuarios y sus permisos de premium.')}
        helpId="admin"
      />

      <BrandingEditor />

      <ConfigEditor />

      <ThemeEditor />

      <PageOrderEditor />

      {error && (
        <Card className="mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <p className="text-sm text-red-800">
            {t('Error:')} {error instanceof Error ? error.message : t('Error desconocido')}
          </p>
        </Card>
      )}

      <Card>
        {isLoading ? (
          <p className="py-8 text-center text-slate-500 dark:text-slate-400">{t('Cargando usuarios...')}</p>
        ) : !users || users.length === 0 ? (
          <p className="py-8 text-center text-slate-500 dark:text-slate-400">{t('Sin usuarios.')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">
                    {t('Email')}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">
                    {t('Nombre')}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">
                    {t('Estado')}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">
                    {t('Acciones')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">{user.full_name || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {user.is_premium && (
                          <Badge className="bg-green-100 text-green-800">Premium</Badge>
                        )}
                        {user.is_admin && (
                          <Badge className="bg-blue-100 dark:bg-blue-900/40 text-blue-800">Admin</Badge>
                        )}
                        {!user.is_premium && !user.is_admin && (
                          <Badge className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100">{t('Gratis')}</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant={user.is_premium ? 'danger' : 'primary'}
                          onClick={() => handleTogglePremium(user.id, user.is_premium)}
                          disabled={isPending || isAdminPending || loadingId === user.id}
                        >
                          {loadingId === user.id ? t('Actualizando...') : user.is_premium ? t('Quitar Premium') : t('Dar Premium')}
                        </Button>
                        <Button
                          size="sm"
                          variant={user.is_admin ? 'danger' : 'secondary'}
                          onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                          disabled={
                            isPending ||
                            isAdminPending ||
                            loadingId === user.id ||
                            (user.id === currentUserId && user.is_admin)
                          }
                          title={
                            user.id === currentUserId && user.is_admin
                              ? t('No puedes quitarte admin a ti mismo')
                              : undefined
                          }
                        >
                          {user.is_admin ? t('Quitar Admin') : t('Hacer Admin')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}
