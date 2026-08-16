// Lógica compartida entre los dos puntos de entrada de un reembolso (botón
// en la lista de transacciones y tipo "Reembolso" del formulario general):
// cuánto queda por reembolsar de una compra, y si un reembolso cierra por
// completo un plan MSI.

import type {
  InstallmentPlanRow,
  TransactionRow,
} from '@/types/db'
import type { useCancelInstallmentPlan } from '@/hooks/useTransactions'

/** Monto restante por reembolsar de una compra, dados los reembolsos que ya se le vincularon. */
export function remainingRefundable(
  original: TransactionRow,
  existingRefunds: TransactionRow[],
): number {
  const alreadyRefunded = existingRefunds.reduce((sum, r) => sum + r.amount, 0)
  return Math.max(0, original.amount - alreadyRefunded)
}

/**
 * Si la compra original tiene un plan MSI y la suma de sus reembolsos ya
 * alcanza el total del plan, lo cancela (deja de pedir/sumar mensualidades
 * futuras). No hace nada si no hay plan, ya está cancelado, o el reembolso
 * acumulado todavía no cubre el total.
 */
export async function checkAndCancelMsiPlan(
  userId: string,
  originalTxId: string,
  plans: InstallmentPlanRow[],
  allRefundsForOriginal: TransactionRow[],
  cancelPlan: ReturnType<typeof useCancelInstallmentPlan>,
): Promise<boolean> {
  const plan = plans.find((p) => p.transaction_id === originalTxId)
  if (!plan || plan.cancelled_at) return false

  const totalRefunded = allRefundsForOriginal.reduce((sum, r) => sum + r.amount, 0)
  if (totalRefunded < plan.total_amount) return false

  await cancelPlan.mutateAsync({ id: plan.id, userId })
  return true
}
