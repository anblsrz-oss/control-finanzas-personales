import { useEffect, useRef } from 'react'
import { useAuth } from '@/store/useAuth'
import { useRecordBudgetAlerts } from '@/hooks/useBudgets'

// Cada cuánto se vuelve a evaluar como mucho. La evaluación es barata y
// idempotente, pero no hace falta correrla en cada cambio de pestaña.
const THROTTLE_MS = 5 * 60 * 1000

// Componente sin UI. Dispara la evaluación de presupuestos al abrir la app y
// cada vez que vuelve a primer plano.
//
// Hace falta porque una parte del gasto entra sin pasar por una mutación del
// cliente: la captura de SMS y la de correo insertan transacciones desde el
// servidor. Sin esto, un usuario que solo usa la captura automática nunca
// vería un aviso hasta que registrara algo a mano.
//
// No hay riesgo de avisos repetidos: el índice único
// (budget_id, period_start, level) hace que la función solo devuelva algo la
// primera vez que se cruza cada umbral en cada periodo.
export function BudgetAlertWatcher() {
  const { session } = useAuth()
  const userId = session?.user?.id
  const recordAlerts = useRecordBudgetAlerts()
  const lastRunRef = useRef(0)

  // La mutación se recrea en cada render; guardarla en un ref evita que el
  // efecto se vuelva a montar y dispare la evaluación de más.
  const recordRef = useRef(recordAlerts)
  recordRef.current = recordAlerts

  useEffect(() => {
    if (!userId) return

    const run = () => {
      const now = Date.now()
      if (now - lastRunRef.current < THROTTLE_MS) return
      lastRunRef.current = now
      recordRef.current.mutate({ userId })
    }

    run()

    const onVisible = () => {
      if (document.visibilityState === 'visible') run()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', run)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', run)
    }
  }, [userId])

  return null
}
