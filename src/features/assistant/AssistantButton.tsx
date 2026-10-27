import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Send, SquarePen, X } from 'lucide-react'
import { ASSISTANT_NAME, TaffyAvatar, type TaffyMood } from './TaffyAvatar'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/store/useAuth'
import { useEntitlements } from '@/hooks/useAppConfig'
import { useAssistant, type AssistantMessage, type AssistantProposal } from '@/hooks/useAssistant'
import { useCreateAccount } from '@/hooks/useAccounts'
import { useCreateCard } from '@/hooks/useCards'
import { useCreateCreditLine, useCreditLines } from '@/hooks/useCreditLines'
import { useCategories, useCreateCategory } from '@/hooks/useCategories'
import { useCreateBudget } from '@/hooks/useBudgets'
import { useCreateSubscription } from '@/hooks/useSubscriptions'
import { DEFAULT_CATEGORY_ICON, autoCategoryColor } from '@/lib/categoryColors'
import { lightHaptic } from '@/lib/nativeUi'

// Banderas por sesión de Taffy (sessionStorage puede fallar en modo privado: entonces solo duran en memoria).
function readFlag(key: string): boolean {
  try {
    return sessionStorage.getItem(key) === '1'
  } catch {
    return false
  }
}
function writeFlag(key: string) {
  try {
    sessionStorage.setItem(key, '1')
  } catch {
    // sin storage: se ignora
  }
}

type ProposalStatus = 'pending' | 'saving' | 'done' | 'cancelled' | 'error'
interface ChatItem extends AssistantMessage {
  proposals?: { p: AssistantProposal; status: ProposalStatus; error?: string }[]
}

const KIND_LABEL: Record<AssistantProposal['kind'], string> = {
  account: 'Cuenta',
  card: 'Tarjeta',
  credit_line: 'Línea de crédito',
  category: 'Categoría',
  budget: 'Presupuesto',
  subscription: 'Suscripción',
}

/** Renglones legibles de lo que se va a crear (el usuario confirma sobre esto). */
function summary(p: AssistantProposal): string[] {
  const d = p.data
  const money = `${d.amount} ${d.currency}`
  switch (p.kind) {
    case 'account':
      return [d.name, `${d.type} · ${d.currency}`, `Saldo inicial: ${d.initial_balance}`]
    case 'card':
      return [d.name, `${d.type} · ${d.currency}`, ...(d.credit_line_name ? [`Línea: ${d.credit_line_name}`] : [])]
    case 'credit_line':
      return [d.name, `Límite: ${d.credit_limit} ${d.currency}`, `Corte: día ${d.cut_day} · Pago: día ${d.payment_day}`]
    case 'category':
      return [d.name, d.kind === 'income' ? 'Ingreso' : 'Gasto']
    case 'budget':
      return [d.category_name || 'General', `${money} · ${d.period}`]
    case 'subscription':
      return [d.name, `${money} · ${d.billing_cycle}`, `Próximo cobro: ${d.next_charge_date}`]
  }
}

