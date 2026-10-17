import { useEffect, useState } from 'react'
import { PRICES } from '@/lib/pricing'
import { usePlanPerks } from '@/lib/planPerks'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { LinesDiagram } from '@/components/ui/LinesDiagram'
import { Reveal } from '@/components/ui/Reveal'
import { useInView } from '@/hooks/useInView'
import { Landmark, Check, ScanLine, Smartphone, CreditCard, Users, Repeat, Coins, FileSpreadsheet, Moon, ChartNoAxesColumn } from 'lucide-react'
import { useAuth } from '@/store/useAuth'
import { useSendFeedback } from '@/hooks/useFeedback'
import { useLocalePath } from '@/hooks/useLocalePath'
import { APK_URL } from '@/lib/appUpdate'
import { isPlayBuild } from '@/lib/distribution'
import { DataPromises } from './DataPromises'
import { PublicFooter, PublicHeader } from './PublicLayout'
import { PRODUCT_PAGES, type ProductPath } from './productPages'

// Página pública de bienvenida (pre-login). Presenta la app, los planes,
// permite iniciar sesión / crear cuenta, cambiar de idioma, descargar la app y
// enviar comentarios.
//
// Los botones de plan no pueden ir directo a Stripe: create-checkout-session
// exige un JWT y aquí nunca hay sesión (si la hubiera, esta página redirige al
// panel). Por eso llevan a /login?mode=signup&plan=…; LoginPage arrastra ese
// plan hasta /suscripcion?plan=…, que arranca el checkout solo.

type Plan = {
  id: 'free' | 'monthly' | 'yearly'
  name: string
  price: string
  period: string
  note?: string
  highlight?: boolean
  cta: string
  to: string
  perks: string[]
}

