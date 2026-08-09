// Líneas de crédito: el límite y las fechas de corte/pago que varias
// tarjetas del mismo banco comparten. Ver 0018_credit_lines.sql.

import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useCards, useCardUsage } from '@/hooks/useCards'
import { periodWindow, currentPeriod } from '@/lib/creditDates'
import type {
  CardRow,
  CreditLineRow,
  CreditLineUsageRow,
  CardUsageRow,
  CreditLinePeriodRow,
} from '@/types/db'

export function useCreditLines(userId?: string) {
  return useQuery({
    queryKey: ['credit_lines', userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('credit_lines')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return (data || []) as CreditLineRow[]
    },
    enabled: !!userId,
  })
}

export function useCreditLineUsage(userId?: string) {
  return useQuery({
    queryKey: ['credit_line_usage', userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('credit_line_usage')
        .select('*')
        .eq('user_id', userId)
      if (error) throw error
      return (data || []) as CreditLineUsageRow[]
    },
    enabled: !!userId,
  })
}

// Uso de crédito listo para graficar.
//
// El límite vive en la línea, no en la tarjeta, y varias tarjetas comparten la
// misma línea. Por eso agrupamos por línea (una barra = un límite real) y
// colgamos los nombres de las tarjetas que la comparten. Las tarjetas de
// crédito sin línea asignada caen a su propia fila vía card_usage.
export interface CreditUsageItem {
  id: string
  name: string
  currency: string
  creditLimit: number
  used: number
  available: number
  /** Porcentaje de utilización 0-100. */
  percent: number
  /** Tarjetas que comparten esta línea. */
  cards: string[]
}

export function useCreditUsageBreakdown(userId?: string) {
  const linesQuery = useCreditLineUsage(userId)
  const cardsQuery = useCards(userId)
  const cardUsageQuery = useCardUsage(userId)

  const lines = linesQuery.data
  const cards = cardsQuery.data
  const cardUsage = cardUsageQuery.data

  const data = useMemo<CreditUsageItem[]>(() => {
    const build = (
      id: string,
      name: string,
      currency: string,
      creditLimit: number,
      used: number,
      available: number,
      cardNames: string[],
    ): CreditUsageItem => ({
      id,
      name,
      currency,
      creditLimit,
      used,
      available,
      percent: creditLimit > 0 ? (used / creditLimit) * 100 : 0,
      cards: cardNames,
    })

    // Una línea sin tarjetas asignadas (p. ej. creada por error o cuya única
    // tarjeta se movió a otra línea) no debe pintar una barra fantasma que
    // duplique el límite. Solo graficamos líneas con al menos una tarjeta.
    const items = (lines || [])
      .map((l) => ({
        line: l,
        cardNames: (cards || [])
          .filter((c) => c.credit_line_id === l.credit_line_id)
          .map((c) => c.name),
      }))
      .filter(({ cardNames }) => cardNames.length > 0)
      .map(({ line: l, cardNames }) =>
        build(
          l.credit_line_id,
          l.name,
          l.currency,
          l.credit_limit,
          l.used,
          l.available,
          cardNames,
        ),
      )

    // Tarjetas de crédito huérfanas (sin línea): su límite legado sigue en
    // card_usage, así que se grafican por separado en vez de desaparecer.
    const orphanIds = new Set(
      (cards || [])
        .filter((c) => c.type === 'credit' && !c.credit_line_id)
        .map((c) => c.id),
    )
    ;(cardUsage as CardUsageRow[] | undefined)
      ?.filter((u) => orphanIds.has(u.card_id) && (u.credit_limit ?? 0) > 0)
      .forEach((u) => {
        items.push(
          build(u.card_id, u.name, u.currency, u.credit_limit ?? 0, u.used, u.available, []),
        )
      })

    // Lo más comprometido primero: es lo que el usuario necesita ver.
    return items.sort((a, b) => b.percent - a.percent)
  }, [lines, cards, cardUsage])

  return {
    data,
    isLoading:
      linesQuery.isLoading || cardsQuery.isLoading || cardUsageQuery.isLoading,
  }
}

// Movimientos de crédito (consumos, reembolsos y pagos) para calcular el estado
// de cuenta por periodo. Se filtra en cliente por ventana de corte.
export interface CreditActivity {
  kind: string
  amount: number
  base_amount: number | null
  currency: string
  tx_date: string
  card_id: string | null
  to_credit_line_id: string | null
}

export function useCreditActivity(userId?: string) {
  return useQuery({
    queryKey: ['credit_activity', userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('transactions')
        .select('kind, amount, base_amount, currency, tx_date, card_id, to_credit_line_id')
        .eq('user_id', userId)
        .is('family_id', null)
        .in('kind', ['expense', 'income', 'card_payment'])
      if (error) throw error
      return (data || []) as CreditActivity[]
    },
    enabled: !!userId,
  })
}

export interface LineStatement {
  /** Ventana corte-a-corte del periodo vigente. */
  window: { start: string; end: string } | null
  /** Consumo neto del periodo (consumos − reembolsos). Lo "a pagar" del ciclo. */
  amount: number
  /** Pagos abonados a la línea dentro de la ventana. */
  paid: number
  currency: string
}

/**
 * Estado de cuenta del periodo vigente de una línea (cálculo puro).
 *
 * El monto "a pagar" solo puede calcularse de forma confiable a partir de las
 * transacciones capturadas si TODAS quedaron registradas (incluyendo pagos,
 * que a veces no se capturan por SMS/correo). Para no depender de eso, si el
 * usuario confirmó el saldo real de este periodo contra su estado de cuenta,
 * ese saldo manda. Si no, se calcula desde el saldo confirmado más reciente
 * (si hay) más la actividad capturada desde ese ancla — en vez de desde el
 * inicio de los tiempos, donde cualquier pago no capturado se arrastraría
 * como error para siempre.
 */
