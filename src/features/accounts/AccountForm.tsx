import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useEntitlements } from '@/hooks/useAppConfig'
import { useAuth } from '@/store/useAuth'
import { useCreateAccount, useUpdateAccount } from '@/hooks/useAccounts'
import {
  useAccountYieldTiers,
  useSaveAccountYieldTiers,
} from '@/hooks/useAccountYieldTiers'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { CURRENCIES_ARRAY, CURRENCIES, formatMoney } from '@/lib/format'
import { toMonthlyRate, toAnnualRate, daysInMonthOf } from '@/lib/yields'
import type { AccountRow } from '@/types/db'

// Tasa anual de retención sobre el capital para inversiones (Ley de Ingresos).
// Es solo la sugerencia inicial: cambia cada año y el usuario puede editarla.
const DEFAULT_ISR_RATE = 0.5

const schema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  bank_name: z.string().optional(),
  clabe: z.string().optional().refine((v) => !v || /^\d{18}$/.test(v), 'La CLABE debe tener 18 dígitos'),
  account_last4: z
    .string()
    .optional()
    .refine((v) => !v || /^\d{4}$/.test(v), 'Deben ser 4 dígitos'),
  account_number: z
    .string()
    .optional()
    .refine((v) => !v || /^\d{8,20}$/.test(v), 'Debe tener entre 8 y 20 dígitos'),
  account_number_last4: z
    .string()
    .optional()
    .refine((v) => !v || /^\d{4}$/.test(v), 'Deben ser 4 dígitos'),
  type: z.enum(['checking', 'savings', 'investment', 'cash', 'voucher']),
  currency: z.enum(CURRENCIES_ARRAY),
  // En edición se permite negativo (p. ej. para corregir montos de prueba).
  initial_balance: z.coerce.number(),
  has_yield: z.boolean().default(false),
  yield_rate: z.coerce.number().optional(),
  // Los bancos y SOFIPOs publican la tasa anual; se guarda cómo se capturó.
  yield_rate_period: z.enum(['monthly', 'annual']).default('monthly'),
  yield_kind: z.enum(['demand', 'term']).default('demand'),
  yield_term_days: z.coerce.number().optional(),
  yield_term_end: z.string().optional(),
  withhold_isr: z.boolean().default(false),
  isr_rate: z.coerce.number().optional(),
  // Tramos por monto (ej. SOFIPOs): primeros $X a una tasa, el excedente a
  // otra. Solo aplica a rendimiento "a la vista"; opcional.
  yield_tiers: z
    .array(
      z.object({
        min_amount: z.coerce.number().min(0, 'Debe ser 0 o mayor'),
        rate: z.coerce.number(),
      }),
    )
    .default([]),
  is_scholarship: z.boolean().default(false),
  scholarship_name: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface AccountFormProps {
  account?: AccountRow
  /** Al crear un apartado (cajita) dentro de esta cuenta: fija su moneda y oculta lo que no aplica. */
  parentAccount?: AccountRow
  onSuccess?: () => void
  onCancel?: () => void
}

