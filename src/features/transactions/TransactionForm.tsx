import { useEffect, useMemo, useState } from 'react'
import { showAlert } from '@/components/ui/DialogHost'
import { ArrowDownToLine, ArrowLeftRight, ArrowUpFromLine, Banknote, CreditCard, TriangleAlert, Undo2, type LucideIcon } from 'lucide-react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/store/useAuth'
import {
  useTransactions,
  useCreateTransaction,
  useUpdateTransaction,
  useCreateInstallmentPlan,
  useInstallmentPlans,
  useInstallmentPayments,
  useConfirmInstallmentPayments,
  useTransactionRefunds,
  useCancelInstallmentPlan,
  useTransactionLines,
  useReplaceTransactionLines,
} from '@/hooks/useTransactions'
import { TransactionLinesFields } from './TransactionLinesFields'
import { remainingRefundable, checkAndCancelMsiPlan } from '@/lib/refunds'
import {
  computeLineStatement,
  useCreditActivity,
  useCreditLineUsage,
  useCreditLines,
} from '@/hooks/useCreditLines'
import { useCreditLinePeriods } from '@/hooks/useCreditLinePeriods'
import { InterestFields, interestOf, type InterestValue } from './InterestFields'
import { useFxRate } from '@/hooks/useFxRate'
import { useEntitlements } from '@/hooks/useAppConfig'
import { useRecordBudgetAlerts } from '@/hooks/useBudgets'
import { toBaseAmount } from '@/lib/fx'
import { formatMoney } from '@/lib/format'
import { todayISO, formatMonthLabel } from '@/lib/dates'
import {
  monthlyPayment,
  elapsedInstallments,
  isRetroactive,
  installmentSchedule,
  planProgress,
} from '@/lib/installments'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { CurrencyCombobox } from '@/components/ui/CurrencyCombobox'
import { Card } from '@/components/ui/Card'
import { FormSection, Segmented, Switch } from '@/components/ui/FormKit'
import { Money } from '@/components/ui/Money'
import type {
  AccountRow,
  CardRow,
  CategoryRow,
  FamilyCardRow,
  TransactionRow,
} from '@/types/db'

// 'cash_withdrawal' es solo un modo de la UI: al guardar se traduce a un
// 'transfer' interno a la cuenta de efectivo (si el dinero solo pasa a la
// cartera) o a un 'expense' desde la cuenta origen (si ya se gastó / es para
// un pago). No es un kind que se guarde en la base de datos.
const schema = z.object({
  kind: z.enum(['income', 'expense', 'transfer', 'card_payment', 'cash_withdrawal', 'refund']),
  amount: z.coerce.number().positive('Monto debe ser mayor a 0'),
  currency: z.string().regex(/^[A-Z]{3}$/, 'Código de 3 letras'),
  concept: z.string().optional(),
  categoryId: z.string().optional(),
  accountId: z.string().optional(),
  toAccountId: z.string().optional(),
  cardId: z.string().optional(),
  // Pago de tarjeta: línea de crédito a la que se abona.
  toCreditLineId: z.string().optional(),
  // Pago de tarjeta: abono parcial, pago del periodo o liquidación total.
  paymentScope: z.enum(['partial', 'period', 'full']).default('partial'),
  // Transferencia a una cuenta que no es mía (cuenta como egreso).
  isExternal: z.boolean().default(false),
  // Reembolso: compra original que cancela parcial o totalmente.
  refundOfTransactionId: z.string().optional(),
  txDate: z.string(),
  notes: z.string().optional(),
  msi: z.boolean().default(false),
  msiMonths: z.coerce.number().optional(),
  msiInterestFree: z.boolean().default(true),
  // Diferido con intereses: tasa (%) mensual o total; el monto se calcula.
  msiRateMode: z.enum(['monthly', 'total']).default('monthly'),
  msiRate: z.coerce.number().min(0).default(0),
  // Un MSI puede registrarse tarde, con mensualidades ya pagadas.
  msiStartDate: z.string().optional(),
  msiPaidPrevious: z.boolean().default(false),
  msiPaidCount: z.coerce.number().optional(),
  familyExpense: z.boolean().default(false),
  // Retiro de efectivo: ON = ya lo gastaste / es para un pago (cuenta como
  // egreso ya); OFF = solo lo tienes en la cartera (aún no es egreso).
  spentAsCash: z.boolean().default(false),
  // Subpartidas (opcional, solo para kind='expense'): desglose del gasto en
  // líneas con su propio concepto/monto/categoría.
  lines: z
    .array(
      z.object({
        concept: z.string().min(1, 'El concepto es obligatorio'),
        amount: z.coerce.number().positive('El monto debe ser mayor a 0'),
        categoryId: z.string().optional(),
      }),
    )
    .default([]),
}).superRefine((data, ctx) => {
  if (data.kind !== 'expense' || data.lines.length === 0) return
  const sum = data.lines.reduce((s, l) => s + (l.amount || 0), 0)
  const diff = Math.round((data.amount - sum) * 100) / 100
  if (Math.abs(diff) > 0.01) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['lines'],
      message:
        diff > 0
          ? `Restan ${diff.toFixed(2)} ${data.currency} por asignar`
          : `Te pasaste por ${Math.abs(diff).toFixed(2)} ${data.currency}`,
    })
  }
})

type FormData = z.infer<typeof schema>

