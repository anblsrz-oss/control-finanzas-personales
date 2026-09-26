import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/Card'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { useAppConfig } from '@/hooks/useAppConfig'
import { activeLocale } from '@/i18n'

// Página pública (sin login) con la Política de Cookies. La app no pone
// cookies propias: la sesión de Supabase y las preferencias viven en
// localStorage/sessionStorage y todo es estrictamente necesario, por eso no
// hay banner de consentimiento. Si algún día se agrega analítica o rastreo,
// hay que actualizar esta página y agregar el banner.

const LAST_UPDATED_ISO = '2026-09-24'
const CONTACT_EMAIL = 'anbl.srz@gmail.com'

type Section = { heading: string; paragraphs: string[] }

const SECTIONS: Section[] = [
  {
    heading: 'Resumen',
    paragraphs: [
      'Mi Control de Finanzas Personales no usa cookies propias, ni cookies de rastreo, publicidad o analítica. Tampoco usamos herramientas que sigan lo que haces en otros sitios.',
    ],
  },
  {
    heading: 'Qué guardamos en tu navegador',
    paragraphs: [
      'Para funcionar, la app guarda algunos datos en el almacenamiento local de tu navegador (localStorage y sessionStorage), que no se envían a otros sitios:',
      'Tu sesión: el token de inicio de sesión, para que no tengas que volver a entrar cada vez que abres la app.',
      'Tus preferencias: tema claro/oscuro, idioma, tipo de gráficas, si ocultas los montos y otras opciones de la app.',
      'El progreso del tutorial y de las novedades que ya viste.',
      'Un dato temporal mientras conectas tu correo o tu calendario, que se borra al cerrar la pestaña.',
      'Todo esto es necesario para que la app funcione, así que no pedimos consentimiento para guardarlo. No lo usamos para identificarte fuera de la app ni para publicidad.',
    ],
  },
  {
    heading: 'Sitios de terceros',
    paragraphs: [
      'Cuando pagas Premium en la web te llevamos a la página de pago de Stripe (en la app de Google Play el pago lo hace Google Play), y cuando conectas Google o Microsoft, a sus páginas de inicio de sesión. Esos sitios pueden usar sus propias cookies, que se rigen por sus políticas de privacidad, no por esta.',
    ],
  },
  {
    heading: 'Cómo borrar estos datos',
    paragraphs: [
      'Al cerrar sesión se borra tu sesión. Para borrar todo lo demás, elimina los datos de este sitio desde la configuración de tu navegador; ten en cuenta que perderás tus preferencias y tendrás que volver a iniciar sesión.',
    ],
  },
  {
    heading: 'Cambios a esta política',
    paragraphs: [
      'Si en el futuro usamos cookies que no sean necesarias (por ejemplo, de analítica), actualizaremos esta página y te pediremos tu consentimiento antes de usarlas.',
    ],
  },
  {
    heading: 'Contacto',
    paragraphs: ['¿Dudas sobre esta política? Escríbenos a {{email}}.'],
  },
]

export function CookiePolicyPage() {
  const { t } = useTranslation()
  const { data: appConfig } = useAppConfig()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link to="/bienvenida" className="text-xs text-slate-400 dark:text-slate-500 underline">
          {t('← Volver al inicio')}
        </Link>

        <Card className="mt-4">
          <div className="mb-2">
            <BrandLogo logoUrl={appConfig?.logo_url} size="h-9 w-9" emojiSize="text-3xl" />
          </div>
          <h1 className="text-2xl font-bold">{t('Política de Cookies')}</h1>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            {t('Última actualización: {{date}}', {
              date: new Intl.DateTimeFormat(activeLocale(), { dateStyle: 'long' }).format(
                new Date(`${LAST_UPDATED_ISO}T12:00:00`),
              ),
            })}
          </p>

          <div className="mt-6 space-y-6">
            {SECTIONS.map((section) => (
              <section key={section.heading}>
                <h2 className="text-lg font-semibold">{t(section.heading)}</h2>
                <div className="mt-2 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {section.paragraphs.map((p) => (
                    <p key={p}>{t(p, { email: CONTACT_EMAIL })}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