export function AccountForm({ account, parentAccount, onSuccess, onCancel }: AccountFormProps) {
  const { t } = useTranslation()
  const { session } = useAuth()
  const userId = session?.user?.id
  const createAccount = useCreateAccount()
  const updateAccount = useUpdateAccount()
  const tiersQuery = useAccountYieldTiers(userId)
  const saveTiers = useSaveAccountYieldTiers()
  const isEdit = !!account
  // Sin "multimoneda" en el plan, solo se ofrece la moneda que ya tiene.
  const canUseMulticurrency = useEntitlements().canUse('multicurrency')
  const isPocket = !!parentAccount

  const existingTiers = (tiersQuery.data || []).filter((t) => t.account_id === account?.id)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      name: account?.name ?? '',
      bank_name: account?.bank_name ?? '',
      clabe: account?.clabe ?? '',
      account_last4: account?.account_last4 ?? '',
      account_number: account?.account_number ?? '',
      account_number_last4: account?.account_number_last4 ?? '',
      type: account?.type ?? (parentAccount ? parentAccount.type : 'checking'),
      currency: ((account?.currency ?? parentAccount?.currency) as any) ?? 'MXN',
      initial_balance: account?.initial_balance ?? 0,
      has_yield: account?.has_yield ?? false,
      yield_rate: account?.yield_rate ?? undefined,
      yield_rate_period: account?.yield_rate_period ?? 'monthly',
      yield_kind: account?.yield_kind ?? 'demand',
      yield_term_days: account?.yield_term_days ?? undefined,
      yield_term_end: account?.yield_term_end ?? '',
      withhold_isr: account?.withhold_isr ?? false,
      isr_rate: account?.isr_rate ?? DEFAULT_ISR_RATE,
      yield_tiers: existingTiers.map((t) => ({ min_amount: t.min_amount, rate: t.rate })),
      is_scholarship: account?.is_scholarship ?? false,
      scholarship_name: account?.scholarship_name ?? '',
    },
  })

  const tiersField = useFieldArray({ control: form.control, name: 'yield_tiers' })

  const pending = createAccount.isPending || updateAccount.isPending || saveTiers.isPending
  const ratePeriod = form.watch('yield_rate_period')
  const rateValue = Number(form.watch('yield_rate')) || 0
  const formCurrency = form.watch('currency')

  // Los tramos son marginales (como el ISR): se leen ordenados por "Desde",
  // sin importar en qué orden los haya capturado el usuario. Esta vista
  // previa muestra el rango real que le toca a cada uno para que no haya
  // que adivinar el orden correcto.
  const tiersPreview = [...(form.watch('yield_tiers') || [])]
    .map((tier, fieldIndex) => ({ ...tier, fieldIndex }))
    .sort((a, b) => (Number(a.min_amount) || 0) - (Number(b.min_amount) || 0))

  // Al capturar la CLABE completa, se autocompletan los últimos 4 para que
  // el usuario no tenga que escribirlos dos veces. Sigue editable a mano por
  // si solo conoce la terminación y no la CLABE completa.
  function handleClabeChange(value: string) {
    form.setValue('clabe', value)
    if (/^\d{18}$/.test(value)) {
      form.setValue('account_last4', value.slice(-4))
    }
  }

  // Mismo autocompletado que la CLABE, pero para el número de cuenta: sus
  // últimos 4 dígitos NO coinciden con los de la CLABE (esta trae un dígito
  // verificador al final), así que se guardan por separado.
  function handleAccountNumberChange(value: string) {
    form.setValue('account_number', value)
    if (/^\d{8,20}$/.test(value)) {
      form.setValue('account_number_last4', value.slice(-4))
    }
  }

  async function onSubmit(data: FormData) {
    if (!session?.user?.id) {
      alert(t('No hay sesión activa'))
      return
    }
    const userId = session.user.id
    const { yield_tiers, ...rest } = data
    // Los campos de plazo solo aplican a plazo fijo, y el ISR solo si se pidió
    // descontarlo: si no, se limpian para no dejar datos que no significan nada.
    const isTerm = rest.has_yield && rest.yield_kind === 'term'
    // Los tramos por monto solo aplican a rendimiento a la vista.
    const supportsTiers = rest.has_yield && rest.yield_kind === 'demand'
    const payload = {
      ...rest,
      clabe: rest.clabe || null,
      account_last4: rest.account_last4 || null,
      account_number: rest.account_number || null,
      account_number_last4: rest.account_number_last4 || null,
      yield_term_days: isTerm ? (rest.yield_term_days ?? null) : null,
      yield_term_end: isTerm ? (rest.yield_term_end || null) : null,
      isr_rate: rest.has_yield && rest.withhold_isr ? (rest.isr_rate ?? null) : null,
      withhold_isr: rest.has_yield && rest.withhold_isr,
    }
    const tiersToSave = supportsTiers ? yield_tiers : []

    const handlers = {
      onSuccess: (saved: any) => {
        const accountId = saved?.id ?? account?.id
        if (accountId) {
          saveTiers.mutate({
            userId,
            accountId,
            tiers: tiersToSave.map((tier) => ({ min_amount: tier.min_amount, rate: tier.rate })),
          })
        }
        form.reset()
        onSuccess?.()
      },
      onError: (error: any) => {
        console.error('Error al guardar cuenta:', error)
        alert(`Error: ${error.message || 'Error desconocido'}`)
      },
    }

    if (isEdit) {
      updateAccount.mutate(
        {
          id: account!.id,
          userId,
          ...payload,
          scholarship_name: data.is_scholarship ? data.scholarship_name || null : null,
        },
        handlers,
      )
    } else {
      createAccount.mutate(
        { userId, ...payload, parent_account_id: parentAccount?.id ?? null },
        handlers,
      )
    }
  }

  return (
    <Card className="mb-6 bg-slate-50 dark:bg-slate-900">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('Nombre de la cuenta')}
            placeholder={t('Mi cuenta principal')}
            {...form.register('name')}
            error={form.formState.errors.name?.message}
          />
          <Input
            label={t('Banco (opcional)')}
            placeholder={t('Banco X')}
            {...form.register('bank_name')}
          />
        </div>

        {isPocket && (
          <p className="-mt-2 text-xs text-slate-500 dark:text-slate-400">
            {t('Apartado dentro de {{name}}. Comparte su moneda y tiene su propio saldo y rendimiento.', {
              name: parentAccount!.name,
            })}
          </p>
        )}

        {!isPocket && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('CLABE (opcional)')}
                placeholder="012345678901234567"
                inputMode="numeric"
                maxLength={18}
                {...form.register('clabe')}
                onChange={(e) => handleClabeChange(e.target.value)}
                error={form.formState.errors.clabe?.message}
              />
              <Input
                label={t('Últimos 4 de la CLABE (opcional)')}
                placeholder="1234"
                inputMode="numeric"
                maxLength={4}
                {...form.register('account_last4')}
                error={form.formState.errors.account_last4?.message}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('Número de cuenta (opcional)')}
                placeholder="01234567890"
                inputMode="numeric"
                maxLength={20}
                {...form.register('account_number')}
                onChange={(e) => handleAccountNumberChange(e.target.value)}
                error={form.formState.errors.account_number?.message}
              />
              <Input
                label={t('Últimos 4 de la cuenta (opcional)')}
                placeholder="1234"
                inputMode="numeric"
                maxLength={4}
                {...form.register('account_number_last4')}
                error={form.formState.errors.account_number_last4?.message}
              />
            </div>
            <p className="-mt-2 text-xs text-slate-400 dark:text-slate-500">
              {t('Sirven para identificar automáticamente depósitos y transferencias por SMS o correo. Solo los últimos 4 dígitos se usan para eso, aunque guardes el número completo. La CLABE y el número de cuenta no comparten terminación, por eso van por separado.')}
            </p>
          </>
        )}

        <div className="grid grid-cols-3 gap-4">
          <Select
            label={t('Tipo')}
            options={[
              { value: 'checking', label: t('Corriente') },
              { value: 'savings', label: t('Ahorro') },
              { value: 'investment', label: t('Inversión') },
              { value: 'cash', label: t('Efectivo') },
              { value: 'voucher', label: t('Vales de despensa') },
            ]}
            {...form.register('type')}
          />
          <Select
            label={t('Moneda')}
            disabled={isPocket}
            options={(canUseMulticurrency ? Array.from(CURRENCIES) : [form.formState.defaultValues?.currency ?? 'MXN']).map((c) => ({ value: c, label: c }))}
            {...form.register('currency')}
          />
          <Input
            label={t('Saldo inicial')}
            type="number"
            placeholder="0"
            step="0.01"
            {...form.register('initial_balance')}
            error={form.formState.errors.initial_balance?.message}
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...form.register('has_yield')}
              className="cursor-pointer"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {t('Esta cuenta genera rendimientos')}
            </span>
          </label>
          {form.watch('has_yield') && (
            <div className="space-y-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('Rendimiento (%)')}
                  type="number"
                  placeholder="15"
                  step="0.001"
                  {...form.register('yield_rate')}
                  error={form.formState.errors.yield_rate?.message}
                />
                <Select
                  label={t('La tasa es')}
                  options={[
                    { value: 'annual', label: t('Anual') },
                    { value: 'monthly', label: t('Mensual') },
                  ]}
                  {...form.register('yield_rate_period')}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {ratePeriod === 'annual'
                  ? t('Los bancos y SOFIPOs publican la tasa anual. Equivale a {{rate}}% este mes ({{days}} días).', {
                      rate: toMonthlyRate(rateValue, 'annual').toFixed(3),
                      days: daysInMonthOf(),
                    })
                  : t('Equivale a {{rate}}% anual.', {
                      rate: toAnnualRate(rateValue, 'monthly').toFixed(2),
                    })}
              </p>

              <Select
                label={t('Tipo de rendimiento')}
                options={[
                  { value: 'demand', label: t('A la vista (se paga cada mes)') },
                  { value: 'term', label: t('Plazo fijo (se paga al vencer)') },
                ]}
                {...form.register('yield_kind')}
              />

              {form.watch('yield_kind') === 'term' && (
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label={t('Plazo (días)')}
                    type="number"
                    placeholder="90"
                    min="1"
                    {...form.register('yield_term_days')}
                  />
                  <Input
                    label={t('Vence el')}
                    type="date"
                    {...form.register('yield_term_end')}
                  />
                </div>
              )}

              {form.watch('yield_kind') === 'demand' && (
                <div className="space-y-2 rounded-lg border border-dashed border-slate-300 p-3 dark:border-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                      {t('Tramos por monto (opcional)')}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => tiersField.append({ min_amount: 0, rate: 0 })}
                    >
                      + {t('Agregar tramo')}
                    </Button>
                  </div>
                  {tiersField.fields.length > 0 && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t('Son tramos MARGINALES: se ordenan solos por "Desde", sin importar en qué orden los captures. El primero (normalmente "Desde $0") cubre hasta el siguiente tramo, y así sucesivamente. Sustituyen a la tasa de arriba mientras haya al menos uno.')}
                    </p>
                  )}
                  {tiersField.fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
                      <Input
                        label={t('Desde ($)')}
                        type="number"
                        step="0.01"
                        min="0"
                        {...form.register(`yield_tiers.${index}.min_amount` as const)}
                        error={form.formState.errors.yield_tiers?.[index]?.min_amount?.message}
                      />
                      <Input
                        label={t('Tasa (%)')}
                        type="number"
                        step="0.001"
                        {...form.register(`yield_tiers.${index}.rate` as const)}
                        error={form.formState.errors.yield_tiers?.[index]?.rate?.message}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => tiersField.remove(index)}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}

                  {tiersPreview.length > 0 && (
                    <div className="mt-2 space-y-1 rounded-md bg-slate-100 p-2 dark:bg-slate-800/60">
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        {t('Así quedaría:')}
                      </p>
                      {tiersPreview.map((tier, i) => {
                        const from = Number(tier.min_amount) || 0
                        const rate = Number(tier.rate) || 0
                        const next = tiersPreview[i + 1]
                        const isDuplicate = next && (Number(next.min_amount) || 0) === from
                        return (
                          <p
                            key={tier.fieldIndex}
                            className={`text-xs ${isDuplicate ? 'font-medium text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}
                          >
                            {next
                              ? t('De {{from}} a {{to}}: {{rate}}%', {
                                  from: formatMoney(from, formCurrency),
                                  to: formatMoney(Number(next.min_amount) || 0, formCurrency),
                                  rate,
                                })
                              : t('De {{from}} en adelante: {{rate}}%', {
                                  from: formatMoney(from, formCurrency),
                                  rate,
                                })}
                            {isDuplicate && ` — ${t('dos tramos empiezan en el mismo monto')}`}
                          </p>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  {...form.register('withhold_isr')}
                  className="mt-0.5 cursor-pointer"
                />
                <span className="text-sm text-slate-700 dark:text-slate-200">
                  {t('Descontar retención de ISR')}
                  <span className="block text-xs text-slate-400 dark:text-slate-500">
                    {t('Se retiene sobre el capital, no sobre el interés. La tasa la fija cada año la Ley de Ingresos.')}
                  </span>
                </span>
              </label>
              {form.watch('withhold_isr') && (
                <Input
                  label={t('Tasa de ISR anual (%)')}
                  type="number"
                  step="0.001"
                  placeholder={String(DEFAULT_ISR_RATE)}
                  {...form.register('isr_rate')}
                />
              )}
            </div>
          )}
        </div>

        {!isPocket && (
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...form.register('is_scholarship')}
                className="cursor-pointer"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                🎓 {t('Es una cuenta de beca')}
              </span>
            </label>
            {form.watch('is_scholarship') && (
              <Input
                label={t('Nombre de la beca (opcional)')}
                placeholder={t('Ej: Beca Benito Juárez')}
                {...form.register('scholarship_name')}
              />
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending
              ? t('Guardando…')
              : isEdit
                ? t('Guardar cambios')
                : isPocket
                  ? t('Crear apartado')
                  : t('Crear cuenta')}
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
