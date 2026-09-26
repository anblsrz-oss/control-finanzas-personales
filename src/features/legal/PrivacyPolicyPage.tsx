import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/Card'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { useAppConfig } from '@/hooks/useAppConfig'
import { activeLocale } from '@/i18n'

// Página pública (sin login) con la Política de Privacidad. Debe existir en
// una URL pública para poder registrarla en la pantalla de consentimiento
// OAuth de Google. Incluye la cláusula de "Limited Use" que Google exige
// cuando una app pide scopes de Gmail (gmail.readonly).

const LAST_UPDATED_ISO = '2026-09-26'
const CONTACT_EMAIL = 'anbl.srz@gmail.com'

type Section = { heading: string; paragraphs: string[]; link?: { to: string; label: string } }

const SECTIONS: Section[] = [
  {
    heading: 'Quiénes somos',
    paragraphs: [
      'Mi Control de Finanzas Personales ("la app", "nosotros") es una aplicación de finanzas personales que te ayuda a organizar ingresos, gastos, cuentas, tarjetas y presupuestos. Esta política explica qué datos recopilamos, cómo los usamos y qué derechos tienes sobre ellos.',
    ],
  },
  {
    heading: 'Qué datos recopilamos',
    paragraphs: [
      'Datos de cuenta: nombre, correo electrónico y, si inicias sesión con Google, tu nombre y correo asociados a tu cuenta de Google.',
      'Datos financieros que capturas tú mismo: cuentas, tarjetas, líneas de crédito, transacciones, categorías, presupuestos y montos, ya sea escritos a mano, importados desde un archivo, o extraídos de un recibo/factura que fotografías o subes.',
      'Datos de sincronización opcional por correo: si activas "Sincronizar correo" y conectas tu cuenta de Gmail, la app lee únicamente los mensajes que coinciden con reglas de remitente que tú configuras (por ejemplo, notificaciones de tu banco o de servicios como Xsolla/EBANX), extrae de ellos los datos de una transacción (monto, fecha, concepto) y no guarda el contenido completo del correo.',
      'Datos de sincronización opcional por SMS (solo Android): si activas "Sincronizar SMS", la app lee los mensajes de texto entrantes para detectar avisos de transacciones bancarias y extraer monto, fecha y concepto; no se sube ni se comparte el contenido completo del SMS ni los mensajes que no correspondan a movimientos financieros.',
      'Datos de captura opcional por notificaciones (solo Android): si activas "Captura por notificaciones" y le das a la app el "Acceso a notificaciones" de Android, la app lee únicamente las notificaciones de las apps que tú marcas (por ejemplo, la de tu banco) y solo envía al servidor las que traen un monto, para extraer monto, fecha, comercio y terminación de tarjeta; el texto de la notificación no se guarda y las notificaciones de otras apps no se leen.',
      'Datos de sincronización opcional por Outlook: si conectas tu cuenta de Microsoft (Outlook/Hotmail) en "Sincronizar correo", la app la usa con permiso de solo lectura, con las mismas reglas de remitente y el mismo tratamiento que Gmail.',
      'Datos de Google Calendar: si conectas Google Calendar, la app crea eventos de recordatorio (cobros de suscripciones y pagos de tarjeta) en tu calendario; no lee tus otros eventos.',
      'Datos de pago: si contratas Premium, el pago lo procesa Stripe o Google Play. Nosotros solo guardamos el identificador de cliente de Stripe o el token de compra de Google Play y el estado de tu suscripción (plan, vigencia, periodo de prueba); nunca vemos ni guardamos el número de tu tarjeta.',
      'Datos de uso: información técnica básica para el funcionamiento de la app (por ejemplo, idioma preferido, tema claro/oscuro, y registros de error para poder corregir fallas).',
    ],
  },
  {
    heading: 'Uso de datos obtenidos mediante las APIs de Google',
    paragraphs: [
      'El uso y la transferencia de información recibida desde las APIs de Google por parte de Mi Control de Finanzas Personales se ajustará a la Política de Datos de Usuario de los Servicios de API de Google (Google API Services User Data Policy), incluidos los requisitos de Uso Limitado ("Limited Use").',
      'En concreto: el acceso de solo lectura a Gmail (scope gmail.readonly) se usa exclusivamente para detectar transacciones financieras en los correos que coinciden con las reglas de remitente que tú configuras dentro de la app. No usamos estos datos para publicidad, no los vendemos, no los compartimos con terceros salvo lo necesario para operar el servicio (ver "Con quién compartimos tus datos"), y ningún humano lee tu correo salvo que sea estrictamente necesario para dar soporte técnico que tú mismo solicites, para cumplir la ley, o para investigar un uso indebido.',
      'El permiso de Google Calendar (scope calendar.events) se usa exclusivamente para crear, actualizar y eliminar los eventos de recordatorio que la propia app genera (cobros de suscripciones y pagos de tarjeta); no leemos ni modificamos los demás eventos de tu calendario. Los datos recibidos de Gmail y de Google Calendar no se usan para desarrollar, mejorar ni entrenar modelos de inteligencia artificial o de aprendizaje automático, ni generalizados ni personalizados.',
      'Puedes revocar el acceso de la app a tu cuenta de Google en cualquier momento desde la configuración de tu cuenta de Google (myaccount.google.com/permissions) o desde la sección "Sincronizar correo" dentro de la app.',
    ],
  },
  {
    heading: 'Cómo usamos tus datos',
    paragraphs: [
      'Usamos tus datos para operar la app: mostrar tus saldos, transacciones, reportes y presupuestos; enviarte notificaciones relacionadas con tu cuenta; y responder a tus comentarios o solicitudes de soporte.',
      'No usamos tus datos financieros para publicidad ni los vendemos a terceros.',
    ],
  },
  {
    heading: 'Con quién compartimos tus datos',
    paragraphs: [
      'Usamos Supabase como proveedor de infraestructura (base de datos, autenticación y funciones del servidor) para operar la app; Supabase procesa los datos en nuestro nombre bajo sus propias medidas de seguridad, y no los usa para sus propios fines.',
      'Cuando inicias sesión con Google, o conectas Gmail, compartimos información con Google únicamente en la medida necesaria para autenticarte o para leer los correos que tú autorizas, conforme a esta política.',
      'Si conectas Outlook, compartimos información con Microsoft únicamente en la medida necesaria para leer los correos que tú autorizas.',
      'Si contratas Premium, Stripe o Google Play reciben los datos necesarios para cobrarte (correo, datos de la tarjeta o del medio de pago que capturas directamente en su página) y los tratan conforme a su propia política de privacidad.',
      'No compartimos tus datos financieros con anunciantes ni los vendemos a terceros.',
    ],
  },
  {
    heading: 'Retención y eliminación de datos',
    paragraphs: [
      'Conservamos tus datos mientras tu cuenta esté activa. Puedes exportar tus transacciones a Excel en cualquier momento desde la app.',
      'Puedes eliminar tu cuenta y todos tus datos en cualquier momento desde la app (Configuración → Eliminar mi cuenta). El borrado es inmediato y definitivo: se eliminan tus movimientos, cuentas, tarjetas, presupuestos, reglas y conexiones de correo o calendario, se revoca el acceso a Google y se cancela tu suscripción Premium si la tienes. También puedes pedirlo escribiéndonos a {{email}}.',
    ],
    link: { to: '/eliminar-cuenta', label: 'Cómo eliminar tu cuenta' },
  },
  {
    heading: 'Seguridad',
    paragraphs: [
      'Tus datos se transmiten mediante conexiones cifradas (HTTPS) y se almacenan con controles de acceso a nivel de fila (row-level security), de modo que cada usuario solo puede ver su propia información o la de una familia/cuenta compartida a la que fue invitado explícitamente.',
    ],
  },
  {
    heading: 'Cookies y almacenamiento local',
    paragraphs: [
      'La app no usa cookies de rastreo, publicidad ni analítica. Solo guarda en tu navegador lo necesario para funcionar (tu sesión y tus preferencias). Los detalles están en la Política de Cookies.',
    ],
    link: { to: '/cookies', label: 'Ver la Política de Cookies' },
  },
  {
    heading: 'Tus derechos',
    paragraphs: [
      'Puedes acceder, corregir, exportar o solicitar la eliminación de tus datos personales en cualquier momento, ya sea desde la propia app (sección "Configuración") o escribiéndonos a {{email}}.',
    ],
  },
  {
    heading: 'Menores de edad',
    paragraphs: [
      'La app no está dirigida a menores de 18 años y no recopilamos intencionalmente datos de menores.',
    ],
  },
  {
    heading: 'Cambios a esta política',
    paragraphs: [
      'Podemos actualizar esta política ocasionalmente. Publicaremos cualquier cambio en esta misma página con la fecha de actualización correspondiente.',
    ],
  },
  {
    heading: 'Contacto',
    paragraphs: ['¿Dudas sobre esta política? Escríbenos a {{email}}.'],
  },
]

export function PrivacyPolicyPage() {
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
          <h1 className="text-2xl font-bold">{t('Política de Privacidad')}</h1>
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
                  {section.link && (
                    <p>
                      <Link to={section.link.to} className="underline text-brand-700 dark:text-brand-500">
                        {t(section.link.label)}
                      </Link>
                    </p>
                  )}
                </div>
              </section>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