interface TransactionFormProps {
  accounts: AccountRow[]
  cards: CardRow[]
  categories: CategoryRow[]
  // Tarjetas compartidas de mi familia (vista family_cards, sin límite).
  familyCards?: FamilyCardRow[]
  // Si viene, el formulario edita esa transacción en lugar de crear una nueva.
  transaction?: TransactionRow
  // Prefill (p. ej. botón "Pagar" de una línea de crédito, o un aviso de
  // transferencia al que le falta el monto).
  initial?: {
    kind?: FormData['kind']
    toCreditLineId?: string
    amount?: number
    concept?: string
    accountId?: string
    isExternal?: boolean
    txDate?: string
    currency?: string
  }
  // Al crear recibe el id de la transacción nueva.
  onSuccess?: (createdId?: string) => void
  onCancel?: () => void
}

const KIND_OPTIONS: { value: FormData['kind']; label: string; Icon: LucideIcon }[] = [
  { value: 'income', label: 'Ingreso', Icon: ArrowDownToLine },
  { value: 'expense', label: 'Egreso', Icon: ArrowUpFromLine },
  { value: 'transfer', label: 'Transferencia', Icon: ArrowLeftRight },
  { value: 'card_payment', label: 'Pago de tarjeta', Icon: CreditCard },
  { value: 'cash_withdrawal', label: 'Retiro de efectivo', Icon: Banknote },
  { value: 'refund', label: 'Reembolso', Icon: Undo2 },
]

// Tinta del monto según el tipo de movimiento (entra / sale / neutro).
const AMOUNT_TONE: Record<string, string> = {
  income: 'text-line-green',
  expense: 'text-line-scarlet',
  refund: 'text-line-green',
}

