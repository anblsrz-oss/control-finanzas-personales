import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/store/useAuth'
import { useCategories } from '@/hooks/useCategories'
import { useCreateBudget, useUpdateBudget } from '@/hooks/useBudgets'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import {
  BUDGET_PERIODS,
  BUDGET_PERIOD_LABELS,
  BUDGET_PERIOD_HINTS,
  GENERAL_BUDGET_LABEL,
  DEFAULT_ALERT_THRESHOLD,
} from '@/lib/budgets'
import type { BudgetRow, BudgetPeriod } from '@/types/db'

// El valor '' del select representa el presupuesto general (category_id NULL).
const GENERAL_VALUE = ''

const schema = z.object({
  category_id: z.string(),
  amount: z.coerce.number().positive('El monto debe ser mayor a 0'),
  period: z.enum(['daily', 'weekly', 'biweekly', 'monthly']),
  // '' = hereda el umbral del perfil.
  alert_threshold: z
    .union([z.literal(''), z.coerce.number().min(1).max(100)])
    .optional(),
  is_active: z.boolean().default(true),
})

type FormData = z.infer<typeof schema>

interface BudgetFormProps {
  budget?: BudgetRow
  /** Categorías que ya tienen presupuesto: no se pueden duplicar. */
  usedCategoryIds?: (string | null)[]
  onSuccess?: () => void
  onCancel?: () => void
}

export function BudgetForm({
  budget,
  usedCategoryIds = [],
  onSuccess,
  onCancel,
}: BudgetFormProps) {
  const { t } = useTranslation()
  const { session, profile } = useAuth()
  const userId = session?.user?.id
  const categoriesQuery = useCategories(userId, 'expense')
  const createBudget = useCreateBudget()
  const updateBudget = useUpdateBudget()
  const isEdit = !!budget

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      category_id: budget?.category_id ?? GENERAL_VALUE,
      amount: budget?.amount ?? undefined,
      period: budget?.period ?? 'monthly',
      alert_threshold: budget?.alert_threshold ?? '',
      is_active: budget?.is_active ?? true,
    },
  })

  const pending = createBudget.isPending || updateBudget.isPending
  const [error, setError] = useState<string | null>(null)

  const categories = categoriesQuery.data || []
  const profileThreshold = profile?.budget_alert_threshold ?? DEFAULT_ALERT_THRESHOLD

  // Una categoría solo puede tener un presupuesto (lo impone un índice único en
  // la BD). Se ocultan las ya tomadas para no ofrecer algo que va a fallar,
  // salvo la del presupuesto que se está editando.
  const taken = new Set(usedCategoryIds.filter((id) => id !== budget?.category_id))
  const options = [
    ...(taken.has(null) ? [] : [{ value: GENERAL_VALUE, label: t(GENERAL_BUDGET_LABEL) }]),
    ...categories
      .filter((c) => !taken.has(c.id))
      .map((c) => ({
        value: c.id,
        label: `${c.icon ? `${c.icon} ` : ''}${c.name}`,
      })),
  ]

  const selectedPeriod = form.watch('period') as BudgetPeriod

  function onSubmit(data: FormData) {
    if (!userId) {
      alert(t('No hay sesión activa'))
      return
    }
    setError(null)
    const threshold =
      data.alert_threshold === '' || data.alert_threshold === undefined
        ? null
        : Number(data.alert_threshold)

    const handlers = {
      onSuccess: () => {
        form.reset()
        onSuccess?.()
      },
      onError: (err: any) => {
        console.error('Error al guardar el presupuesto:', err)
        // El índice único es la última línea de defensa si el select se quedó
        // desactualizado (p. ej. otro dispositivo creó el mismo presupuesto).
        setError(
          err?.code === '23505'
            ? t('Ya existe un presupuesto para esa categoría.')
            : err?.message || t('Error desconocido'),
        )
      },
    }

    if (isEdit) {
      updateBudget.mutate(
        {
          id: budget!.id,
          userId,
          categoryId: data.category_id || null,
          amount: data.amount,
          period: data.period,
          alertThreshold: threshold,
          isActive: data.is_active,
        },
        handlers,
      )
    } else {
      createBudget.mutate(
        {
          userId,
          categoryId: data.category_id || null,
          amount: data.amount,
          // El consumo se calcula contra base_amount, que está convertido a la
          // moneda principal: el presupuesto tiene que ir en esa misma moneda.
          currency: profile?.main_currency ?? 'MXN',
          period: data.period,
          alertThreshold: threshold,
        },
        handlers,
      )
    }
  }

  return (
    <Card className="mb-6 bg-slate-50 dark:bg-slate-900">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Select
          label={t('Categoría')}
          options={options}
          {...form.register('category_id')}
          error={form.formState.errors.category_id?.message}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('Monto máximo')}
            type="number"
            placeholder="3000"
            step="0.01"
            {...form.register('amount')}
            error={form.formState.errors.amount?.message}
          />
          <Select
            label={t('Periodo')}
            options={BUDGET_PERIODS.map((p) => ({
              value: p,
              label: t(BUDGET_PERIOD_LABELS[p]),
            }))}
            {...form.register('period')}
          />
        </div>

        <p className="-mt-2 text-xs text-slate-400 dark:text-slate-500">
          {t(BUDGET_PERIOD_HINTS[selectedPeriod] ?? BUDGET_PERIOD_HINTS.monthly)}
        </p>

        <Input
          label={t('Avisarme al llegar a (%)')}
          type="number"
          min="1"
          max="100"
          placeholder={String(profileThreshold)}
          {...form.register('alert_threshold')}
          error={form.formState.errors.alert_threshold?.message}
        />
        <p className="-mt-2 text-xs text-slate-400 dark:text-slate-500">
          {t('Si lo dejas vacío se usa tu umbral general ({{n}}%), configurable en Configuración.', {
            n: profileThreshold,
          })}
        </p>

        {isEdit && (
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              {...form.register('is_active')}
              className="mt-0.5 cursor-pointer"
            />
            <span className="text-sm text-slate-700 dark:text-slate-200">
              {t('Activo')}
              <span className="block text-xs text-slate-400 dark:text-slate-500">
                {t('Al desactivarlo deja de calcularse y de avisarte, sin borrarlo.')}
              </span>
            </span>
          </label>
        )}

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
                : t('Crear presupuesto')}
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
