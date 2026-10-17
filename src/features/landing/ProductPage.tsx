import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { useLocalePath } from '@/hooks/useLocalePath'
import { PublicLayout } from './PublicLayout'
import { PRODUCT_PAGES, type ProductPath } from './productPages'

// Un solo componente para las 4 páginas de producto; el contenido sale de productPages.ts.
export function ProductPage({ path }: { path: ProductPath }) {
  const { t } = useTranslation()
  const lp = useLocalePath()
  const page = PRODUCT_PAGES[path]
  const others = (Object.keys(PRODUCT_PAGES) as ProductPath[]).filter((p) => p !== path)

  return (
    <PublicLayout>
      <article className="mx-auto max-w-3xl px-6 py-12">
        <Link to={lp('/')} className="text-sm text-brand-700 underline dark:text-[color-mix(in_srgb,rgb(var(--brand-500))_75%,white)]">
          {t('← Volver al inicio')}
        </Link>
        <h1 className="mt-6 text-balance text-3xl font-bold tracking-tight sm:text-4xl">{t(page.h1)}</h1>
        <p className="mt-4 text-pretty text-lg text-slate-600 dark:text-slate-300">{t(page.intro)}</p>

        {page.sections.map((s) => (
          <section key={s.h2} className="mt-10">
            <h2 className="text-xl font-bold tracking-tight">{t(s.h2)}</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">{t(s.text)}</p>
          </section>
        ))}

        {page.note && <p className="mt-8 text-sm text-slate-600 dark:text-slate-300">{t(page.note)}</p>}

        <div className="mt-10">
          <Link to="/login?mode=signup">
            <Button size="lg">{t('Crear cuenta gratis')}</Button>
          </Link>
        </div>

        <nav aria-labelledby="mas-paginas" className="mt-14 border-t border-slate-200 pt-6 dark:border-slate-700">
          <h2 id="mas-paginas" className="text-base font-semibold">{t('También te puede interesar')}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {others.map((p) => (
              <li key={p}>
                <Link to={lp(p)} className="text-brand-700 underline dark:text-[color-mix(in_srgb,rgb(var(--brand-500))_75%,white)]">
                  {t(PRODUCT_PAGES[p].link)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </article>
    </PublicLayout>
  )
}
