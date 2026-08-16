import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/store/useAuth'
import { useCards } from '@/hooks/useCards'
import { useAccounts } from '@/hooks/useAccounts'
import {
  useSubscriptions,
  useConfirmSubscription,
  useDismissSuggestedSubscription,
  useUpdateSubscription,
  useDeleteSubscription,
  useDetectSubscriptions,
} from '@/hooks/useSubscriptions'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Money } from '@/components/ui/Money'
import { Emoji } from '@/components/ui/Emoji'
import { SubscriptionForm } from './SubscriptionForm'
import { monthlyEquivalent } from '@/lib/subscriptionMerchants'
import type { SubscriptionRow } from '@/types/db'

const NO_DOMICILE_KEY = '__none__'

export function SubscriptionsPage() {
  const { t } = useTranslation()
  const { session, profile } = useAuth()
  const userId = session?.user?.id
  const mainCurrency = profile?.main_currency ?? 'MXN'

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<SubscriptionRow | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editing) {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [editing])

  const subscriptionsQuery = useSubscriptions(userId)
  const cardsQuery = useCards(userId)
  const accountsQuery = useAccounts(userId)
  const confirmSubscription = useConfirmSubscription()
  const dismissSuggested = useDismissSuggestedSubscription()
  const updateSubscription = useUpdateSubscription()
  const deleteSubscription = useDeleteSubscription()
  const detectSubscriptions = useDetectSubscriptions()

  const subscriptions = subscriptionsQuery.data || []
  const cards = cardsQuery.data || []
  const accounts = accountsQuery.data || []
  const cardById = new Map(cards.map((c) => [c.id, c]))
  const accountById = new Map(accounts.map((a) => [a.id, a]))

  const suggested = subscriptions.filter((s) => s.status === 'suggested')
  const active = subscriptions.filter((s) => s.status === 'active')
  const history = subscriptions.filter((s) =>
    ['paused', 'cancelled', 'ignored'].includes(s.status),
  )

  const domicileLabel = (s: SubscriptionRow) => {
    if (s.card_id) return cardById.get(s.card_id)?.name ?? t('Tarjeta')
    if (s.account_id) return accountById.get(s.account_id)?.name ?? t('Cuenta')
    return t('Sin tarjeta / cuenta')
  }

  const groups = new Map<string, { label: string; items: SubscriptionRow[] }>()
  for (const s of active) {
    const key = s.card_id ?? s.account_id ?? NO_DOMICILE_KEY
    const g = groups.get(key)
    if (g) g.items.push(s)
    else groups.set(key, { label: domicileLabel(s), items: [s] })
  }

  const monthlyTotal = active.reduce(
    (sum, s) => sum + monthlyEquivalent(s.amount, s.billing_cycle),
    0,
  )
  const annualTotal = monthlyTotal * 12

  const handleDismiss = (s: SubscriptionRow) => {
    if (confirm(t('¿"{{name}}" no es una suscripción? No se volverá a sugerir.', { name: s.name }))) {
      dismissSuggested.mutate({ id: s.id, userId: userId! })
    }
  }

  const handleCancel = (s: SubscriptionRow) => {
    if (confirm(t('¿Cancelar "{{name}}"? Si vuelve a cobrar, se sugerirá de nuevo.', { name: s.name }))) {
      updateSubscription.mutate({ id: s.id, userId: userId!, status: 'cancelled' })
    }
  }

  const handleDelete = (s: SubscriptionRow) => {
    if (confirm(t('¿Eliminar "{{name}}" definitivamente?', { name: s.name }))) {
      deleteSubscription.mutate({ id: s.id, userId: userId! })
    }
  }

  return (
    <>
      <PageHeader
        title={t('Suscripciones')}
        subtitle={t('Cargos recurrentes domiciliados a tus tarjetas y cuentas.')}
        actions={
          <Button
            onClick={() => {
              setEditing(null)
              setShowForm(!showForm)
            }}
          >
            {showForm ? t('Cancelar') : t('+ Agregar manualmente')}
          </Button>
        }
      />

      {showForm && !editing && <SubscriptionForm onSuccess={() => setShowForm(false)} />}

      {editing && (
        <div ref={formRef} className="scroll-mt-4">
          <SubscriptionForm
            key={editing.id}
            subscription={editing}
            onSuccess={() => setEditing(null)}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {active.length > 0 && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          <Card className="bg-gradient-to-br from-teal-50 to-cyan-50">
            <p className="text-xs text-slate-600 dark:text-slate-300">{t('Gasto mensual equivalente')}</p>
            <p className="text-2xl font-semibold text-teal-600 dark:text-teal-400">
              <Money amount={monthlyTotal} currency={mainCurrency} />
            </p>
          </Card>
          <Card className="bg-gradient-to-br from-indigo-50 to-violet-50">
            <p className="text-xs text-slate-600 dark:text-slate-300">{t('Gasto anual equivalente')}</p>
            <p className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
              <Money amount={annualTotal} currency={mainCurrency} />
            </p>
          </Card>
        </div>
      )}

      {suggested.length > 0 && (
        <section className="mb-6 space-y-2">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {t('Sugeridas')} ({suggested.length})
          </h2>
          {suggested.map((s) => (
            <Card key={s.id} className="flex flex-wrap items-center justify-between gap-3 border-teal-200 dark:border-teal-800">
              <div className="flex items-center gap-3">
                <span className="text-2xl"><Emoji emoji={s.icon ?? '🔁'} /></span>
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-100">{s.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    <Money amount={s.amount} currency={s.currency} /> · {domicileLabel(s)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => confirmSubscription.mutate({ id: s.id, userId: userId! })}
                  disabled={confirmSubscription.isPending}
                >
                  {t('Confirmar')}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDismiss(s)}
                  disabled={dismissSuggested.isPending}
                >
                  {t('No es suscripción')}
                </Button>
              </div>
            </Card>
          ))}
        </section>
      )}

      <div className="mb-6 flex justify-end">
        <Button
          variant="secondary"
          onClick={() => detectSubscriptions.mutate({ userId: userId! })}
          disabled={detectSubscriptions.isPending}
        >
          {detectSubscriptions.isPending
            ? t('Buscando…')
            : `🔍 ${t('Buscar más suscripciones')}`}
        </Button>
      </div>

      {active.length === 0 && suggested.length === 0 ? (
        <Card className="border-dashed text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('Sin suscripciones todavía. Se detectan solas cuando llega un cargo de Netflix, Spotify, etc. por SMS o correo, o agrégalas manualmente.')}
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {[...groups.entries()].map(([key, group]) => (
            <section key={key} className="space-y-2">
              <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                {group.label}
              </h2>
              {group.items.map((s) => (
                <Card key={s.id} className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl"><Emoji emoji={s.icon ?? '🔁'} /></span>
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-100">{s.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        <Money amount={s.amount} currency={s.currency} /> ·{' '}
                        {t(
                          s.billing_cycle === 'monthly'
                            ? 'mensual'
                            : s.billing_cycle === 'yearly'
                              ? 'anual'
                              : 'semanal',
                        )}
                        {s.next_charge_date && ` · ${t('próximo cobro')}: ${s.next_charge_date}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => { setShowForm(false); setEditing(s) }}>
                      {t('Editar')}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateSubscription.mutate({ id: s.id, userId: userId!, status: 'paused' })}
                    >
                      {t('Pausar')}
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleCancel(s)}>
                      {t('Cancelar')}
                    </Button>
                  </div>
                </Card>
              ))}
            </section>
          ))}
        </div>
      )}

      {history.length > 0 && (
        <section className="mt-6">
          <button
            type="button"
            className="text-sm font-semibold text-slate-500 dark:text-slate-400 underline underline-offset-2"
            onClick={() => setShowHistory((v) => !v)}
          >
            {showHistory ? t('Ocultar historial') : t('Ver historial ({{n}})', { n: history.length })}
          </button>
          {showHistory && (
            <div className="mt-2 space-y-2">
              {history.map((s) => (
                <Card key={s.id} className="flex flex-wrap items-center justify-between gap-2 opacity-70">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    <Emoji emoji={s.icon ?? '🔁'} /> {s.name} ·{' '}
                    {t(
                      s.status === 'paused'
                        ? 'pausada'
                        : s.status === 'cancelled'
                          ? 'cancelada'
                          : 'ignorada',
                    )}
                  </span>
                  <div className="flex gap-2">
                    {s.status === 'paused' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateSubscription.mutate({ id: s.id, userId: userId!, status: 'active' })}
                      >
                        {t('Reactivar')}
                      </Button>
                    )}
                    <Button size="sm" variant="danger" onClick={() => handleDelete(s)}>
                      {t('Eliminar')}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}
    </>
  )
}
