// Base de conocimiento de la app: una entrada por función, escrita en español.
// La leen /ayuda (HelpFaqPage) y, copiada con scripts/build-kb.mjs, el asistente
// del backend. Para documentar una función nueva agrégala a un JSON de esta carpeta.
export interface KbEntry {
  id: string
  title: string
  icon: string
  route: string
  featureKey: string | null
  summary: string
  steps: string[]
  faq: { q: string; a: string }[]
  /** Qué puede proponer crear el asistente desde esta función. */
  canCreate?: string[]
}

const modules = import.meta.glob<KbEntry[]>('./*.json', { eager: true, import: 'default' })

export const KB: KbEntry[] = Object.keys(modules)
  .sort()
  .flatMap((k) => modules[k])