export function TransactionForm({
  accounts,
  cards,
  categories,
  familyCards = [],
  transaction,
  initial,
  onSuccess,
  onCancel,
}: TransactionFormProps) {
  const { t } = useTranslation()
  const { session, profile } = useAuth()
  const userId = session?.user?.id
  const isEdit = !!transaction
  const createTransaction = useCreateTransaction()
  const updateTransaction = useUpdateTransaction()
  const createInstallment = useCreateInstallmentPlan()
  const confirmInstallments = useConfirmInstallmentPayments()
  const cancelInstallmentPlan = useCancelInstallmentPlan()
  const recordBudgetAlerts = useRecordBudgetAlerts()
  const { canUseInstallments, canUse } = useEntitlements()
  const mainCurrency = profile?.main_currency ?? 'MXN'

  const creditLinesQuery = useCreditLines(userId)
  const plansQuery = useInstallmentPlans(userId)
  const paymentsQuery = useInstallmentPayments(userId)
  const creditLines = creditLinesQuery.data || []
  const plans = plansQuery.data || []
  const payments = paymentsQuery.data || []

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: transaction
      ? {
          kind: transaction.kind,
          amount: transaction.amount,
          currency: transaction.currency,
          concept: transaction.concept ?? '',
          categoryId: transaction.category_id ?? '',
          accountId: transaction.account_id ?? '',
          toAccountId: transaction.to_account_id ?? '',
          cardId: transaction.card_id ?? '',
          toCreditLineId: transaction.to_credit_line_id ?? '',
          paymentScope: transaction.payment_scope ?? 'partial',
          isExternal: transaction.is_external,
          refundOfTransactionId: transaction.refund_of_transaction_id ?? '',
          txDate: transaction.tx_date,
          notes: transaction.notes ?? '',
          msi: false,
          msiInterestFree: true,
          msiStartDate: todayISO(),
          msiPaidPrevious: false,
          lines: [],
        }
      : {
          kind: initial?.kind ?? 'expense',
          currency: initial?.currency ?? mainCurrency,
          amount: initial?.amount as any,
          concept: initial?.concept ?? '',
          accountId: initial?.accountId ?? '',
          toCreditLineId: initial?.toCreditLineId ?? '',
          // El botón "Pagar" de una línea trae el monto del periodo.
          paymentScope: initial?.toCreditLineId && initial?.amount ? 'period' : 'partial',
          refundOfTransactionId: '',
          txDate: initial?.txDate ?? todayISO(),
          isExternal: initial?.isExternal ?? false,
          msi: false,
          msiInterestFree: true,
          msiStartDate: todayISO(),
          msiPaidPrevious: false,
          lines: [],
        },
  })

  const replaceLines = useReplaceTransactionLines()
  const existingLinesQuery = useTransactionLines(transaction ? [transaction.id] : [])
  const linesField = useFieldArray({ control: form.control, name: 'lines' })

  // Precarga las líneas ya guardadas al editar (llegan por una query aparte,
  // no por defaultValues, porque el formulario ya está montado con la
  // transacción antes de que ese fetch resuelva).
  useEffect(() => {
    if (!transaction) return
    const existing = existingLinesQuery.data?.get(transaction.id)
    if (existing) {
      linesField.replace(
        existing.map((l) => ({
          concept: l.concept,
          amount: l.amount,
          categoryId: l.category_id ?? '',
        })),
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transaction?.id, existingLinesQuery.dataUpdatedAt])

  const txKind = form.watch('kind')
  const cardId = form.watch('cardId')
  const currency = form.watch('currency')
  const amountRaw = form.watch('amount')
  const isExternal = form.watch('isExternal')
  const toCreditLineId = form.watch('toCreditLineId')
  const refundOfTransactionId = form.watch('refundOfTransactionId')

  // Reembolso: gastos recientes para elegir la compra original, y sus
  // reembolsos ya registrados para prellenar el monto restante.
  const refundableExpensesQuery = useTransactions(userId, { kind: 'expense' }, 100)
  const refundableExpenses = refundableExpensesQuery.data || []
  const selectedOriginal = refundableExpenses.find((e) => e.id === refundOfTransactionId)
  const originalRefundsQuery = useTransactionRefunds(selectedOriginal?.id)
  const originalRefunds = originalRefundsQuery.data || []
  const originalRemaining = selectedOriginal
    ? remainingRefundable(selectedOriginal, originalRefunds)
    : 0

  // Al elegir (o cambiar) la compra a reembolsar, copiar cuenta/tarjeta/
  // categoría/moneda y proponer el monto restante. Solo al crear: si se
  // edita un reembolso ya guardado, no se pisa lo que el usuario ajustó.
  useEffect(() => {
    if (isEdit || !selectedOriginal) return
    form.setValue('accountId', selectedOriginal.account_id ?? '')
    form.setValue('cardId', selectedOriginal.card_id ?? '')
    form.setValue('categoryId', selectedOriginal.category_id ?? '')
    form.setValue('currency', selectedOriginal.currency)
    form.setValue(
      'amount',
      (originalRemaining > 0 ? originalRemaining : selectedOriginal.amount) as any,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, selectedOriginal?.id, originalRefundsQuery.dataUpdatedAt])

  // Multimoneda: cuando la moneda del movimiento difiere de la principal, se
  // obtiene el tipo de cambio (editable) para convertir a la moneda principal.
  const txDate = form.watch('txDate')
  const needsFx = !!currency && currency !== mainCurrency
  const fxQuery = useFxRate(currency, mainCurrency, needsFx, txDate)
  const [rateInput, setRateInput] = useState('')

  useEffect(() => {
    if (!needsFx) {
      setRateInput('')
    } else if (fxQuery.data?.rate) {
      setRateInput(String(fxQuery.data.rate))
    }
  }, [needsFx, fxQuery.data?.rate])

  const effectiveRate = needsFx ? Number(rateInput) || 0 : 1
  const amountNum = Number(amountRaw) || 0
  const basePreview = needsFx ? toBaseAmount(amountNum, effectiveRate) : amountNum
  const msi = form.watch('msi')
  const msiMonths = Number(form.watch('msiMonths')) || 0
  const msiStartDate = form.watch('msiStartDate') || todayISO()
  const msiPaidPrevious = form.watch('msiPaidPrevious')
  const familyExpense = form.watch('familyExpense')
  const spentAsCash = form.watch('spentAsCash')

  // Destino de un retiro de efectivo: solo cuentas de efectivo (la cartera).
  const cashAccounts = accounts.filter((a) => a.type === 'cash')

  // Un MSI que arrancó meses atrás: hay que preguntar si esas mensualidades
  // ya se pagaron, si no el histórico queda negativo por un gasto que en
  // realidad se venía cubriendo.
  const msiIsRetroactive = msi && msiMonths > 0 && isRetroactive(msiStartDate)
  const msiElapsed = msiIsRetroactive ? elapsedInstallments(msiStartDate, msiMonths) : 0
  const msiPaidCount = Math.min(
    Number(form.watch('msiPaidCount')) || 0,
    msiMonths || 0,
  )
  const msiInterestValue: InterestValue = {
    interestFree: form.watch('msiInterestFree'),
    rateMode: form.watch('msiRateMode'),
    rate: Number(form.watch('msiRate')) || 0,
  }
  const msiInterestAmount = interestOf(msiInterestValue, amountNum, msiMonths)
  const msiMonthly = monthlyPayment(amountNum, msiInterestAmount, msiMonths)

  // Al marcar "ya pagué", se propone por defecto lo transcurrido.
  useEffect(() => {
    if (msiPaidPrevious && !form.getValues('msiPaidCount')) {
      form.setValue('msiPaidCount', msiElapsed)
    }
  }, [msiPaidPrevious, msiElapsed, form])
  const selectedCard = cards.find((c) => c.id === cardId)
  const isCredit = selectedCard?.type === 'credit'

  const myUserId = session?.user?.id
  // Tarjetas familiares ajenas (del jefe de familia): entran al selector.
  const foreignFamilyCards = familyCards.filter((c) => c.owner_id !== myUserId)
  const selectedForeignCard = foreignFamilyCards.find(
    (c) => c.card_id === cardId,
  )
  // Mi tarjeta propia que además está compartida: permite marcar el gasto
  // como familiar con el checkbox.
  const ownSharedCard = familyCards.find(
    (c) => c.owner_id === myUserId && c.card_id === cardId,
  )
  const isFamilyTx = !!selectedForeignCard || (!!ownSharedCard && familyExpense)

  // --- Conciliación MSI al pagar la tarjeta -------------------------------
  // Meses ya pagados por plan, para calcular el avance.
  const paidByPlan = useMemo(() => {
    const m = new Map<string, Set<string>>()
    for (const p of payments) {
      if (!m.has(p.plan_id)) m.set(p.plan_id, new Set())
      m.get(p.plan_id)!.add(p.period_month)
    }
    return m
  }, [payments])

  const cardLineOf = (id: string | null) =>
    id ? cards.find((c) => c.id === id)?.credit_line_id ?? null : null

  // Planes activos de la línea que se está pagando, con su mensualidad pendiente.
  const linePlans = useMemo(() => {
    if (txKind !== 'card_payment' || !toCreditLineId) return []
    return plans
      .filter((p) => cardLineOf(p.card_id) === toCreditLineId)
      .map((p) => ({
        plan: p,
        progress: planProgress(
          { start_date: p.start_date, months: p.months, monthly_payment: p.monthly_payment },
          paidByPlan.get(p.id) ?? new Set<string>(),
        ),
      }))
      .filter((x) => x.progress.remainingCount > 0 && x.progress.nextDuePeriod && !x.plan.cancelled_at)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txKind, toCreditLineId, plans, paidByPlan, cards])

  const [msiToPay, setMsiToPay] = useState<Record<string, boolean>>({})

  // --- Alcance del pago de tarjeta ---------------------------------------
  // "Del periodo" = lo a pagar del estado de cuenta vigente menos lo ya
  // abonado; "Total" = toda la deuda de la línea (incluye lo no facturado y
  // las mensualidades MSI que faltan).
  const paymentScope = form.watch('paymentScope')
  const activityQuery = useCreditActivity(userId)
  const periodsQuery = useCreditLinePeriods(userId)
  const lineUsageQuery = useCreditLineUsage(userId)
  const selectedLine = creditLines.find((l) => l.id === toCreditLineId)
  const lineDue = useMemo(() => {
    if (txKind !== 'card_payment' || !selectedLine) return null
    const st = computeLineStatement(
      selectedLine, cards, activityQuery.data || [], periodsQuery.data || [], plans, payments,
    )
    const used = (lineUsageQuery.data || []).find((u) => u.credit_line_id === selectedLine.id)?.used ?? 0
    return {
      period: Math.max(0, Math.round((st.amount - st.paid) * 100) / 100),
      full: Math.max(0, used),
      currency: selectedLine.currency,
    }
  }, [txKind, selectedLine, cards, activityQuery.data, periodsQuery.data, lineUsageQuery.data, plans, payments])

  function choosePaymentScope(scope: FormData['paymentScope']) {
    form.setValue('paymentScope', scope)
    if (scope === 'partial') {
      setMsiToPay({})
      return
    }
    const due = scope === 'period' ? lineDue?.period : lineDue?.full
    if (due && due > 0) {
      form.setValue('amount', due as any)
      if (lineDue) form.setValue('currency', lineDue.currency)
    }
    setMsiToPay(Object.fromEntries(linePlans.map((x) => [x.plan.id, true])))
  }

  async function onSubmit(data: FormData) {
    if (!userId) return

    // Validaciones según tipo
    if (data.kind === 'income' && !data.accountId) {
      showAlert(t('Selecciona la cuenta destino'))
      return
    }
    if (data.kind === 'expense' && !data.accountId && !data.cardId) {
      showAlert(t('Selecciona una cuenta o tarjeta'))
      return
    }
    if (data.kind === 'transfer' && !data.accountId) {
      showAlert(t('Selecciona la cuenta origen'))
      return
    }
    if (data.kind === 'transfer' && !data.isExternal && !data.toAccountId) {
      showAlert(t('Selecciona la cuenta destino'))
      return
    }
    if (
      data.kind === 'transfer' &&
      !data.isExternal &&
      data.accountId === data.toAccountId
    ) {
      showAlert(t('Las cuentas no pueden ser la misma'))
      return
    }
    if (data.kind === 'card_payment' && (!data.accountId || !data.toCreditLineId)) {
      showAlert(t('Selecciona la cuenta origen y la línea de crédito a pagar'))
      return
    }
    if (data.kind === 'refund' && !data.refundOfTransactionId) {
      showAlert(t('Selecciona la compra a reembolsar'))
      return
    }
    if (data.kind === 'cash_withdrawal') {
      if (!data.accountId) {
        showAlert(t('Selecciona la cuenta de la que retiras el efectivo'))
        return
      }
      if (!data.spentAsCash && !data.toAccountId) {
        showAlert(t('Selecciona la cuenta de efectivo a la que va el retiro'))
        return
      }
      if (!data.spentAsCash && data.accountId === data.toAccountId) {
        showAlert(t('Las cuentas no pueden ser la misma'))
        return
      }
    }

    const familyId = selectedForeignCard
      ? selectedForeignCard.family_id
      : ownSharedCard && data.familyExpense
        ? ownSharedCard.family_id
        : undefined

    // Conversión a la moneda principal.
    const fxRate = data.currency !== mainCurrency ? effectiveRate : 1
    const baseAmount = toBaseAmount(data.amount, fxRate)
    if (data.currency !== mainCurrency && (!fxRate || fxRate <= 0)) {
      showAlert(t('Escribe un tipo de cambio válido.'))
      return
    }

    // Resolver cuenta/tarjeta según el tipo.
    let resolvedAccountId: string | undefined
    let resolvedToAccountId: string | undefined
    let resolvedCardId: string | undefined
    let resolvedToCreditLineId: string | undefined
    let resolvedCategoryId: string | undefined = data.categoryId || undefined
    let external = false
    // 'cash_withdrawal' no se guarda como tal: se traduce a expense/transfer.
    let resolvedKind: TransactionRow['kind'] =
      data.kind === 'cash_withdrawal'
        ? data.spentAsCash
          ? 'expense'
          : 'transfer'
        : data.kind

    if (data.kind === 'cash_withdrawal') {
      // Sale de la cuenta origen en ambos casos.
      resolvedAccountId = data.accountId || undefined
      if (data.spentAsCash) {
        // Ya se gastó / es para un pago: egreso inmediato desde la cuenta.
        // Conserva concepto y categoría.
      } else {
        // Solo pasa a la cartera: transferencia interna, aún no es egreso.
        resolvedToAccountId = data.toAccountId || undefined
        resolvedCategoryId = undefined
      }
    } else if (data.kind === 'income') {
      resolvedAccountId = data.accountId || undefined
    } else if (data.kind === 'expense') {
      resolvedCardId = data.cardId || undefined
      if (resolvedCardId) {
        // Débito y vales descuentan de su cuenta ligada; crédito no toca cuenta.
        const card = cards.find((c) => c.id === resolvedCardId)
        if (card?.type === 'debit' || card?.type === 'voucher') {
          resolvedAccountId = card.account_id || undefined
        } else if (!card) {
          // Tarjeta familiar ajena: gasto sin cuenta propia.
          resolvedAccountId = undefined
        }
      } else {
        resolvedAccountId = data.accountId || undefined
      }
    } else if (data.kind === 'transfer') {
      resolvedAccountId = data.accountId || undefined
      external = data.isExternal
      resolvedToAccountId = external ? undefined : data.toAccountId || undefined
    } else if (data.kind === 'card_payment') {
      resolvedAccountId = data.accountId || undefined
      resolvedToCreditLineId = data.toCreditLineId || undefined
      resolvedCategoryId = undefined
    } else if (data.kind === 'refund') {
      resolvedAccountId = data.accountId || undefined
      resolvedCardId = data.cardId || undefined
    }

    // Reevalúa los presupuestos para que el aviso salga al instante y no en el
    // siguiente refresco. Va suelto a propósito: si fallara, no debe tumbar el
    // guardado, y el BudgetAlertWatcher lo reintentaría solo. Los gastos
    // familiares no cuentan (los presupuestos son individuales en este MVP).
    const notifyBudgets = () => {
      if (resolvedKind === 'expense' && !familyId) {
        recordBudgetAlerts.mutate({ userId })
      }
    }

    try {
      if (isEdit && transaction) {
        await updateTransaction.mutateAsync({
          id: transaction.id,
          userId,
          kind: resolvedKind,
          amount: data.amount,
          currency: data.currency,
          fxRate,
          baseAmount,
          concept: data.concept,
          categoryId: resolvedCategoryId ?? null,
          accountId: resolvedAccountId ?? null,
          toAccountId: resolvedToAccountId ?? null,
          cardId: resolvedCardId ?? null,
          toCreditLineId: resolvedToCreditLineId ?? null,
          paymentScope: data.paymentScope,
          isExternal: external,
          refundOfTransactionId: data.refundOfTransactionId || null,
          txDate: data.txDate,
          notes: data.notes,
        })
        // Reemplaza el desglose completo (borra + inserta el set nuevo). Si
        // se editó a un kind distinto de 'expense', se limpia lo que hubiera.
        await replaceLines.mutateAsync({
          userId,
          transactionId: transaction.id,
          lines:
            data.kind === 'expense'
              ? data.lines.map((l) => ({
                  concept: l.concept,
                  amount: l.amount,
                  categoryId: l.categoryId,
                }))
              : [],
        })
        notifyBudgets()
        onSuccess?.()
        return
      }

      const tx = await createTransaction.mutateAsync({
        userId,
        kind: resolvedKind,
        amount: data.amount,
        currency: data.currency,
        fxRate,
        baseAmount,
        concept: data.concept,
        categoryId: resolvedCategoryId,
        // Un gasto familiar va solo contra la tarjeta, nunca contra una cuenta.
        accountId: familyId ? undefined : resolvedAccountId,
        toAccountId: resolvedToAccountId,
        cardId: resolvedCardId,
        toCreditLineId: resolvedToCreditLineId,
        paymentScope: data.kind === 'card_payment' ? data.paymentScope : undefined,
        isExternal: external,
        refundOfTransactionId: data.refundOfTransactionId || undefined,
        txDate: data.txDate,
        notes: data.notes,
        familyId,
      })

      if (data.kind === 'expense' && data.lines.length > 0) {
        await replaceLines.mutateAsync({
          userId,
          transactionId: tx.id,
          lines: data.lines.map((l) => ({
            concept: l.concept,
            amount: l.amount,
            categoryId: l.categoryId,
          })),
        })
      }

      // MSI/diferido (premium): crear el plan y sembrar el ledger de meses ya
      // pagados (en lugar del viejo ingreso de "Ajuste de saldo").
      if (
        canUseInstallments &&
        msi &&
        isCredit &&
        !familyId &&
        data.msiMonths &&
        data.msiMonths > 0
      ) {
        const plan = await createInstallment.mutateAsync({
          userId,
          cardId: cardId!,
          transactionId: tx.id,
          description: data.concept || t('Compra'),
          totalAmount: data.amount,
          currency: data.currency,
          months: data.msiMonths,
          isInterestFree: data.msiInterestFree,
          interestAmount: msiInterestAmount,
          interestRate: data.msiRate,
          interestRateMode: data.msiRateMode,
          startDate: data.msiStartDate,
        })

        const paid = Math.min(data.msiPaidCount || 0, data.msiMonths)
        if (data.msiPaidPrevious && paid > 0) {
          const monthly = monthlyPayment(data.amount, msiInterestAmount, data.msiMonths)
          const schedule = installmentSchedule(
            data.msiStartDate || todayISO(),
            data.msiMonths,
            monthly,
          )
          await confirmInstallments.mutateAsync({
            userId,
            rows: schedule.slice(0, paid).map((s) => ({
              planId: plan.id,
              periodMonth: s.periodMonth,
              amount: s.amount,
            })),
          })
        }
      }

      // Reembolso: si la compra original tenía un plan MSI y lo ya reembolsado
      // (incluyendo este) alcanza su total, se cancela — deja de pedir/sumar
      // mensualidades futuras.
      if (data.kind === 'refund' && data.refundOfTransactionId) {
        await checkAndCancelMsiPlan(
          userId,
          data.refundOfTransactionId,
          plans,
          [...originalRefunds, tx as TransactionRow],
          cancelInstallmentPlan,
        )
      }

      // Pago de tarjeta: conciliar las mensualidades MSI marcadas del periodo.
      // Una liquidación total salda TODAS las que le faltan a cada plan marcado.
      if (data.kind === 'card_payment') {
        const paidSet = (planId: string) => paidByPlan.get(planId) ?? new Set<string>()
        const rows = linePlans
          .filter((x) => msiToPay[x.plan.id] && x.progress.nextDuePeriod)
          .flatMap((x) =>
            (data.paymentScope === 'full'
              ? x.progress.schedule.filter((s) => !paidSet(x.plan.id).has(s.periodMonth))
              : x.progress.schedule.filter((s) => s.periodMonth === x.progress.nextDuePeriod)
            ).map((s) => ({ planId: x.plan.id, periodMonth: s.periodMonth, amount: s.amount })),
          )
        if (rows.length > 0) {
          await confirmInstallments.mutateAsync({ userId, rows })
        }
      }

      form.reset()
      setMsiToPay({})
      notifyBudgets()
      onSuccess?.(tx.id)
    } catch (error: any) {
      showAlert(`Error: ${error.message}`)
    }
  }

  const submitting =
    createTransaction.isPending || updateTransaction.isPending

  return (
    <Card className="mb-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Tipo: todas las opciones a la vista, con icono */}
        <div>
          <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">{t('Tipo')}</span>
          <div role="radiogroup" aria-label={t('Tipo')} className="grid grid-cols-[repeat(auto-fit,minmax(6rem,1fr))] gap-2">
            {KIND_OPTIONS.map((k) => {
              const selected = txKind === k.value
              return (
                <button
                  key={k.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => form.setValue('kind', k.value, { shouldValidate: true })}
                  className={`flex min-w-0 flex-col items-center gap-1 rounded-md border px-2 py-2.5 text-center text-xs font-semibold transition-colors ${
                    selected
                      ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-800/40 dark:text-brand-500'
                      : 'border-slate-200 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  <k.Icon className="h-5 w-5" aria-hidden="true" />
                  {t(k.label)}
                </button>
              )
            })}
          </div>
        </div>

        {/* Monto: la cifra protagonista, con la tinta del tipo de movimiento */}
        <FormSection title={t('Monto')}>
          <Input
            aria-label={t('Monto')}
            type="number"
            step="0.01"
            inputMode="decimal"
            placeholder="0.00"
            className={`!py-3 !text-3xl !font-bold tracking-tight ${AMOUNT_TONE[txKind] ?? ''}`}
            {...form.register('amount')}
            error={form.formState.errors.amount?.message}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <CurrencyCombobox
              label={t('Moneda')}
              value={currency}
              onChange={(c) => form.setValue('currency', c, { shouldValidate: true })}
              error={form.formState.errors.currency?.message}
            />
            <Input
              label={t('Fecha')}
              type="date"
              {...form.register('txDate')}
              error={form.formState.errors.txDate?.message}
            />
          </div>

        {/* Conversión a la moneda principal (solo si difiere) */}
        {needsFx && (
          <div className="space-y-2 rounded-lg border border-line-cobalt/30 bg-line-cobalt/10 p-3">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={t('Tipo de cambio ({{from}}→{{to}})', {
                  from: currency,
                  to: mainCurrency,
                })}
                type="number"
                step="0.0001"
                value={rateInput}
                onChange={(e) => setRateInput(e.target.value)}
                placeholder={fxQuery.isLoading ? t('Obteniendo…') : '0.00'}
              />
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  {t('Equivale a')}
                </label>
                <p className="rounded-lg bg-surface px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  ≈ {formatMoney(basePreview, mainCurrency)}
                </p>
              </div>
            </div>
            <p className="text-xs text-line-cobalt">
              {fxQuery.isError
                ? t('No se obtuvo el tipo de cambio automático. Escríbelo manualmente.')
                : fxQuery.data?.historical === false
                  ? t('Tipo de cambio aproximado de hoy (no del día de la transacción). Ajústalo si lo necesitas.')
                  : t('Puedes ajustar el tipo de cambio si lo necesitas.')}
            </p>
          </div>
        )}

        </FormSection>

        {/* Concepto y categoría (no aplica a pago de tarjeta) */}
        <FormSection title={t('Descripción')}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('Concepto')}
            placeholder={t('Ej: Almuerzo')}
            {...form.register('concept')}
          />
          {(txKind === 'income' ||
            txKind === 'expense' ||
            txKind === 'refund' ||
            txKind === 'transfer' ||
            (txKind === 'cash_withdrawal' && spentAsCash)) && (
            <Select
              label={t('Categoría')}
              options={[
                { value: '', label: t('Sin categoría') },
                ...categories
                  .filter((c) => c.kind === (txKind === 'income' ? 'income' : 'expense'))
                  .map((c) => ({ value: c.id, label: `${c.icon} ${c.name}` })),
              ]}
              {...form.register('categoryId')}
            />
          )}
        </div>

        </FormSection>

        {/* Cuentas/Tarjetas según tipo */}
        <FormSection title={t('Cuentas')}>
        {txKind === 'income' && (
          <Select
            label={t('Cuenta destino')}
            options={[
              { value: '', label: t('Selecciona una cuenta') },
              ...accounts.map((a) => ({ value: a.id, label: a.name })),
            ]}
            {...form.register('accountId')}
            error={
              !form.watch('accountId') ? t('Requerida') : undefined
            }
          />
        )}

        {txKind === 'expense' && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label={t('Cuenta')}
                disabled={!!selectedForeignCard}
                options={[
                  { value: '', label: t('Selecciona una cuenta') },
                  ...accounts.map((a) => ({ value: a.id, label: a.name })),
                ]}
                {...form.register('accountId')}
              />
              <Select
                label={t('O tarjeta')}
                options={[
                  { value: '', label: t('Selecciona una tarjeta') },
                  ...cards.map((c) => ({ value: c.id, label: c.name })),
                  ...foreignFamilyCards.map((c) => ({
                    value: c.card_id,
                    label: `${c.name} · ${t('Familiar')}`,
                  })),
                ]}
                {...form.register('cardId')}
              />
            </div>
            {selectedForeignCard && (
              <p className="rounded-lg bg-brand-50 dark:bg-brand-800/40 p-2 text-xs text-brand-700 dark:text-brand-500">
                {t('Este gasto se registrará en el plan familiar, no en tus finanzas personales.')}
              </p>
            )}
            {ownSharedCard && !selectedForeignCard && (
              <Switch
                checked={!!form.watch('familyExpense')}
                onChange={(v) => form.setValue('familyExpense', v)}
                label={t('Gasto familiar (se registra en el plan familiar)')}
              />
            )}
            {canUse('transaction_lines') && (
              <TransactionLinesFields
                lines={form.watch('lines') ?? []}
                onChange={(i, patch) => {
                  if (patch.concept !== undefined) form.setValue(`lines.${i}.concept`, patch.concept)
                  if (patch.amount !== undefined) form.setValue(`lines.${i}.amount`, patch.amount)
                  if (patch.categoryId !== undefined)
                    form.setValue(`lines.${i}.categoryId`, patch.categoryId)
                }}
                onAdd={() => linesField.append({ concept: '', amount: 0, categoryId: '' })}
                onRemove={(i) => linesField.remove(i)}
                categories={categories.filter((c) => c.kind === 'expense')}
                currency={currency}
                totalAmount={amountNum}
              />
            )}
            {form.formState.errors.lines?.message && (
              <p className="text-xs text-line-scarlet">
                {form.formState.errors.lines.message as string}
              </p>
            )}
          </>
        )}

        {txKind === 'transfer' && (
          <div className="space-y-3">
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label={t('Cuenta origen')}
                options={[
                  { value: '', label: t('Selecciona origen') },
                  ...accounts.map((a) => ({ value: a.id, label: a.name })),
                ]}
                {...form.register('accountId')}
              />
              {!isExternal && (
                <Select
                  label={t('Cuenta destino')}
                  options={[
                    { value: '', label: t('Selecciona destino') },
                    ...accounts.map((a) => ({ value: a.id, label: a.name })),
                  ]}
                  {...form.register('toAccountId')}
                />
              )}
            </div>
            <Switch
                checked={!!form.watch('isExternal')}
                onChange={(v) => form.setValue('isExternal', v)}
                label={t('La cuenta destino no es mía (cuenta externa)')}
              />
            {isExternal && (
              <p className="rounded-lg bg-line-amber/10 p-2 text-xs text-line-amber">
                {t('Sale dinero de verdad: se contará como egreso en tus reportes.')}
              </p>
            )}
          </div>
        )}

        {txKind === 'cash_withdrawal' && (
          <div className="space-y-3">
            <Select
              label={t('Retiras de')}
              options={[
                { value: '', label: t('Selecciona la cuenta') },
                ...accounts
                  .filter((a) => a.type !== 'cash')
                  .map((a) => ({ value: a.id, label: a.name })),
              ]}
              {...form.register('accountId')}
            />

            <Switch
                checked={!!form.watch('spentAsCash')}
                onChange={(v) => form.setValue('spentAsCash', v)}
                label={t('Ya lo gastaste o es para un pago')}
                description={t('Actívalo si el efectivo ya se usó: contará como egreso ahora. Déjalo apagado si solo lo tienes en la cartera.')}
              />

            {spentAsCash ? (
              <p className="rounded-lg bg-line-amber/10 p-2 text-xs text-line-amber">
                {t('Se registrará como egreso desde la cuenta de la que retiras.')}
              </p>
            ) : (
              <>
                <Select
                  label={t('Efectivo va a (cartera)')}
                  options={[
                    { value: '', label: t('Selecciona la cuenta de efectivo') },
                    ...cashAccounts.map((a) => ({ value: a.id, label: a.name })),
                  ]}
                  {...form.register('toAccountId')}
                />
                {cashAccounts.length === 0 && (
                  <p className="rounded-lg bg-line-amber/10 p-2 text-xs text-line-amber">
                    {t('No tienes una cuenta de tipo Efectivo. Crea una en Cuentas para guardar el efectivo de la cartera.')}
                  </p>
                )}
                <p className="rounded-lg bg-slate-100 dark:bg-slate-800 p-2 text-xs text-slate-500 dark:text-slate-400">
                  {t('Solo pasa a tu cartera: aún no es egreso. Lo será cuando registres el gasto de ese efectivo.')}
                </p>
              </>
            )}
          </div>
        )}

        {txKind === 'card_payment' && (
          <div className="space-y-3">
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label={t('Cuenta origen')}
                options={[
                  { value: '', label: t('Selecciona la cuenta') },
                  ...accounts.map((a) => ({ value: a.id, label: a.name })),
                ]}
                {...form.register('accountId')}
              />
              <Select
                label={t('Línea de crédito a pagar')}
                options={[
                  { value: '', label: t('Selecciona la línea') },
                  ...creditLines.map((l) => ({ value: l.id, label: l.name })),
                ]}
                {...form.register('toCreditLineId')}
              />
            </div>

            <Segmented<FormData['paymentScope']>
              label={t('¿Qué estás pagando?')}
              value={paymentScope}
              onChange={choosePaymentScope}
              options={[
                { value: 'partial', label: t('Abono parcial') },
                { value: 'period', label: t('Pago del periodo') },
                { value: 'full', label: t('Total adeudado') },
              ]}
            />
            {lineDue && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {paymentScope === 'partial'
                  ? t('Abonas una parte; el resto del periodo sigue pendiente.')
                  : paymentScope === 'period'
                    ? t('Lo que pide el estado de cuenta para no generar intereses: {{amount}}.', {
                        amount: formatMoney(lineDue.period, lineDue.currency),
                      })
                    : t('Liquidas toda la deuda de la línea, incluido lo aún no facturado y los meses que faltan: {{amount}}.', {
                        amount: formatMoney(lineDue.full, lineDue.currency),
                      })}
              </p>
            )}

            {/* Conciliación MSI: marcar la mensualidad del periodo por plan. */}
            {linePlans.length > 0 && (
              <div className="space-y-2 rounded-lg border border-line-amber/30 bg-line-amber/10 p-3">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  <CreditCard className="me-1.5 inline h-4 w-4 align-[-2px]" aria-hidden="true" /> {t('Meses sin intereses de esta línea')}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {t('Marca las mensualidades que cubre este pago.')}
                </p>
                {linePlans.map((x) => (
                  <label key={x.plan.id} className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      className="mt-1 cursor-pointer"
                      checked={!!msiToPay[x.plan.id]}
                      onChange={(e) =>
                        setMsiToPay((prev) => ({
                          ...prev,
                          [x.plan.id]: e.target.checked,
                        }))
                      }
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-200">
                      {x.plan.description || t('Compra')} ·{' '}
                      {formatMoney(x.progress.monthly, x.plan.currency)}{' '}
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        ({t('mensualidad de {{month}}; van {{paid}}/{{total}})', {
                          month: x.progress.nextDuePeriod
                            ? formatMonthLabel(x.progress.nextDuePeriod)
                            : '',
                          paid: x.progress.paidCount,
                          total: x.progress.months,
                        })}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {txKind === 'refund' && (
          <div className="space-y-2">
            <Select
              label={t('Compra a reembolsar')}
              options={[
                { value: '', label: t('Selecciona una compra') },
                ...refundableExpenses.map((e) => ({
                  value: e.id,
                  label: `${e.concept || t('Sin concepto')} · ${formatMoney(e.amount, e.currency)} · ${e.tx_date}`,
                })),
              ]}
              {...form.register('refundOfTransactionId')}
            />
            {selectedOriginal && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {originalRemaining < selectedOriginal.amount ? (
                  <>
                    {t('Ya reembolsado')}{' '}
                    <Money
                      amount={selectedOriginal.amount - originalRemaining}
                      currency={selectedOriginal.currency}
                    />{' '}
                    {t('de')}{' '}
                    <Money amount={selectedOriginal.amount} currency={selectedOriginal.currency} />
                  </>
                ) : (
                  <>
                    {t('Monto de la compra')}{' '}
                    <Money amount={selectedOriginal.amount} currency={selectedOriginal.currency} />
                  </>
                )}
              </p>
            )}
          </div>
        )}

        {/* MSI/Diferido (solo al crear; crédito, egreso; no aplica a gastos familiares) */}
        {!isEdit &&
          canUseInstallments &&
          txKind === 'expense' &&
          !isFamilyTx &&
          isCredit && (
            <div className="space-y-2 rounded-lg border border-line-amber/30 bg-line-amber/10 p-3">
              <Switch
                checked={!!form.watch('msi')}
                onChange={(v) => form.setValue('msi', v)}
                label={t('Meses sin intereses / Diferido')}
              />
              {msi && (
                <>
                  <Input
                    label={t('Meses')}
                    type="number"
                    min="1"
                    max="48"
                    {...form.register('msiMonths')}
                    error={form.formState.errors.msiMonths?.message}
                  />
                  <InterestFields
                    value={msiInterestValue}
                    onChange={(v) => {
                      form.setValue('msiInterestFree', v.interestFree)
                      form.setValue('msiRateMode', v.rateMode)
                      form.setValue('msiRate', v.rate)
                    }}
                    total={amountNum}
                    months={msiMonths}
                    currency={currency}
                  />
                </>
              )}

              {msi && (
                <Input
                  label={t('Mes en que empezó el plan')}
                  type="date"
                  {...form.register('msiStartDate')}
                />
              )}

              {/* Plan que arrancó en un periodo anterior: hay que saber si
                  esas mensualidades ya se pagaron. */}
              {msiIsRetroactive && (
                <div className="space-y-2 rounded-md border border-line-amber/30 bg-white p-3 dark:border-amber-700 dark:bg-slate-800">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                    <TriangleAlert className="me-1.5 inline h-4 w-4 align-[-2px]" aria-hidden="true" /> {t('Este plan empezó en {{month}} (hace {{n}} meses).', {
                      month: formatMonthLabel(msiStartDate),
                      n: msiElapsed,
                    })}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {t('¿Ya pagaste mensualidades anteriores?')}
                  </p>
                  <Switch
                checked={!!form.watch('msiPaidPrevious')}
                onChange={(v) => form.setValue('msiPaidPrevious', v)}
                label={t('Sí, ya pagué algunas')}
              />
                  {msiPaidPrevious && (
                    <>
                      <Input
                        label={t('¿Cuántas de {{total}}?', { total: msiMonths })}
                        type="number"
                        min="1"
                        max={msiMonths || undefined}
                        {...form.register('msiPaidCount')}
                      />
                      {msiPaidCount > 0 && (
                        <p className="rounded bg-line-green/10 p-2 text-xs text-line-green">
                          {t('Se marcarán {{n}} mensualidades ({{amount}}) como ya pagadas.', {
                            n: msiPaidCount,
                            amount: formatMoney(msiMonthly * msiPaidCount, currency),
                          })}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

        </FormSection>

        {/* Notas */}
        <FormSection title={t('Notas')}>
          <Input
            aria-label={t('Notas (opcional)')}
            placeholder={t('Detalles adicionales...')}
            {...form.register('notes')}
          />
        </FormSection>

        {/* Botones */}
        <div className="flex gap-2 border-t border-slate-200 pt-5 dark:border-slate-700/70">
          <Button type="submit" disabled={submitting}>
            {submitting
              ? t('Guardando…')
              : isEdit
                ? t('Guardar cambios')
                : t('Registrar')}
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
