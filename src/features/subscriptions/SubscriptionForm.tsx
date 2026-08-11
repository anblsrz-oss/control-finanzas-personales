import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/store/useAuth'
import { useCards } from '@/hooks/useCards'
import { useAccounts } from '@/hooks/useAccounts'
import { useCategories } from '@/hooks/useCategories'
import { useCreateSubscription, useUpdateSubscription } from '@/hooks/useSubscriptions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import {
  SUBSCRIPTION_MERCHANT_OPTIONS,
  SUBSCRIPTION_DEFAULT_ICON,
  SUBSCRIPTION_BILLING_CYCLES,
  SUBSCRIPTION_BILLING_CYCLE_LABELS,
} from '@/lib/subscriptionMerchants'
import { todayISO } from '@/lib/dates'
import type { SubscriptionRow } from '@/types/db'

// '' = sin tarjeta ni cuenta asignada.
const NO_DOMICILE = ''
// Prefijos del select combinado tarjeta/cuenta.
const CARD_PREFIX = 'card:'
const ACCOUNT_PREFIX = 'account:'
// Valor especial del selector de comercio para "otro / no está en la lista".
const CUSTOM_MERCHANT = '__custom__'

const schema = z.object({
  merchant_key: z.string(),
  name: z.string().min(1, 'El nombre es obligatorio'),
  amount: z.coerce.number().positive('El monto debe ser mayor a 0'),
  currency: z.string().length(3),
  billing_cycle: z.enum(['weekly', 'monthly', 'yearly']),
  next_charge_date: z.string().optional(),
  domicile: z.string(),
  category_id: z.string(),
})

type FormData = z.infer<typeof schema>

interface SubscriptionFormProps {
  subscription?: SubscriptionRow
  onSuccess?: () => void
  onCancel?: () => void
}

