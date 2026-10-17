import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/store/useAuth'
import { useEntitlements } from '@/hooks/useAppConfig'
import {
  useTransactionsSummary,
  useMonthlyTotals,
  useCategoryTotals,
} from '@/hooks/useReports'
import { useCreditUsageBreakdown } from '@/hooks/useCreditLines'
import { useBudgetStatus } from '@/hooks/useBudgets'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { ChartCard } from '@/components/charts/ChartCard'
import { CreditUsageChart } from '@/components/charts/CreditUsageChart'
import { BudgetProgressChart } from '@/components/charts/BudgetProgressChart'
import { IncomeExpenseChart } from '@/components/charts/IncomeExpenseChart'
import { CategoryPieChart } from '@/components/charts/CategoryPieChart'
import { ChartControls } from '@/components/charts/ChartControls'
import { Money } from '@/components/ui/Money'
import { PeriodSelector } from '@/components/ui/PeriodSelector'
import { monthStartISO, todayISO } from '@/lib/dates'
import { DEFAULT_ORDER, reconcileOrder } from '@/lib/charts'
import type { ChartId } from '@/lib/charts'
import { useSettings } from '@/store/useSettings'
import { CalendarDays } from 'lucide-react'
import { StatStrip } from '@/components/ui/StatStrip'

export function DashboardPage() {
  const { t } = useTranslation()
  const { session, profile } = useAuth()
  const userId = session?.user?.id
  const mainCurrency = profile?.main_currency ?? 'MXN'
  const { canUseDashboardPeriodFilter } = useEntitlements()

  // Default: mes actual. Si no hay derecho al selector, se queda fijo aquí.
  const [startDate, setStartDate] = useState(monthStartISO())
  const [endDate, setEndDate] = useState(todayISO())

  const filters = useMemo(() => ({ startDate, endDate }), [startDate, endDate])

  const summaryQuery = useTransactionsSummary(userId, filters)
  const monthlyQuery = useMonthlyTotals(userId, filters)
  const categoryQuery = useCategoryTotals(userId, filters)

  const summary = summaryQuery.data
  const monthly = monthlyQuery.data || []
  const categories = categoryQuery.data || []

  // Estado puntual, no histórico: no depende del rango de fechas de arriba.
  const { data: creditUsage } = useCreditUsageBreakdown(userId)

  // Los presupuestos tampoco dependen del selector: cada uno corre en su propio
  // periodo (diario/semanal/quincenal/mensual), que resuelve el servidor.
  const budgetStatus = useBudgetStatus(userId).data || []

  const savedOrder = useSettings((s) => s.chartOrder.dashboard)

  // Gráficos con datos, en orden default; luego reconciliados con lo guardado.
  const available = DEFAULT_ORDER.dashboard.filter((id) => {
    if (id === 'budget') return budgetStatus.length > 0
    if (id === 'creditUsage') return creditUsage.length > 0
    if (id === 'incomeExpense') return monthly.length > 0
    if (id === 'category') return categories.length > 0
    return false
  })
  const order = reconcileOrder(savedOrder, available)

  const renderChart = (id: ChartId) => {
    switch (id) {
      case 'budget':
        return (
          <ChartCard key={id} chartId={id} page="dashboard" title={t('Presupuestos')} available={available}>
            <BudgetProgressChart data={budgetStatus} />
          </ChartCard>
        )
      case 'creditUsage':
        return (
          <ChartCard key={id} chartId={id} page="dashboard" title={t('Uso de línea de crédito')} available={available}>
            <CreditUsageChart data={creditUsage} />
          </ChartCard>
        )
      case 'incomeExpense':
        return (
          <ChartCard key={id} chartId={id} page="dashboard" title={t('Ingresos vs Egresos')} available={available}>
            <IncomeExpenseChart data={monthly} currency={mainCurrency} />
          </ChartCard>
        )
      case 'category':
        return (
          <ChartCard
            key={id}
            chartId={id}
            page="dashboard"
            title={t('Gastos por Categoría')}
            available={available}
            points={categories.map((c) => c.name)}
          >
            <CategoryPieChart data={categories} currency={mainCurrency} />
          </ChartCard>
        )
      default:
        return null
    }
  }

  return (
    <>
      <PageHeader
        title={t('Resumen')}
        subtitle={t('Vista general de tus ingresos, egresos y balance.')}
        helpId="resumen"
        tourTarget="resumen"
      />

      {canUseDashboardPeriodFilter ? (
        <Card className="mb-6">
          <PeriodSelector
            startDate={startDate}
            endDate={endDate}
            onChange={(range) => {
              setStartDate(range.startDate)
              setEndDate(range.endDate)
            }}
          />
        </Card>
      ) : (
        <Card className="mb-6 flex items-center gap-3 !bg-line-amber/10 !border-line-amber/30">
          <CalendarDays className="h-5 w-5 shrink-0 text-line-amber" aria-hidden="true" />
          <p className="text-sm text-slate-700 dark:text-slate-200">
            {t('Premium: elige el periodo del resumen (hoy, semana, mes o personalizado). Actualiza tu plan para más análisis.')}
          </p>
        </Card>
      )}

      {/* Resumen del periodo: un tramo de línea por cifra */}
      {summary && (
        <StatStrip
          className="mb-6"
          items={[
            { label: t('Total Ingresos'), tone: 'green', value: <Money amount={summary.totalIncome} currency={mainCurrency} /> },
            { label: t('Total Egresos'), tone: 'scarlet', value: <Money amount={summary.totalExpense} currency={mainCurrency} /> },
            { label: t('Balance efectivo'), tone: summary.balanceCash >= 0 ? 'cobalt' : 'amber', value: <Money amount={summary.balanceCash} currency={mainCurrency} /> },
          ]}
        />
      )}

      {/* Gráficas */}
      <div className="space-y-6">
        {(monthly.length > 0 || categories.length > 0) && (
          <Card>
            <ChartControls />
          </Card>
        )}

        {order.map((id) => renderChart(id))}

        {!monthly.length && !categories.length && !creditUsage.length && !budgetStatus.length && (
          <Card className="border-dashed text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('Sin transacciones en este periodo.')}
            </p>
          </Card>
        )}
      </div>
    </>
  )
}
