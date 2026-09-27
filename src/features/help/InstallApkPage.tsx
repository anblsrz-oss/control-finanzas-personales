import { Link, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { useAppConfig } from '@/hooks/useAppConfig'
import { APK_URL } from '@/lib/appUpdate'
import { isPlayBuild } from '@/lib/distribution'
import { GuideFaq, GuidePdfLink, GuideSteps, getGuide } from './guides/GuideSteps'

// Página pública /instalar-android: la necesita quien AÚN no tiene la app
// (por eso no pide sesión). Solo existe en web y APK de GitHub; en Google Play
// no se ofrece la descarga del APK (ver lib/distribution.ts).
export function InstallApkPage() {
  const { t } = useTranslation()
  const { data: appConfig } = useAppConfig()

  if (isPlayBuild()) return <Navigate to="/bienvenida" replace />

  const guide = getGuide('instalar-apk')

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link to="/bienvenida" className="text-xs text-slate-400 dark:text-slate-500 underline">
          {t('← Volver al inicio')}
        </Link>

        <Card className="mt-4 grid gap-3">
          <div>
            <BrandLogo logoUrl={appConfig?.logo_url} size="h-9 w-9" emojiSize="text-3xl" />
          </div>
          <h1 className="text-2xl font-bold">{t(guide.title)}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">{t(guide.intro)}</p>
          <div className="flex flex-wrap items-center gap-3">
            <a href={APK_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg">⬇️ {t('Descargar app (Android)')}</Button>
            </a>
            <GuidePdfLink id="instalar-apk" />
          </div>
        </Card>

        <Card className="mt-4">
          <GuideSteps id="instalar-apk" />
        </Card>

        <Card className="mt-4 grid gap-3">
          <h2 className="text-base font-semibold">{t('Dudas comunes de la instalación')}</h2>
          <GuideFaq id="instalar-apk" />
        </Card>
      </div>
    </div>
  )
}
