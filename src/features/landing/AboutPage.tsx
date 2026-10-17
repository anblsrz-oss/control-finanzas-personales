import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLocalePath } from '@/hooks/useLocalePath'
import { DataPromises } from './DataPromises'
import { PublicLayout } from './PublicLayout'

// Quiénes somos (copy.md §3). El contacto es provisional: remite al formulario de la landing.
export function AboutPage() {
  const { t } = useTranslation()
  const lp = useLocalePath()
  const linkClass = 'text-brand-700 underline dark:text-[color-mix(in_srgb,rgb(var(--brand-500))_75%,white)]'

  return (
    <PublicLayout>
      <article className="mx-auto max-w-3xl px-6 py-12">
        <Link to={lp('/')} className={`text-sm ${linkClass}`}>
          {t('← Volver al inicio')}
        </Link>
        <h1 className="mt-6 text-balance text-3xl font-bold tracking-tight sm:text-4xl">{t('Quiénes somos')}</h1>
        <p className="mt-4 text-pretty text-lg text-slate-600 dark:text-slate-300">
          {t('Mi Control de Finanzas Personales es una app desarrollada por ALCE-Soft (alce-soft.com). La creamos para que cualquier persona sepa a dónde va su dinero sin depender de hojas de cálculo ni entregar el acceso a su banco.')}
        </p>

        <section className="mt-10">
          <h2 className="text-xl font-bold tracking-tight">{t('Qué es y qué no es')}</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            {t('Es una herramienta para registrar y entender tus gastos. No es un banco ni una fintech: no damos cuentas, tarjetas ni crédito, y no movemos tu dinero.')}
          </p>
        </section>

        <section className="mt-10">
          <h2 className="mb-3 text-xl font-bold tracking-tight">{t('Nuestro compromiso con tus datos')}</h2>
          <DataPromises />
          <p className="mt-4 text-sm">
            <Link to={lp('/privacidad')} className={linkClass}>{t('Lee nuestra política de privacidad')}</Link>
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold tracking-tight">{t('Contacto')}</h2>
          <p className="mt-2">
            {t('Escríbenos a')}{' '}
            <a href="mailto:soporte@controlfinanzaspersonales.com" className={linkClass}>
              soporte@controlfinanzaspersonales.com
            </a>{' '}
            {t('o usa el')}{' '}
            <Link to={lp('/#comentarios')} className={linkClass}>
              {t('formulario de comentarios de la página principal')}
            </Link>
            .
          </p>
        </section>
      </article>
    </PublicLayout>
  )
}