export function SubscriptionForm({ subscription, onSuccess, onCancel }: SubscriptionFormProps) {
  const { t } = useTranslation()
  const { session, profile } = useAuth()
  const userId = session?.user?.id
  const cardsQuery = useCards(userId)
  const accountsQuery = useAccounts(userId)
  const categoriesQuery = useCategories(userId, 'expense')
  const createSubscription = useCreateSubscription()
  const updateSubscription = useUpdateSubscription()
  const isEdit = !!subscription
  const [error, setError] = useState<string | null>(null)

  const domicileDefault = subscription?.card_id
    ? `${CARD_PREFIX}${subscription.card_id}`
    : subscription?.account_id
      ? `${ACCOUNT_PREFIX}${subscription.account_id}`
      : NO_DOMICILE

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      merchant_key: isEdit ? CUSTOM_MERCHANT : CUSTOM_MERCHANT,
      name: subscription?.name ?? '',
      amount: subscription?.amount ?? undefined,
      currency: subscription?.currency ?? profile?.main_currency ?? 'MXN',
      billing_cycle: subscription?.billing_cycle ?? 'monthly',
      next_charge_date: subscription?.next_charge_date ?? '',
      domicile: domicileDefault,
      category_id: subscription?.category_id ?? '',
    },
  })

  const pending = createSubscription.isPending || updateSubscription.isPending
  const cards = cardsQuery.data || []
  const accounts = accountsQuery.data || []
  const categories = categoriesQuery.data || []

  const merchantOptions = [
    { value: CUSTOM_MERCHANT, label: t('Otro (escribir nombre)') },
    ...SUBSCRIPTION_MERCHANT_OPTIONS.map((m) => ({ value: m.key, label: `${m.icon} ${m.name}` })),
  ]
  const domicileOptions = [
    { value: NO_DOMICILE, label: t('Sin tarjeta / cuenta asignada') },
    ...cards.map((c) => ({ value: `${CARD_PREFIX}${c.id}`, label: `💳 ${c.name}` })),
    ...accounts.map((a) => ({ value: `${ACCOUNT_PREFIX}${a.id}`, label: `🏦 ${a.name}` })),
  ]
  const categoryOptions = [
    { value: '', label: t('Sin categoría') },
    ...categories.map((c) => ({ value: c.id, label: `${c.icon ? `${c.icon} ` : ''}${c.name}` })),
  ]

  const selectedMerchantKey = form.watch('merchant_key')

  function handleMerchantChange(key: string) {
    form.setValue('merchant_key', key)
    if (key === CUSTOM_MERCHANT) return
    const merchant = SUBSCRIPTION_MERCHANT_OPTIONS.find((m) => m.key === key)
    if (!merchant) return
    // Autocompleta nombre y ciclo al elegir un comercio conocido; el usuario
    // sigue pudiendo editarlos después.
    form.setValue('name', merchant.name)
    form.setValue('billing_cycle', merchant.defaultCycle)
  }

  function onSubmit(data: FormData) {
    if (!userId) {
      alert(t('No hay sesión activa'))
      return
    }
    setError(null)

    const merchant = SUBSCRIPTION_MERCHANT_OPTIONS.find((m) => m.key === data.merchant_key)
    const merchantKey =
      data.merchant_key === CUSTOM_MERCHANT
        ? (subscription?.merchant_key ?? `manual:${crypto.randomUUID()}`)
        : data.merchant_key
    const icon = merchant?.icon ?? subscription?.icon ?? SUBSCRIPTION_DEFAULT_ICON

    const cardId = data.domicile.startsWith(CARD_PREFIX)
      ? data.domicile.slice(CARD_PREFIX.length)
      : null
    const accountId = data.domicile.startsWith(ACCOUNT_PREFIX)
      ? data.domicile.slice(ACCOUNT_PREFIX.length)
      : null

    const handlers = {
      onSuccess: () => {
        form.reset()
        onSuccess?.()
      },
      onError: (err: any) => {
        console.error('Error al guardar la suscripción:', err)
        setError(err?.message || t('Error desconocido'))
      },
    }

    if (isEdit) {
      updateSubscription.mutate(
        {
          id: subscription!.id,
          userId,
          name: data.name,
          amount: data.amount,
          currency: data.currency,
          billingCycle: data.billing_cycle,
          nextChargeDate: data.next_charge_date || null,
          cardId,
          accountId,
          categoryId: data.category_id || null,
        },
        handlers,
      )
    } else {
      createSubscription.mutate(
        {
          userId,
          name: data.name,
          merchantKey,
          icon,
          amount: data.amount,
          currency: data.currency,
          billingCycle: data.billing_cycle,
          nextChargeDate: data.next_charge_date || todayISO(),
          cardId,
          accountId,
          categoryId: data.category_id || null,
        },
        handlers,
      )
    }
  }

  return (
    <Card className="mb-6 bg-slate-50 dark:bg-slate-900">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {!isEdit && (
          <Select
            label={t('Comercio')}
            options={merchantOptions}
            value={selectedMerchantKey}
            onChange={(e) => handleMerchantChange(e.target.value)}
          />
        )}

        <Input
          label={t('Nombre')}
          placeholder="Netflix"
          {...form.register('name')}
          error={form.formState.errors.name?.message}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('Monto')}
            type="number"
            step="0.01"
            placeholder="199.00"
            {...form.register('amount')}
            error={form.formState.errors.amount?.message}
          />
          <Input
            label={t('Moneda')}
            placeholder="MXN"
            maxLength={3}
            {...form.register('currency')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label={t('Ciclo de cobro')}
            options={SUBSCRIPTION_BILLING_CYCLES.map((c) => ({
              value: c,
              label: t(SUBSCRIPTION_BILLING_CYCLE_LABELS[c]),
            }))}
            {...form.register('billing_cycle')}
          />
          <Input
            label={t('Próximo cobro')}
            type="date"
            {...form.register('next_charge_date')}
          />
        </div>

        <Select
          label={t('Tarjeta o cuenta')}
          options={domicileOptions}
          {...form.register('domicile')}
        />

        <Select
          label={t('Categoría')}
          options={categoryOptions}
          {...form.register('category_id')}
        />

        {error && (
          <p className="rounded-md bg-red-50 p-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-200">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending
              ? t('Guardando…')
              : isEdit
                ? t('Guardar cambios')
                : t('Agregar suscripción')}
          </Button>
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              {t('Cancelar')}
            </Button>
          )}
        </div>
      </form>
    </Card>
  )
}
