import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/Card'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { useAppConfig } from '@/hooks/useAppConfig'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useAuth } from '@/store/useAuth'
import { useSettings } from '@/store/useSettings'

// 404 para cualquier ruta que no existe. Vive fuera del AppShell (como las
// páginas legales) para verse igual con o sin sesión; el botón lleva al
// Resumen si hay sesión o a la landing si no.

export function NotFoundPage() {
  const { t } = useTranslation()
  const { data: appConfig } = useAppConfig()
  const { pathname } = useLocation()
  const session = useAuth((s) => s.session)
  const lang = useSettings((s) => s.language)
  usePageMeta({ title: t('Página no encontrada'), lang, noindex: true })

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 text-slate-800 dark:text-slate-100">
      <Card className="w-full max-w-md text-center">
        <div className="mb-3 flex justify-center">
          <BrandLogo logoUrl={appConfig?.logo_url} size="h-10 w-10" emojiSize="text-4xl" />
        </div>
        <p className="text-5xl font-bold text-brand-600">404</p>
        <h1 className="mt-2 text-xl font-semibold">{t('Página no encontrada')}</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {t('La página que buscas no existe o cambió de dirección.')}
        </p>
        <p className="mt-1 break-all text-xs text-slate-400 dark:text-slate-500">{pathname}</p>
        <Link
          to="/"
          replace
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          {session ? t('Ir al Resumen') : t('← Volver al inicio')}
        </Link>
      </Card>
    </div>
  )
}
