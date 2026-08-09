import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/Card'
import { activeLocale } from '@/i18n'

// Página pública (sin login) con los Términos y Condiciones. Enlazada desde
// LoginPage y desde la pantalla de consentimiento OAuth de Google
// (App domain → Terms of Service link).

const LAST_UPDATED_ISO = '2026-08-09'
const CONTACT_EMAIL = 'anbl.srz@gmail.com'

type Section = { heading: string; paragraphs: string[] }

const SECTIONS: Section[] = [
  {
    heading: 'Aceptación de los términos',
    paragraphs: [
      'Al crear una cuenta o usar Mi Control de Finanzas Personales ("la app") aceptas estos Términos y Condiciones. Si no estás de acuerdo, no uses la app.',
    ],
  },
  {
    heading: 'Qué es (y qué no es) la app',
    paragraphs: [
      'La app es una herramienta para llevar el registro y la organización de tus finanzas personales: cuentas, tarjetas, transacciones, presupuestos y reportes.',
      'La app no es un banco, una institución financiera, un asesor financiero ni un intermediario de pagos. No movemos tu dinero, no tenemos acceso a tus contraseñas bancarias y no damos asesoría de inversión. La información que muestra la app depende de los datos que tú capturas o autorizas a sincronizar, y puede contener errores o retrasos.',
    ],
  },
  {
    heading: 'Tu cuenta',
    paragraphs: [
      'Debes tener al menos 18 años para crear una cuenta. Eres responsable de mantener segura tu contraseña y de toda la actividad que ocurra en tu cuenta.',
      'La información que registras (cuentas, tarjetas, montos) debe ser información que tengas derecho a compartir; no uses la app para registrar datos financieros de terceros sin su consentimiento, salvo dentro de un plan familiar compartido que tú mismo administras.',
    ],
  },
  {
    heading: 'Uso aceptable',
    paragraphs: [
      'No debes usar la app para actividades ilegales, para intentar acceder a cuentas de otros usuarios sin autorización, ni para interferir con el funcionamiento del servicio.',
    ],
  },
  {
    heading: 'Sincronización con Google y captura de SMS',
    paragraphs: [
      'Las funciones de "Sincronizar correo" (Gmail, solo lectura) y "Sincronizar SMS" (solo Android) son opcionales y requieren tu autorización explícita. Puedes desactivarlas en cualquier momento desde la app. El tratamiento de estos datos se rige por la Política de Privacidad.',
      'Mientras la conexión con Gmail esté en modo de prueba ante Google, solo los correos agregados como "usuarios de prueba" en la consola de Google Cloud podrán usar esa función; esta limitación es de Google, no de la app.',
    ],
  },
  {
    heading: 'Precios',
    paragraphs: [
      'Todas las funciones de la app son gratuitas por el momento. Si en el futuro se introducen planes de pago, se te avisará con anticipación antes de que se te cobre algo.',
    ],
  },
  {
    heading: 'Propiedad intelectual',
    paragraphs: [
      'La app, su diseño, código y marca nos pertenecen. Tú conservas la propiedad de los datos financieros que capturas; nos das permiso únicamente para almacenarlos y procesarlos con el fin de prestarte el servicio.',
    ],
  },
  {
    heading: 'Limitación de responsabilidad',
    paragraphs: [
      'La app se ofrece "tal cual", sin garantías de que esté libre de errores o interrupciones. En la medida permitida por la ley, no somos responsables de decisiones financieras que tomes con base en la información mostrada por la app, ni de pérdidas derivadas de errores de sincronización, del correo o del SMS, o de fallas de servicios de terceros (Google, Supabase, tu banco).',
    ],
  },
  {
    heading: 'Cancelación de tu cuenta',
    paragraphs: [
      'Puedes dejar de usar la app y solicitar la eliminación de tu cuenta y tus datos en cualquier momento escribiendo a {{email}}. Podemos suspender o cancelar cuentas que incumplan estos términos.',
    ],
  },
  {
    heading: 'Cambios a estos términos',
    paragraphs: [
      'Podemos actualizar estos términos ocasionalmente. Publicaremos cualquier cambio en esta misma página con la fecha de actualización correspondiente.',
    ],
  },
  {
    heading: 'Ley aplicable',
    paragraphs: [
      'Estos términos se rigen por las leyes de México, sin perjuicio de los derechos que la legislación de tu país de residencia te reconozca como consumidor.',
    ],
  },
  {
    heading: 'Contacto',
    paragraphs: ['¿Dudas sobre estos términos? Escríbenos a {{email}}.'],
  },
]

export function TermsPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link to="/bienvenida" className="text-xs text-slate-400 dark:text-slate-500 underline">
          {t('← Volver al inicio')}
        </Link>

        <Card className="mt-4">
          <h1 className="text-2xl font-bold">{t('Términos y Condiciones')}</h1>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            {t('Última actualización: {{date}}', {
              date: new Intl.DateTimeFormat(activeLocale(), { dateStyle: 'long' }).format(
                new Date(LAST_UPDATED_ISO),
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
