import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { useSettings } from '@/store/useSettings'
import { useAppConfig } from '@/hooks/useAppConfig'
import { useLocalePath } from '@/hooks/useLocalePath'
import { localePath } from '@/lib/seoRoutes'

// Cabecera y pie compartidos por las páginas públicas (landing, producto, Quiénes somos).

function LanguageToggle() {
  const { setLanguage } = useSettings()
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  // El idioma efectivo es el de la URL (/ es, /en en); ver RouteMeta.
  const language = i18n.language
  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-slate-300 dark:border-slate-600 text-xs">
      {(['es', 'en'] as const).map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => {
            // Se guarda como preferencia (el usuario la eligió) y se va a la URL equivalente.
            setLanguage(lng)
            navigate(localePath(pathname, lng))
          }}
          className={`px-3 py-1.5 font-medium transition-colors ${
            language === lng
              ? 'bg-brand-600 text-white'
              : 'bg-surface text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

/** Barra superior sobre esmalte medianoche (la landing la continúa con su hero). */
export function PublicHeader() {
  const { t } = useTranslation()
  const lp = useLocalePath()
  const { data: appConfig } = useAppConfig()
  return (
    <div className="bg-[rgb(8_13_32)] text-white">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link to={lp('/')} className="flex items-center gap-2 text-base font-bold sm:text-lg">
          <BrandLogo logoUrl={appConfig?.logo_url} size="h-7 w-7" /> Mi Control de Finanzas Personales
        </Link>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <Link to="/login" className="inline-flex">
            <Button variant="secondary" size="sm">
              {t('Iniciar sesión')}
            </Button>
          </Link>
        </div>
      </header>
    </div>
  )
}

export function PublicFooter() {
  const { t } = useTranslation()
  const lp = useLocalePath()
  const link = 'underline hover:text-slate-700 dark:hover:text-slate-200'
  return (
    <footer className="border-t border-slate-200 dark:border-slate-700 px-6 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
      <p>© {t('Mi Control de Finanzas Personales — Finanzas personales.')}</p>
      <p className="mt-2 space-x-3">
        <Link to={lp('/quienes-somos')} className={link}>{t('Quiénes somos')}</Link>
        <span aria-hidden="true">·</span>
        <Link to={lp('/terminos')} className={link}>{t('Términos y Condiciones')}</Link>
        <span aria-hidden="true">·</span>
        <Link to={lp('/privacidad')} className={link}>{t('Política de Privacidad')}</Link>
        <span aria-hidden="true">·</span>
        <Link to={lp('/cookies')} className={link}>{t('Política de Cookies')}</Link>
      </p>
      <p className="mt-2">
        <a href="https://alce-soft.com" target="_blank" rel="noopener" className={link}>
          {t('Hecho por ALCE-Soft')}
        </a>
      </p>
    </footer>
  )
}

/** Marco de las páginas públicas sin hero propio: cabecera, <main> y pie. */
export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas text-slate-800 dark:text-slate-100">
      <PublicHeader />
      <main>{children}</main>
      <PublicFooter />
    </div>
  )
}
