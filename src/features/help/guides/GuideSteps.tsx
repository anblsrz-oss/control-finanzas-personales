import { useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import data from './guides.data.json'

// Guías con imágenes (instalar APK, conectar correo, activar notificaciones).
// El contenido vive en guides.data.json y lo comparte el script que genera los
// PDF (scripts/build-guides.mjs): así la app y el PDF dicen exactamente lo
// mismo. Las imágenes van en public/guias/ (las producen los scripts).

// Mientras Google no termine de verificar la app: pasos y avisos de "Google no
// ha verificado esta app", lista de usuarios de prueba y reconexión cada 7
// días. Al pasar a producción, ponerlo en false (y quitar los dos avisos de
// modo de prueba de EmailSyncPage).
export const GOOGLE_UNVERIFIED = true

export const GUIDE_CONTACT: string = data.contact
export const APK_GUIDE_PATH = '/instalar-android'

export type GuideId = keyof typeof data.guides

interface GuideStep {
  text: string
  image?: string
  unverified?: boolean
}

interface GuideFaq {
  q: string
  a: string
  unverified?: boolean
}

export interface Guide {
  pdf: string
  title: string
  intro: string
  prereq?: { text: string; unverified?: boolean }
  steps: GuideStep[]
  faq: GuideFaq[]
}

export function getGuide(id: GuideId): Guide {
  return data.guides[id] as Guide
}

export function guidePdfUrl(id: GuideId): string {
  return `/guias/${getGuide(id).pdf}`
}

/** **negrita** → <strong>. */
export function renderRich(text: string): ReactNode {
  return text.split('**').map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-slate-800 dark:text-slate-100">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}

/** Enlace de descarga del PDF de una guía. */
export function GuidePdfLink({ id }: { id: GuideId }) {
  const { t } = useTranslation()
  return (
    <a
      href={guidePdfUrl(id)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex w-fit items-center gap-1 text-xs font-medium text-brand-700 dark:text-brand-500 hover:underline"
    >
      ⬇️ {t('Descargar PDF con imágenes')}
    </a>
  )
}

export function ZoomableImage({ src, alt }: { src: string; alt: string }) {
  const { t } = useTranslation()
  const [failed, setFailed] = useState(false)
  const [zoom, setZoom] = useState(false)

  useEffect(() => {
    if (!zoom) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setZoom(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zoom])

  // Sin imagen (aún no generada): el paso se muestra solo con texto.
  if (failed) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setZoom(true)}
        aria-label={t('Ampliar imagen')}
        className="mt-2 block w-fit cursor-zoom-in"
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className="max-h-96 w-auto max-w-full rounded-lg border border-slate-200 dark:border-slate-700"
        />
      </button>
      {zoom && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setZoom(false)}
          className="fixed inset-0 z-[100] flex cursor-zoom-out items-center justify-center bg-black/80 p-4"
        >
          <img src={src} alt={alt} className="max-h-full max-w-full rounded-lg" />
        </div>
      )}
    </>
  )
}

const TEXT = 'text-sm text-slate-600 dark:text-slate-300'
const VARS = { contact: GUIDE_CONTACT }

/** Pasos numerados con imagen (y el aviso previo, si la guía lo tiene). */
export function GuideSteps({ id, showIntro = false }: { id: GuideId; showIntro?: boolean }) {
  const { t } = useTranslation()
  const guide = getGuide(id)
  const steps = guide.steps.filter((s) => GOOGLE_UNVERIFIED || !s.unverified)

  return (
    <div className="grid gap-3">
      {showIntro && <p className={TEXT}>{t(guide.intro)}</p>}
      {guide.prereq && (GOOGLE_UNVERIFIED || !guide.prereq.unverified) && (
        <p className="rounded-lg bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-sm text-amber-800 dark:text-amber-300">
          {renderRich(t(guide.prereq.text, VARS))}
        </p>
      )}
      <ol className="grid gap-4">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
              {i + 1}
            </span>
            <div className={`min-w-0 ${TEXT}`}>
              <p>{renderRich(t(step.text, VARS))}</p>
              {step.image && <ZoomableImage src={`/guias/${step.image}`} alt={`${i + 1}`} />}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

/** Preguntas y respuestas cortas de la guía (errores comunes, dudas). */
export function GuideFaq({ id }: { id: GuideId }) {
  const { t } = useTranslation()
  const faq = getGuide(id).faq.filter((f) => GOOGLE_UNVERIFIED || !f.unverified)
  return (
    <div className="grid gap-3">
      {faq.map((f, i) => (
        <div key={i} className={TEXT}>
          <p className="font-medium text-slate-700 dark:text-slate-200">{t(f.q)}</p>
          <p>{renderRich(t(f.a, VARS))}</p>
        </div>
      ))}
    </div>
  )
}