// Burbuja flotante (abajo a la derecha) que abre el chat de ayuda. El asistente solo responde
// sobre la app y propone configuraciones; guardar siempre pasa por aquí, con
// los hooks de siempre (RLS y límites del plan se aplican igual).
export function AssistantButton() {
  const { t } = useTranslation()
  const { session } = useAuth()
  const userId = session?.user?.id
  const [open, setOpen] = useState(false)
  // Montaje/animación del panel (mismo patrón que ui/Modal): rendered = en el DOM, visible = animado.
  const [rendered, setRendered] = useState(false)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (open) {
      setRendered(true)
      const raf = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(raf)
    }
    setVisible(false)
    const timeout = setTimeout(() => setRendered(false), 200)
    return () => clearTimeout(timeout)
  }, [open])
  const [items, setItems] = useState<ChatItem[]>([])
  const [text, setText] = useState('')
  const [chatError, setChatError] = useState('')
  // Mensajes que quedan hoy, según el servidor (null hasta la primera respuesta).
  const [quota, setQuota] = useState<{ remaining: number; limit: number } | null>(null)

  function newConversation() {
    setItems([])
    setText('')
    setChatError('')
  }
  const endRef = useRef<HTMLDivElement>(null)

  const canUse = useEntitlements().canUse('assistant')
  const assistant = useAssistant()
  const categories = useCategories(userId).data ?? []
  const createAccount = useCreateAccount()
  const createCard = useCreateCard()
  const createCreditLine = useCreateCreditLine()
  const creditLines = useCreditLines(userId).data ?? []
  const createCategory = useCreateCategory()
  const createBudget = useCreateBudget()
  const createSubscription = useCreateSubscription()

  // Vida de Taffy: pop al tocarla (taps re-monta el contenedor), cara feliz breve al responder,
  // saltito (nudge) hasta que se abra el chat en la sesión y un globo "¿Te ayudo?" una vez por sesión.
  const [taps, setTaps] = useState(0)
  const [cheer, setCheer] = useState(false)
  const [seen, setSeen] = useState(() => readFlag('taffy-seen'))
  const [bubble, setBubble] = useState<'hidden' | 'shown' | 'leaving'>('hidden')
  function poke() {
    setTaps((n) => n + 1)
    void lightHaptic()
  }
  function celebrate() {
    setCheer(true)
    void lightHaptic()
  }
  useEffect(() => {
    if (!cheer) return
    const timeout = setTimeout(() => setCheer(false), 1500)
    return () => clearTimeout(timeout)
  }, [cheer])
  useEffect(() => {
    if (!canUse || readFlag('taffy-seen') || readFlag('taffy-bubble')) return
    const timeout = setTimeout(() => {
      writeFlag('taffy-bubble')
      setBubble('shown')
    }, 4000)
    return () => clearTimeout(timeout)
  }, [canUse])
  useEffect(() => {
    if (bubble === 'hidden') return
    const timeout = setTimeout(() => setBubble(bubble === 'shown' ? 'leaving' : 'hidden'), bubble === 'shown' ? 6000 : 150)
    return () => clearTimeout(timeout)
  }, [bubble])
  function toggle() {
    if (!open) {
      poke()
      setBubble('hidden')
      if (!seen) {
        setSeen(true)
        writeFlag('taffy-seen')
      }
    }
    setOpen((v) => !v)
  }
  const sleeping = quota?.remaining === 0
  const headerMood: TaffyMood = sleeping ? 'sleeping' : assistant.isPending ? 'thinking' : chatError ? 'sad' : cheer ? 'happy' : 'idle'
  const buttonMood: TaffyMood = sleeping ? 'sleeping' : seen ? 'idle' : 'nudge'

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [items, assistant.isPending])

  async function send() {
    const content = text.trim()
    if (!content || assistant.isPending) return
    setText('')
    setChatError('')
    const next: ChatItem[] = [...items, { role: 'user', content }]
    setItems(next)
    try {
      const res = await assistant.mutateAsync(next.map(({ role, content }) => ({ role, content })))
      if (res.remaining != null && res.limit != null) setQuota({ remaining: res.remaining, limit: res.limit })
      setItems([
        ...next,
        {
          role: 'assistant',
          content: res.reply,
          proposals: res.proposals.map((p) => ({ p, status: 'pending' as const })),
        },
      ])
      celebrate()
    } catch (e) {
      setChatError(e instanceof Error ? e.message : t('No se pudo contactar al asistente.'))
    }
  }

  function setStatus(msgIdx: number, pIdx: number, status: ProposalStatus, error?: string) {
    setItems((cur) =>
      cur.map((m, i) =>
        i !== msgIdx || !m.proposals
          ? m
          : { ...m, proposals: m.proposals.map((x, j) => (j === pIdx ? { ...x, status, error } : x)) },
      ),
    )
  }

  async function save(p: AssistantProposal) {
    if (!userId) return
    const d = p.data
    switch (p.kind) {
      case 'account':
        return createAccount.mutateAsync({
          userId, name: d.name, type: d.type, currency: d.currency, initial_balance: d.initial_balance, has_yield: false,
        })
      case 'card': {
        let creditLineId: string | null = null
        if (d.credit_line_name) {
          const line = creditLines.find((l) => l.name.trim().toLowerCase() === String(d.credit_line_name).toLowerCase())
          if (!line) throw new Error(t('No encontré esa línea de crédito. Créala primero o elige una existente.'))
          creditLineId = line.id
        }
        return createCard.mutateAsync({
          userId, name: d.name, type: d.type, currency: d.currency, credit_line_id: creditLineId,
        })
      }
      case 'credit_line':
        return createCreditLine.mutateAsync({
          userId, name: d.name, credit_limit: d.credit_limit, currency: d.currency,
          cut_day: d.cut_day, payment_day: d.payment_day,
        })
      case 'category':
        return createCategory.mutateAsync({
          userId, name: d.name, kind: d.kind, icon: DEFAULT_CATEGORY_ICON, color: autoCategoryColor(d.name),
        })
      case 'budget': {
        let categoryId: string | null = null
        if (d.category_name) {
          const c = categories.find(
            (x) => x.kind === 'expense' && x.name.trim().toLowerCase() === String(d.category_name).toLowerCase(),
          )
          if (!c) throw new Error(t('No encontré esa categoría. Créala primero o elige una existente.'))
          categoryId = c.id
        }
        return createBudget.mutateAsync({
          userId, categoryId, amount: d.amount, currency: d.currency, period: d.period,
        })
      }
      case 'subscription':
        return createSubscription.mutateAsync({
          userId, name: d.name, merchantKey: `manual:${crypto.randomUUID()}`, amount: d.amount,
          currency: d.currency, billingCycle: d.billing_cycle, nextChargeDate: d.next_charge_date,
        })
    }
  }

  async function confirm(msgIdx: number, pIdx: number) {
    const p = items[msgIdx]?.proposals?.[pIdx]?.p
    if (!p) return
    setStatus(msgIdx, pIdx, 'saving')
    try {
      await save(p)
      setStatus(msgIdx, pIdx, 'done')
      celebrate()
    } catch (e) {
      // Incluye el aviso del límite del plan (trigger enforce_plan_limits).
      setStatus(msgIdx, pIdx, 'error', e instanceof Error ? e.message : t('No se pudo guardar.'))
    }
  }

  if (!canUse) return null // función marcada Premium por el admin y el usuario no lo es

  return (
    <>
      {/* Panel: sobre la barra inferior en móvil, esquina inferior derecha en escritorio. */}
      {rendered && (
        <section
          role="dialog"
          aria-label={ASSISTANT_NAME}
          className={`fixed inset-x-3 bottom-[calc(8.25rem+env(safe-area-inset-bottom))] z-30 flex h-[min(34rem,calc(100dvh-12rem))] origin-bottom-right flex-col overflow-hidden rounded-2xl border border-slate-200 bg-surface shadow-2xl transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-opacity dark:border-slate-700 md:inset-x-auto md:bottom-24 md:end-6 md:h-[min(36rem,calc(100dvh-8rem))] md:w-96 ${
            visible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-3 scale-95 opacity-0 motion-reduce:translate-y-0 motion-reduce:scale-100'
          }`}
        >
          <header className="flex shrink-0 items-center gap-3 bg-brand-600 px-4 py-3 text-white">
            {/* Decorativa: tocarla solo la hace reaccionar. */}
            <span
              key={taps}
              aria-hidden="true"
              onClick={poke}
              className={`flex h-9 w-9 cursor-pointer select-none items-center justify-center rounded-full bg-white/20 ${taps ? 'taffy-tap' : ''}`}
            >
              <TaffyAvatar className="h-8 w-8" mood={headerMood} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold leading-tight">{ASSISTANT_NAME}</h2>
              <p className="text-xs text-white/80">{t('Ayuda con la app y tus configuraciones')}</p>
            </div>
            {items.length > 0 && (
              <button
                type="button"
                onClick={newConversation}
                aria-label={t('Nueva conversación')}
                title={t('Nueva conversación')}
                className="rounded-md p-1.5 text-white/90 transition-colors hover:bg-white/15"
              >
                <SquarePen className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t('Cerrar')}
              title={t('Cerrar')}
              className="rounded-md p-1.5 text-white/90 transition-colors hover:bg-white/15"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </header>

          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-canvas px-4 py-4" aria-live="polite">
            {items.length === 0 && (
              <div className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 dark:bg-brand-800/40 dark:text-brand-500">
                  <TaffyAvatar className="h-6 w-6" />
                </span>
                <p className="rounded-2xl rounded-tl-sm bg-surface px-3 py-2 text-sm text-slate-700 shadow-sm dark:text-slate-200">
                  {t('¡Hola! Soy {{name}}. Pregúntame cómo usar la app o pídeme crear una cuenta, tarjeta, línea de crédito, categoría, presupuesto o suscripción. Antes de guardar nada te pido confirmación.', { name: ASSISTANT_NAME })}
                </p>
              </div>
            )}
            {items.map((m, mi) =>
              m.role === 'user' ? (
                <p key={mi} className="max-w-[85%] self-end whitespace-pre-wrap rounded-2xl rounded-br-sm bg-brand-600 px-3 py-2 text-sm text-white">
                  {m.content}
                </p>
              ) : (
                <div key={mi} className="flex items-start gap-2">
                  <span aria-hidden="true" className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 dark:bg-brand-800/40 dark:text-brand-500">
                    <TaffyAvatar className="h-6 w-6" />
                  </span>
                  <div className="grid min-w-0 max-w-[85%] gap-2">
                    <p className="whitespace-pre-wrap rounded-2xl rounded-tl-sm bg-surface px-3 py-2 text-sm text-slate-700 shadow-sm dark:text-slate-200">
                      {m.content}
                    </p>
                    {m.proposals?.map(({ p, status, error }, pi) => (
                      <div key={pi} className="grid gap-1 rounded-xl border border-brand-200 bg-surface p-3 text-sm dark:border-brand-800">
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{t(KIND_LABEL[p.kind])}</p>
                        {summary(p).map((line, li) => (
                          <p key={li} className="text-slate-600 dark:text-slate-300">{line}</p>
                        ))}
                        {error && <p className="text-xs text-line-scarlet">{error}</p>}
                        {status === 'done' && <p className="text-xs font-medium text-brand-700 dark:text-brand-500">{t('Guardado')}</p>}
                        {status === 'cancelled' && <p className="text-xs text-slate-400">{t('Cancelado')}</p>}
                        {(status === 'pending' || status === 'saving' || status === 'error') && (
                          <div className="mt-1 flex gap-2">
                            <Button size="sm" disabled={status === 'saving'} onClick={() => confirm(mi, pi)}>
                              {status === 'saving' ? t('Guardando…') : t('Confirmar')}
                            </Button>
                            <Button size="sm" variant="ghost" disabled={status === 'saving'} onClick={() => setStatus(mi, pi, 'cancelled')}>
                              {t('Cancelar')}
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ),
            )}
            {assistant.isPending && <p className="text-sm text-slate-400">{t('Escribiendo…')}</p>}
            {chatError && <p className="rounded-lg bg-line-scarlet/10 px-3 py-2 text-sm text-line-scarlet">{chatError}</p>}
            <div ref={endRef} />
          </div>

          <form
            className="shrink-0 border-t border-slate-200 bg-surface p-3 dark:border-slate-700"
            onSubmit={(e) => {
              e.preventDefault()
              void send()
            }}
          >
            <div className="flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={500}
                placeholder={t('Escribe tu duda…')}
                aria-label={t('Escribe tu duda…')}
                className="min-w-0 flex-1 rounded-full border border-slate-300 bg-canvas px-4 py-2 text-sm text-slate-800 dark:border-slate-600 dark:text-slate-100"
              />
              <Button type="submit" disabled={!text.trim() || assistant.isPending || quota?.remaining === 0} aria-label={t('Enviar')} className="rounded-full">
                <Send className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            {quota && (
              <p className={`mt-2 text-xs font-medium ${quota.remaining === 0 ? 'text-line-scarlet' : 'text-slate-500 dark:text-slate-400'}`}>
                {quota.remaining === 0
                  ? t('Llegaste al máximo de mensajes de hoy. Mañana se reinicia.')
                  : t('Te quedan {{n}} de {{limit}} mensajes hoy', { n: quota.remaining, limit: quota.limit })}
              </p>
            )}
            <p className="mt-1 text-[11px] leading-snug text-slate-400 dark:text-slate-500">
              {t('El asistente solo ayuda con esta app. Tus mensajes se envían a un proveedor de IA para responderte.')}
            </p>
          </form>
        </section>
      )}

      {bubble !== 'hidden' && !open && (
        <div
          data-leaving={bubble === 'leaving' || undefined}
          className="taffy-bubble fixed bottom-[calc(8.75rem+env(safe-area-inset-bottom))] end-4 z-30 flex items-center gap-1 rounded-2xl rounded-br-sm bg-surface py-1 ps-3 pe-1 text-sm font-medium text-slate-700 shadow-lg ring-1 ring-slate-200 dark:text-slate-100 dark:ring-slate-700 md:bottom-[5.5rem] md:end-6"
        >
          <button type="button" onClick={toggle} className="py-1">
            {t('¿Te ayudo?')}
          </button>
          <button
            type="button"
            onClick={() => setBubble('leaving')}
            aria-label={t('Cerrar')}
            className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Burbuja flotante: abre/cierra el chat. z-30: bajo la hoja "Más" (z-40) y los modales (z-50). */}
      <button
        type="button"
        onClick={toggle}
        title={open ? t('Cerrar') : t('Chat con {{name}}', { name: ASSISTANT_NAME })}
        aria-label={open ? t('Cerrar') : t('Chat con {{name}}', { name: ASSISTANT_NAME })}
        aria-expanded={open}
        className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] end-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-[transform,background-color] duration-150 hover:bg-brand-700 active:scale-95 motion-reduce:transition-none md:bottom-6 md:end-6"
      >
        {open ? <X className="h-6 w-6" aria-hidden="true" /> : <TaffyAvatar className="h-12 w-12" mood={buttonMood} />}
      </button>
    </>
  )
}
