import { useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { BrandBatteryGuide } from './BrandBatteryGuide'

interface FaqItem {
  id: string
  q: string
  a: ReactNode
}

interface FaqTopic {
  id: string
  icon: string
  title: string
  intro?: string
  items: FaqItem[]
}

// Un tema por función. Para sumar ayuda de otra sección, agrega otro objeto
// aquí: la página ya se encarga del acordeón, del enlace directo por #id y
// de la traducción. Los textos van en español (la clave de i18n es el propio
// texto, ver i18n/index.ts).
function buildTopics(t: (key: string, opts?: Record<string, unknown>) => string): FaqTopic[] {
  const p = 'text-sm text-slate-600 dark:text-slate-300'
  return [
    {
      id: 'captura-notificaciones',
      icon: '🔔',
      title: t('Captura por notificaciones'),
      intro: t('Registra solos los cargos que te avisan las apps de tu banco, wallet o tiendas. Solo en Android.'),
      items: [
        {
          id: 'que-es',
          q: t('¿Qué es y cómo funciona?'),
          a: (
            <div className="grid gap-2">
              <p className={p}>
                {t('Cuando tu banco o una app como Mercado Pago te avisa de una compra con una notificación en el teléfono, la app puede leer ese aviso y registrar el movimiento sola, sin que tengas que abrirla ni capturarlo a mano. Es el mismo principio que la captura por SMS, pero para bancos y fintechs que ya no mandan mensajes de texto y solo avisan por su propia app.')}
              </p>
            </div>
          ),
        },
        {
          id: 'activar',
          q: t('¿Cómo la activo?'),
          a: (
            <ol className={`grid gap-1.5 ${p}`}>
              <li>{t('1. Entra a "Captura por notificaciones" desde el menú.')}</li>
              <li>{t('2. En "Acceso a notificaciones", dale a "Dar acceso a notificaciones". Se abre una pantalla de Ajustes de Android: busca esta app en la lista y actívala ahí.')}</li>
              <li>{t('3. En "Apps que se escuchan", marca tu banco, tu wallet o las tiendas cuyos avisos quieres capturar. Los bancos conocidos ya vienen premarcados.')}</li>
              <li>{t('4. Dale a "Activar captura automática".')}</li>
              <li className="mt-1 font-medium text-amber-700 dark:text-amber-400">
                {t('Ojo: en la mayoría de los teléfonos esto no basta. Revisa la pregunta "No se registró un cargo" de abajo: casi todos necesitan un ajuste extra de batería.')}
              </li>
            </ol>
          ),
        },
        {
          id: 'privacidad',
          q: t('¿Qué datos se leen y cuáles se guardan?'),
          a: (
            <ul className={`grid list-disc gap-1.5 pl-5 ${p}`}>
              <li>{t('Solo se leen las notificaciones de las apps que tú marques, y solo se envían al servidor las que traen un monto.')}</li>
              <li>{t('No se leen las de apps que no marcaste (WhatsApp, redes sociales…) ni los avisos sin monto.')}</li>
              <li>{t('Se guarda el movimiento detectado: monto, fecha, comercio y de qué app vino. El texto original de la notificación no se guarda.')}</li>
            </ul>
          ),
        },
        {
          id: 'duplicados',
          q: t('¿Qué pasa si el mismo cargo llega por notificación, SMS y correo?'),
          a: (
            <div className="grid gap-2">
              <p className={p}>{t('La app compara monto, moneda y hora entre los tres canales:')}</p>
              <ul className={`grid list-disc gap-1.5 pl-5 ${p}`}>
                <li>{t('Si coincide todo y llegan con menos de 10 minutos de diferencia, se registra una sola vez y se juntan los datos (el banco aporta la cuenta, la tienda aporta el comercio).')}</li>
                <li>{t('Si coincide pero con más diferencia de tiempo o entre cuentas distintas, se registra igual pero marcado como "Posible duplicado" en Transacciones, con botones para decir si es el mismo cargo o no.')}</li>
                <li>{t('Dos avisos de la misma app con el mismo monto (dos cafés del mismo precio) nunca se fusionan: se registran como dos movimientos.')}</li>
              </ul>
            </div>
          ),
        },
        {
          id: 'no-funciona',
          q: t('No se registró un cargo. ¿Qué hago?'),
          a: (
            <div className="grid gap-3">
              <p className={p}>
                {t('Si ya diste el permiso y marcaste tu banco pero un cargo real no aparece, casi siempre es el propio teléfono cerrando la app en segundo plano para "ahorrar batería". Busca tu marca y sigue los pasos.')}
              </p>
              <BrandBatteryGuide />
              <p className={`${p} rounded-lg bg-brand-50 dark:bg-brand-800/40 px-3 py-2`}>
                {t('Para saber si es el teléfono o algo más: en "Captura por notificaciones" mira "Últimos avisos recibidos". Si está vacío después de un cargo real, el aviso ni siquiera llegó al servidor: es un ajuste del teléfono, no un error de la app.')}
              </p>
            </div>
          ),
        },
        {
          id: 'sigue-sin-funcionar',
          q: t('Ya hice los ajustes de batería y sigue sin funcionar'),
          a: (
            <p className={p}>
              {t('El truco que más veces lo resuelve, incluso después de ajustar la batería, es desinstalar la app y volver a instalarla: fuerza al sistema a registrar el permiso desde cero. Mientras tanto, esos cargos no se pierden: puedes seguir registrándolos con "Importar" o capturándolos a mano.')}
            </p>
          ),
        },
        {
          id: 'iphone',
          q: t('¿Funciona en iPhone?'),
          a: (
            <div className="grid gap-2">
              <p className={p}>
                {t('No. Por un lado, Apple no permite que una app lea las notificaciones de otras apps. Por otro, en iPhone solo se pueden instalar apps desde la App Store y esta app todavía no está publicada ahí, así que no hay una app que descargar para iPhone.')}
              </p>
              <p className={p}>
                {t('Lo que sí puedes hacer en iPhone es usar la versión web desde Safari (puedes agregarla a tu pantalla de inicio con Compartir → "Agregar a inicio") y, desde ahí, usar "Sincronizar correo" o "Importar" tu estado de cuenta.')}
              </p>
            </div>
          ),
        },
        {
          id: 'compras',
          q: t('¿Y las apps de compras, como Amazon o Rappi?'),
          a: (
            <p className={p}>
              {t('Sus avisos siempre entran como pendientes, porque por sí solos no confirman que el cobro ya se hizo. Si después llega el aviso del banco por ese mismo monto, se juntan: el banco aporta la cuenta y la tienda aporta el nombre del comercio.')}
            </p>
          ),
        },
        {
          id: 'cuenta-categoria',
          q: t('¿Puedo cambiar la cuenta o la categoría con la que entra un cargo?'),
          a: (
            <p className={p}>
              {t('Sí. En "Apps que se escuchan", dale a "Ajustes" junto a cualquier app marcada para fijar una cuenta por defecto (para cuando el aviso no menciona la terminación de tu tarjeta) y una categoría fija.')}
            </p>
          ),
        },
      ],
    },
  ]
}

function FaqTopicCard({ topic, autoOpen }: { topic: FaqTopic; autoOpen: boolean }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(true)
  const [openItem, setOpenItem] = useState<string | null>(autoOpen ? 'no-funciona' : null)

  return (
    <div id={topic.id} className="scroll-mt-4">
    <Card className="grid gap-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center justify-between gap-3 text-left"
      >
        <span>
          <span className="block text-base font-semibold text-slate-800 dark:text-slate-100">
            {topic.icon} {topic.title}
          </span>
          {topic.intro && (
            <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
              {topic.intro}
            </span>
          )}
        </span>
        <span className="shrink-0 text-xs font-medium text-brand-700 dark:text-brand-500">
          {open ? t('▲ Ocultar') : t('▼ Mostrar')}
        </span>
      </button>

      {open && (
        <div className="grid">
          {topic.items.map((item) => {
            const isOpen = openItem === item.id
            return (
              <div
                key={item.id}
                className="border-t border-slate-100 dark:border-slate-700/60 py-2"
              >
                <button
                  type="button"
                  onClick={() => setOpenItem(isOpen ? null : item.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-3 py-1 text-left text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  {item.q}
                  <span className="shrink-0 text-xs text-slate-400">{isOpen ? '▲' : '▼'}</span>
                </button>
                {isOpen && <div className="pb-1 pt-1.5">{item.a}</div>}
              </div>
            )
          })}
        </div>
      )}
    </Card>
    </div>
  )
}

export function HelpFaqPage() {
  const { t } = useTranslation()
  const { hash } = useLocation()
  const topics = buildTopics(t)
  const targetId = hash.replace(/^#/, '')

  // Enlace directo (p. ej. /ayuda#captura-notificaciones desde la página de
  // esa función): llevar la vista al tema pedido.
  useEffect(() => {
    if (!targetId) return
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [targetId])

  return (
    <>
      <PageHeader
        title={t('Preguntas frecuentes')}
        subtitle={t('Respuestas rápidas y guías paso a paso para sacarle provecho a la app.')}
        helpId="ayuda"
        tourTarget="ayuda"
      />
      <div className="grid gap-4">
        {topics.map((topic) => (
          <FaqTopicCard key={topic.id} topic={topic} autoOpen={topic.id === targetId} />
        ))}
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {t('¿No encuentras lo que buscas? Cada sección de la app tiene un botón "?" con una explicación corta de lo que hace.')}{' '}
          <Link to="/" className="text-brand-700 dark:text-brand-500 hover:underline">
            {t('Volver al resumen')}
          </Link>
        </p>
      </div>
    </>
  )
}