function PricingSection() {
  const { t } = useTranslation()
  const { freePerks, premiumPerks } = usePlanPerks()

  const plans: Plan[] = [
    {
      id: 'free',
      name: t('Gratis'),
      price: '$0',
      period: t('para siempre'),
      cta: t('Crear cuenta gratis'),
      to: '/login?mode=signup',
      perks: freePerks,
    },
    {
      id: 'monthly',
      name: t('Premium mensual'),
      price: PRICES.monthly,
      period: t('al mes'),
      note: t('7 días de prueba gratis'),
      highlight: true,
      cta: t('Empezar prueba gratis'),
      to: '/login?mode=signup&plan=monthly',
      perks: premiumPerks,
    },
    {
      id: 'yearly',
      name: t('Premium anual'),
      price: PRICES.yearly,
      period: t('al año'),
      note: t('2 meses gratis'),
      cta: t('Empezar prueba gratis'),
      to: '/login?mode=signup&plan=yearly',
      perks: [
        t('Todo lo del plan mensual'),
        t('Ahorras {{n}} al año', { n: PRICES.yearlySavings }),
        t('7 días de prueba gratis'),
      ],
    },
  ]

  return (
    <section id="planes" className="mx-auto max-w-5xl px-6 py-12">
      <h2 className="mb-2 text-center text-2xl font-bold">{t('Precios: empieza gratis')}</h2>
      <p className="mb-8 text-center text-sm text-slate-600 dark:text-slate-300">
        {t('Empieza gratis. Cambia o cancela cuando quieras.')}
      </p>
      <div className="grid items-start gap-6 sm:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.id}
            className={`relative flex h-full flex-col rounded-lg border bg-surface p-6 shadow-sm ${
              p.highlight
                ? 'border-brand-600 ring-2 ring-brand-600/20 sm:-mt-3 sm:pb-8'
                : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            {p.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
                {t('Más popular')}
              </span>
            )}
            <h3 className="font-semibold">{p.name}</h3>
            <p className="mt-3">
              <span className="text-3xl font-bold">{p.price}</span>
              <span className="ml-1 text-sm text-slate-500 dark:text-slate-400">
                {p.period}
              </span>
            </p>
            {p.note && (
              <p className="mt-1 text-xs font-medium text-brand-600 dark:text-[color-mix(in_srgb,rgb(var(--brand-500))_75%,white)]">
                {p.note}
              </p>
            )}
            <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {p.perks.map((perk, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-line-green" strokeWidth={2.6} />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
            <Link to={p.to} className="mt-6 block">
              <Button
                className="w-full"
                variant={p.highlight ? 'primary' : 'secondary'}
              >
                {p.cta}
              </Button>
            </Link>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
        {t('Los planes de pago se cobran en pesos mexicanos. Cancela desde la app en cualquier momento.')}
      </p>
    </section>
  )
}

function FeedbackForm() {
  const { t } = useTranslation()
  const sendFeedback = useSendFeedback()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  // Campo trampa para bots: invisible para personas; si llega lleno, el
  // servidor responde "enviado" sin mandar nada.
  const [website, setWebsite] = useState('')

  if (sendFeedback.isSuccess) {
    return (
      <div className="rounded-lg border border-line-green/30 bg-line-green/10 p-6 text-center">
        <p className="text-2xl">✅</p>
        <p className="mt-2 text-sm text-line-green">
          {t('¡Gracias! Recibimos tu comentario.')}
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!message.trim()) return
        sendFeedback.mutate({ name, email, message, website })
      }}
      className="space-y-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-surface p-6 shadow-sm"
    >
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px opacity-0"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          placeholder={t('Tu nombre (opcional)')}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          placeholder={t('Tu correo (opcional)')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <textarea
        className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        rows={4}
        placeholder={t('¿Qué te gustaría mejorar o agregar?')}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      {sendFeedback.isError && (
        <p className="text-xs text-line-scarlet">
          {t('No se pudo enviar. Intenta más tarde.')}
        </p>
      )}
      <Button type="submit" disabled={sendFeedback.isPending || !message.trim()}>
        {sendFeedback.isPending ? t('Enviando…') : t('Enviar comentario')}
      </Button>
    </form>
  )
}

export function LandingPage() {
  const { t } = useTranslation()
  const lp = useLocalePath()
  const playBuild = isPlayBuild()
  const { session } = useAuth()
  const { hash } = useLocation()
  const [stepsRef, stepsSeen] = useInView<HTMLOListElement>(0.3)

  // Los enlaces a /#comentarios (p. ej. desde Quiénes somos) llegan de otra ruta: el router
  // no hace scroll al ancla por sí solo.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
  }, [hash])

  // Si ya hay sesión, la landing no aplica: al panel.
  if (session) return <Navigate to="/" replace />

  const steps = [
    { Icon: Landmark, color: 'text-line-scarlet', title: t('Registra tus cuentas y tarjetas'), text: t('Da de alta tus cuentas, tarjetas, fechas de corte y meses sin intereses. Solo tú los ves.') },
    { Icon: ScanLine, color: 'text-line-amber', title: t('Captura tus gastos sin esfuerzo'), text: t('En Android, la app registra tus compras a partir de las notificaciones de tu banco. También puedes escanear tickets o anotarlos a mano.') },
    { Icon: ChartNoAxesColumn, color: 'text-line-green', title: t('Entiende a dónde va tu dinero'), text: t('Revisa tu balance, tus gastos por categoría, tus presupuestos y reportes claros.') },
  ]

  // `page`: la función tiene página propia y se enlaza con su texto descriptivo.
  const features: { Icon: typeof Landmark; title: string; text: string; page?: ProductPath }[] = [
    { Icon: Smartphone, title: t('Captura automática en Android'), text: t('Tus compras se registran solas desde las notificaciones de tu banco, con tu permiso.'), page: '/registrar-gastos-automaticamente' },
    { Icon: ScanLine, title: t('Escaneo de tickets y facturas'), text: t('Toma una foto o sube un PDF y la app extrae el monto, la fecha y el comercio.'), page: '/escanear-tickets' },
    { Icon: CreditCard, title: t('Tarjetas, fechas de corte y MSI'), text: t('Registra tus tarjetas y lleva el control de cortes, pagos y meses sin intereses mes a mes.'), page: '/control-de-tarjetas-y-msi' },
    { Icon: Users, title: t('Presupuestos y plan familiar'), text: t('Pon límites por categoría y comparte con tu familia solo lo que tú elijas.'), page: '/presupuesto-personal-y-familiar' },
    { Icon: Repeat, title: t('Suscripciones'), text: t('Detecta tus suscripciones y te avisa antes de cada cobro.') },
    { Icon: Coins, title: t('Varias monedas'), text: t('Registra en pesos o en la moneda que uses, con conversión automática.') },
    { Icon: FileSpreadsheet, title: t('Exporta e importa'), text: t('Importa tus estados de cuenta y exporta tus movimientos a Excel.') },
    { Icon: Moon, title: t('Modo oscuro e idiomas'), text: t('Español e inglés, claro y oscuro.') },
  ]

  // La pregunta de precios no aplica en Play (ver lib/distribution.ts).
  const faqs = [
    { q: t('¿Es un banco o me da tarjetas de crédito?'), a: t('No. Es una app para llevar el control de tus gastos personales. No ofrecemos cuentas, tarjetas ni crédito: tú registras los tuyos.') },
    { q: t('¿Se conecta a mi banco?'), a: t('No. Nunca te pedimos tu usuario ni tu contraseña del banco. Tú registras tus movimientos, escaneas tus tickets o, en Android, la app los toma de las notificaciones que tu banco te envía al celular.') },
    { q: t('¿Quién puede ver mi información?'), a: t('Solo tú. Si usas el plan familiar, tu familia ve únicamente las tarjetas y los gastos que decidas compartir.') },
    ...(playBuild ? [] : [{ q: t('¿Es gratis?'), a: t('Sí. El plan gratis no vence. Premium cuesta {{monthly}} MXN al mes o {{yearly}} MXN al año, con 7 días de prueba gratis.', { monthly: PRICES.monthly, yearly: PRICES.yearly }) }]),
    { q: t('¿Puedo cancelar cuando quiera?'), a: t('Sí. Cancelas desde la app en cualquier momento y conservas Premium hasta el final del periodo pagado.') },
    { q: t('¿Funciona en iPhone?'), a: t('Sí, desde el navegador; en Safari puedes agregarla a tu pantalla de inicio como una app. La captura automática por notificaciones solo está disponible en Android.') },
    { q: t('¿Cómo registra mis gastos automáticamente?'), a: t('En la app de Android, con tu permiso, lee las notificaciones de compra que tu banco te envía y crea el movimiento por ti. Tú puedes revisarlo o corregirlo.') },
    { q: t('¿En qué monedas funciona?'), a: t('En pesos mexicanos y en otras monedas; convierte los montos a tu moneda principal.') },
  ]

  const linkClass = 'text-brand-700 underline dark:text-[color-mix(in_srgb,rgb(var(--brand-500))_75%,white)]'

  return (
    <div className="min-h-screen bg-canvas text-slate-800 dark:text-slate-100">
      <PublicHeader />

      <main>
        {/* Hero: esmalte medianoche, continuación de la barra superior */}
        <div className="bg-[rgb(8_13_32)] text-white">
          <section className="mx-auto grid max-w-5xl items-center gap-10 px-6 pb-16 pt-10 md:grid-cols-2">
            <div>
              <h1 className="enter text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
                {t('La app para controlar tus gastos personales')}
              </h1>
              <p className="enter mt-4 max-w-md text-pretty text-base text-white/70 sm:text-lg" style={{ '--d': '0.12s' } as React.CSSProperties}>
                {t('Registra ingresos, gastos, cuentas y tarjetas en un solo lugar y entiende a dónde va tu dinero. Tú decides qué registrar; solo tú ves tus datos.')}
              </p>
              <div className="enter mt-8 flex flex-wrap items-center gap-3" style={{ '--d': '0.24s' } as React.CSSProperties}>
                <Link to="/login?mode=signup">
                  <Button size="lg" variant="secondary" className="!border-white !bg-white !text-[rgb(8_13_32)] hover:!bg-white/90">
                    {t('Crear cuenta gratis')}
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="ghost" className="!text-white hover:!bg-white/10">
                    {t('Ya tengo cuenta')}
                  </Button>
                </Link>
              </div>
              {/* En Google Play no se muestran precios ni la descarga del APK
                  (ver lib/distribution.ts). */}
              {!playBuild && (
                <p className="mt-4 text-xs text-white/50">
                  {t('Gratis para empezar. Premium desde {{price}} al mes con 7 días de prueba.', { price: PRICES.monthly })}{' '}
                  <a href="#planes" className="underline hover:text-white">
                    {t('Ver planes')}
                  </a>
                </p>
              )}
            </div>
            <div className="flex justify-center md:justify-end">
              <LinesDiagram className="w-full max-w-md" />
            </div>
          </section>
        </div>

        {/* Cómo funciona: tres estaciones sobre una misma línea */}
        <section className="mx-auto max-w-5xl px-6 py-14">
          <h2 className="mb-10 text-2xl font-bold tracking-tight">{t('Lleva el control de tus gastos en 3 pasos')}</h2>
          <ol ref={stepsRef} className="relative grid gap-8 sm:grid-cols-3">
            <span aria-hidden="true" className="absolute left-[10px] top-3 h-[calc(100%-1.5rem)] w-1 rounded-full bg-slate-200 dark:bg-slate-700 sm:left-3 sm:top-[10px] sm:h-1 sm:w-[calc(100%-1.5rem)]" />
            {/* Tramo recorrido: crece de estación en estación al entrar en pantalla */}
            <span
              aria-hidden="true"
              className={`absolute left-[10px] top-3 w-1 origin-top rounded-full bg-brand-600 transition-transform duration-[1400ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none dark:bg-brand-500 sm:left-3 sm:top-[10px] sm:h-1 sm:w-[calc(100%-1.5rem)] sm:origin-left h-[calc(100%-1.5rem)] ${stepsSeen ? 'scale-100' : 'scale-0'}`}
            />
            {steps.map((s, i) => (
              <Reveal as="li" key={i} delay={i * 220} className="relative pl-10 sm:pl-0 sm:pt-10">
                <span className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full border-4 border-slate-900 bg-white dark:border-white dark:bg-slate-900" />
                <s.Icon className={`h-6 w-6 ${s.color}`} strokeWidth={2} aria-hidden="true" />
                <h3 className="mt-2 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{s.text}</p>
              </Reveal>
            ))}
          </ol>
        </section>

        {/* Funciones */}
        <section className="mx-auto max-w-5xl px-6 py-10">
          <h2 className="mb-8 text-2xl font-bold tracking-tight">{t('Funciones para organizar tu dinero')}</h2>
          <ul className="grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Reveal as="li" key={i} delay={(i % 3) * 90} className="flex items-start gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
                <f.Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-600 dark:text-brand-500" strokeWidth={2} aria-hidden="true" />
                <div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{f.text}</p>
                  {f.page && (
                    <Link to={lp(f.page)} className={`mt-1 inline-block text-sm ${linkClass}`}>
                      {t(PRODUCT_PAGES[f.page].link)}
                    </Link>
                  )}
                </div>
              </Reveal>
            ))}
          </ul>
        </section>

        {/* Privacidad */}
        <section className="mx-auto max-w-5xl px-6 py-10">
          <h2 className="mb-4 text-2xl font-bold tracking-tight">{t('Tus datos son solo tuyos')}</h2>
          <DataPromises />
          <p className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <Link to={lp('/privacidad')} className={linkClass}>{t('Lee nuestra política de privacidad')}</Link>
            <Link to={lp('/quienes-somos')} className={linkClass}>{t('Conoce quién está detrás de la app')}</Link>
          </p>
        </section>

        {/* Planes */}
        {!playBuild && <PricingSection />}

        {/* Descargar app */}
        {!playBuild && (
        <section className="mx-auto max-w-5xl px-6 py-12">
          <div className="rounded-lg bg-[rgb(8_13_32)] px-6 py-10 text-center text-white">
            <h2 className="text-2xl font-bold">{t('Descarga la app para Android')}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-white/90">
              {t('Instálala como app desde tu navegador, o descarga el APK para Android.')}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a href={APK_URL} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="secondary">
                  {t('Descargar app (Android)')}
                </Button>
              </a>
              <Link to="/login?mode=signup">
                <Button size="lg" variant="secondary">
                  {t('Empezar ahora')}
                </Button>
              </Link>
            </div>
            <p className="mx-auto mt-3 max-w-md text-xs text-white/70">
              {t('En Android, permite instalar apps de orígenes desconocidos al abrir el archivo.')}{' '}
              <Link to={lp('/instalar-android')} className="underline hover:text-white">
                {t('Guía para instalar la app en Android')}
              </Link>
            </p>
          </div>
        </section>
        )}

        {/* Preguntas frecuentes */}
        <section className="mx-auto max-w-3xl px-6 py-12">
          <h2 className="mb-6 text-2xl font-bold tracking-tight">{t('Preguntas frecuentes')}</h2>
          <div className="divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-700 dark:border-slate-700">
            {faqs.map((f, i) => (
              <details key={i} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span aria-hidden="true" className="shrink-0 text-xl leading-none text-slate-500 transition-transform group-open:rotate-45 dark:text-slate-400">+</span>
                </summary>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Comentarios */}
        <section id="comentarios" className="mx-auto max-w-2xl px-6 py-12">
          <h2 className="mb-2 text-center text-2xl font-bold">{t('¿Ideas para mejorar?')}</h2>
          <p className="mb-6 text-center text-sm text-slate-600 dark:text-slate-300">
            {t('Cuéntanos qué te gustaría ver en Mi Control de Finanzas Personales. Leemos todos los comentarios.')}
          </p>
          <FeedbackForm />
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
