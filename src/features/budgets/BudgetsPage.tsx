import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/store/useAuth'
import { useEntitlements } from '@/hooks/useAppConfig'
import { useBudgets, useBudgetStatus, useDeleteBudget } from '@/hooks/useBudgets'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PremiumGate } from '@/components/ui/PremiumGate'
import { BudgetProgressChart } from '@/components/charts/BudgetProgressChart'
import { GENERAL_BUDGET_LABEL } from '@/lib/budgets'
import { BudgetForm } from './BudgetForm'
import { BudgetRow } from './BudgetRow'
import type { BudgetRow as BudgetRowType } from '@/types/db'

export function BudgetsPage() {
  const { t } = useTranslation()
  const { session, profile } = useAuth()
  const userId = session?.user?.id
  const [showForm, setShowForm] = useState(false)
  const [editingBudget, setEditingBudget] = useState<BudgetRowType | null>(null)
  const formRef = useRef<HTMLDivElement>(null)

  // El formulario de edición aparece arriba: en móvil hay que llevar al usuario
  // hasta él, si no parece que "Editar" no hizo nada.
  useEffect(() => {
    if (editingBudget) {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [editingBudget])

  const budgetsQuery = useBudgets(userId)
  const statusQuery = useBudgetStatus(userId)
  const deleteBudget = useDeleteBudget()
  const { budgetLimit } = useEntitlements()

  const budgets = budgetsQuery.data || []
  const statuses = statusQuery.data || []

  // Los inactivos no salen en budget_status (se excluyen en SQL): se listan
  // aparte para poder reactivarlos.
  const inactive = budgets.filter((b) => !b.is_active)

  const handleDelete = (budgetId: string, label: string) => {
    if (confirm(t('¿Eliminar el presupuesto de "{{name}}"?', { name: label }))) {
      deleteBudget.mutate({ id: budgetId, userId: userId! })
    }
  }

  const budgetLabel = (categoryId: string | null, name: string | null) =>
    categoryId === null ? t(GENERAL_BUDGET_LABEL) : (name ?? '')

  return (
    <>
      <PageHeader
        title={t('Presupuestos')}
        subtitle={t('Cuánto puedes gastar en cada categoría y cómo vas en el periodo.')}
        helpId="presupuestos"
        actions={
          <PremiumGate
            count={budgets.length}
            limit={budgetLimit}
            lockedTooltip={t(
              'Plan gratis: máximo {{n}} presupuestos. Actualiza a Premium para agregar más.',
              { n: budgetLimit },
            )}
          >
            <Button
              onClick={() => {
                setEditingBudget(null)
                setShowForm(!showForm)
              }}
            >
              {showForm ? t('Cancelar') : t('+ Nuevo presupuesto')}
            </Button>
          </PremiumGate>
        }
      />

      {showForm && !editingBudget && (
        <BudgetForm
          usedCategoryIds={budgets.map((b) => b.category_id)}
          onSuccess={() => setShowForm(false)}
        />
      )}

      {editingBudget && (
        <div ref={formRef} className="scroll-mt-4">
          <BudgetForm
            key={editingBudget.id}
            budget={editingBudget}
            usedCategoryIds={budgets.map((b) => b.category_id)}
            onSuccess={() => setEditingBudget(null)}
            onCancel={() => setEditingBudget(null)}
          />
        </div>
      )}

      {budgets.length === 0 ? (
        <Card className="border-dashed text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('Sin presupuestos. Crea uno general o por categoría para ver cuánto llevas gastado.')}
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {statuses.length > 0 && (
            <Card>
              <BudgetProgressChart data={statuses} />
            </Card>
          )}

          <div className="space-y-4">
            {statuses.map((status) => {
              const budget = budgets.find((b) => b.id === status.budget_id)
              return (
                <BudgetRow
                  key={status.budget_id}
                  status={status}
                  onEdit={() => {
                    setShowForm(false)
                    if (budget) setEditingBudget(budget)
                  }}
                  onDelete={() =>
                    handleDelete(
                      status.budget_id,
                      budgetLabel(status.category_id, status.category_name),
                    )
                  }
                  deleting={deleteBudget.isPending}
                />
              )
            })}
          </div>

          {inactive.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                {t('Inactivos')}
              </h2>
              {inactive.map((b) => (
                <Card key={b.id} className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {b.category_id === null ? t(GENERAL_BUDGET_LABEL) : t('Categoría')}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowForm(false)
                        setEditingBudget(b)
                      }}
                    >
                      {t('Editar')}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(b.id, t('este presupuesto'))}
                      disabled={deleteBudget.isPending}
                    >
                      {t('Eliminar')}
                    </Button>
                  </div>
                </Card>
              ))}
            </section>
          )}
        </div>
      )}

      {!profile?.is_premium && budgetLimit !== Infinity && budgets.length >= budgetLimit && (
        <Card className="mt-4 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            {t('Plan gratis: máximo {{n}} presupuestos. Actualiza a Premium para agregar más.', {
              n: budgetLimit,
            })}
          </p>
        </Card>
      )}
    </>
  )
}