export function computeLineStatement(
  line: CreditLineRow,
  cards: CardRow[],
  activities: CreditActivity[],
  periods: CreditLinePeriodRow[] = [],
): LineStatement {
  const period = currentPeriod(line)
  const linePeriods = periods.filter((p) => p.credit_line_id === line.id)
  const confirmed = period
    ? linePeriods.find((p) => p.period_month === period.periodMonth)
    : undefined
  const win = periodWindow(line, new Date(), confirmed?.cut_date)
  if (!win) return { window: null, amount: 0, paid: 0, currency: line.currency }

  // Si ya confirmaron el saldo de este periodo, ese es el punto de partida y
  // solo se restan los pagos hechos después del corte (los que van bajando
  // esa cuenta ya confirmada). Si no, el punto de partida es el saldo
  // confirmado más reciente de un periodo anterior (o 0 si nunca se ha
  // confirmado nada), y se suma/resta la actividad capturada desde ahí.
  const anchor = linePeriods
    .filter(
      (p) =>
        p.confirmed_balance != null &&
        (!period || p.period_month < period.periodMonth),
    )
    .sort((a, b) => (a.cut_date < b.cut_date ? 1 : -1))[0]

  const lineCardIds = new Set(
    cards.filter((c) => c.credit_line_id === line.id).map((c) => c.id),
  )
  let amount = confirmed?.confirmed_balance ?? anchor?.confirmed_balance ?? 0
  let paid = 0

  // Cota inferior EXCLUSIVA: se cuenta actividad con tx_date > excludeUpTo.
  const excludeUpTo =
    confirmed?.confirmed_balance != null
      ? confirmed.cut_date
      : anchor
        ? anchor.cut_date
        : null // sin ancla: usa win.start como cota inclusiva más abajo.
  // Cota superior: sin tope cuando ya está confirmado (los pagos posteriores
  // al corte siempre cuentan, sin importar qué tan lejos del corte se hagan).
  const rangeEnd = confirmed?.confirmed_balance != null ? null : win.end

  for (const a of activities) {
    if (excludeUpTo != null ? a.tx_date <= excludeUpTo : a.tx_date < win.start) continue
    if (rangeEnd != null && a.tx_date > rangeEnd) continue
    const v = a.currency === line.currency ? a.amount : a.base_amount ?? a.amount
    if (confirmed?.confirmed_balance != null) {
      // El saldo ya confirmado incluye toda la actividad hasta el corte:
      // de aquí en adelante solo cuentan los pagos hechos después.
      if (a.kind === 'card_payment' && a.to_credit_line_id === line.id) paid += v
      continue
    }
    if ((a.kind === 'expense' || a.kind === 'income') && a.card_id && lineCardIds.has(a.card_id)) {
      amount += a.kind === 'expense' ? v : -v
    } else if (a.kind === 'card_payment' && a.to_credit_line_id === line.id) {
      paid += v
    }
  }
  return { window: win, amount, paid, currency: line.currency }
}

export function useCreateCreditLine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      userId: string
      name: string
      bank_name?: string | null
      credit_limit: number
      currency: string
      cut_day?: number | null
      payment_day?: number | null
      dates_may_shift?: boolean
    }) => {
      const { userId, ...rest } = input
      const { data, error } = await supabase
        .from('credit_lines')
        .insert([{
          user_id: userId,
          name: rest.name,
          bank_name: rest.bank_name || null,
          credit_limit: rest.credit_limit,
          currency: rest.currency,
          cut_day: rest.cut_day ?? null,
          payment_day: rest.payment_day ?? null,
          dates_may_shift: rest.dates_may_shift ?? false,
        }])
        .select()
        .single()
      if (error) throw error
      return data as CreditLineRow
    },
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: ['credit_lines', input.userId] })
      queryClient.invalidateQueries({ queryKey: ['credit_line_usage', input.userId] })
    },
  })
}

export function useUpdateCreditLine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      id: string
      userId: string
      name?: string
      bank_name?: string | null
      credit_limit?: number
      currency?: string
      cut_day?: number | null
      payment_day?: number | null
      dates_may_shift?: boolean
    }) => {
      const { id, userId, ...rest } = input
      const updates: Record<string, any> = {}
      if (rest.name !== undefined) updates.name = rest.name
      if (rest.bank_name !== undefined) updates.bank_name = rest.bank_name || null
      if (rest.credit_limit !== undefined) updates.credit_limit = rest.credit_limit
      if (rest.currency !== undefined) updates.currency = rest.currency
      if (rest.cut_day !== undefined) updates.cut_day = rest.cut_day
      if (rest.payment_day !== undefined) updates.payment_day = rest.payment_day
      if (rest.dates_may_shift !== undefined) updates.dates_may_shift = rest.dates_may_shift

      const { data, error } = await supabase
        .from('credit_lines')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as CreditLineRow
    },
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: ['credit_lines', input.userId] })
      queryClient.invalidateQueries({ queryKey: ['credit_line_usage', input.userId] })
    },
  })
}

export function useDeleteCreditLine() {
  const queryClient = useQueryClient()
  return useMutation({
    // Las tarjetas que la usaban quedan con credit_line_id null
    // (on delete set null), no se borran.
    mutationFn: async ({ id }: { id: string; userId: string }) => {
      const { error } = await supabase.from('credit_lines').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: ['credit_lines', input.userId] })
      queryClient.invalidateQueries({ queryKey: ['credit_line_usage', input.userId] })
      queryClient.invalidateQueries({ queryKey: ['cards', input.userId] })
    },
  })
}
