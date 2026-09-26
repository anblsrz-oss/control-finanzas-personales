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
import {
  FEATURES,
  FEATURE_GROUP_LABELS,
  buildFeaturePatch,
  getFreeLimit,
  isFeaturePremium,
  type FeatureDef,
  type FeatureGroup,
} from '@/lib/features'
import { DEFAULT_THEME_COLORS, applyThemeColors } from '@/lib/themeColors'
import type { ThemeColors } from '@/lib/themeColors'
import { PAGE_NAV_ITEMS, UNHIDEABLE_PAGES, orderByPageOrder } from '@/lib/pageOrder'

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
        <div className="hidden sm:block" />
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

// Editor de límites del plan gratis y de qué funciones son premium. Se
// construye desde el registro lib/features.ts: toda función registrada ahí
// aparece aquí sin tocar este archivo.
function ConfigEditor() {
  const { t } = useTranslation()
  const { data: config } = useAppConfig()
  const updateConfig = useUpdateAppConfig()
  const [values, setValues] = useState<Record<string, { premium: boolean; limit: number }> | null>(null)

  useEffect(() => {
    if (!config) return
    setValues(
      Object.fromEntries(
        FEATURES.map((f) => [
          f.key,
          { premium: isFeaturePremium(config, f.key), limit: getFreeLimit(config, f.key) },
        ]),
      ),
    )
  }, [config])

  if (!config || !values) return null

  const set = (key: string, patch: Partial<{ premium: boolean; limit: number }>) =>
    setValues({ ...values, [key]: { ...values[key], ...patch } })

  const groups = Object.keys(FEATURE_GROUP_LABELS) as FeatureGroup[]
  const features = FEATURES as readonly FeatureDef[]

  return (
    <Card className="mb-6">
      <p className="mb-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
        ⚙️ {t('Planes y límites')}
      </p>
      <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
        {t('Marca qué funciones requieren Premium y el límite del plan gratis (0 = ilimitado).')}
      </p>

      {groups.map((group) => (
        <div key={group} className="mb-4">
          <p className="mb-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            {t(FEATURE_GROUP_LABELS[group])}
          </p>
          <div className="divide-y divide-slate-200 dark:divide-slate-700 rounded-lg border border-slate-200 dark:border-slate-700">
            {features
              .filter((f) => f.group === group)
              .map((f) => (
                <div key={f.key} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2">
                  <span className="min-w-0 basis-full break-words text-sm text-slate-700 dark:text-slate-200 sm:basis-auto sm:flex-1">
                    {t(f.label)}
                  </span>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  {f.premium && (
                    <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <input
                        type="checkbox"
                        className="cursor-pointer"
                        checked={values[f.key].premium}
                        onChange={(e) => set(f.key, { premium: e.target.checked })}
                      />
                      Premium
                    </label>
                  )}
                  {f.limit && (
                    <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                      {t('Límite gratis')}
                      <input
                        type="number"
                        min="0"
                        className="w-16 rounded border border-slate-300 dark:border-slate-600 bg-transparent px-1.5 py-0.5 text-sm"
                        value={values[f.key].limit}
                        onChange={(e) => set(f.key, { limit: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                      />
                      {f.limit.kind === 'monthly' ? t('/mes') : t('total')}
                    </label>
                  )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}

      <div className="mt-4 flex items-center gap-3">
        <Button
          disabled={updateConfig.isPending}
          onClick={() =>
            updateConfig.mutate(buildFeaturePatch(config, values), {
              onError: (e: any) => alert(`${t('Error:')} ${e.message}`),
            })
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
  const [hidden, setHidden] = useState<string[]>([])

  useEffect(() => {
    const current = orderByPageOrder(PAGE_NAV_ITEMS, config?.page_order ?? null)
    setOrder(current.map((p) => p.to))
  }, [config?.page_order])

  useEffect(() => {
    setHidden(config?.hidden_pages ?? [])
  }, [config?.hidden_pages])

  const toggleHidden = (to: string) =>
    setHidden(hidden.includes(to) ? hidden.filter((h) => h !== to) : [...hidden, to])

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
        📋 {t('Orden y visibilidad de páginas')}
      </p>
      <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
        {t('Define en qué orden aparecen las secciones en el menú y en el recorrido guiado, y oculta las que no quieras mostrar. Los admins siguen viendo las secciones ocultas.')}
      </p>

      <div className="divide-y divide-slate-200 dark:divide-slate-700 rounded-lg border border-slate-200 dark:border-slate-700">
        {items.map((item, i) => (
          <div key={item.to} className="flex items-center gap-1 px-2 py-2 sm:gap-3 sm:px-3">
            <span className="shrink-0 text-lg">{item.icon}</span>
            <span
              className={`min-w-0 flex-1 break-words text-sm ${
                hidden.includes(item.to)
                  ? 'text-slate-400 line-through dark:text-slate-500'
                  : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              {t(item.label)}
            </span>
            {!UNHIDEABLE_PAGES.includes(item.to) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleHidden(item.to)}
                aria-label={hidden.includes(item.to) ? t('Mostrar') : t('Ocultar')}
                title={hidden.includes(item.to) ? t('Mostrar') : t('Ocultar')}
              >
                {hidden.includes(item.to) ? '🙈' : '👁️'}
              </Button>
            )}
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
              { page_order: order, hidden_pages: hidden },
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
              { page_order: null, hidden_pages: [] },
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

  const statusBadges = (user: NonNullable<typeof users>[number]) => (
    <div className="flex flex-wrap gap-2">
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
  )

  const userActions = (user: NonNullable<typeof users>[number]) => (
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
  )

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
          <>
          {/* Celular: una tarjeta por usuario */}
          <div className="divide-y divide-slate-200 dark:divide-slate-700 md:hidden">
            {users.map((user) => (
              <div key={user.id} className="grid gap-2 py-3 text-sm">
                <div className="min-w-0">
                  <p className="break-all font-medium text-slate-800 dark:text-slate-100">{user.email}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user.full_name || '—'}</p>
                </div>
                {statusBadges(user)}
                {userActions(user)}
              </div>
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
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
                    <td className="px-4 py-3">{statusBadges(user)}</td>
                    <td className="px-4 py-3">{userActions(user)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </Card>
    </>
  )
}
