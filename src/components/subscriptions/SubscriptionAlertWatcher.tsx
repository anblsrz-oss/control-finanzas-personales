import { useEffect, useRef } from 'react'
import { useAuth } from '@/store/useAuth'
import { useRecordSubscriptionAlerts } from '@/hooks/useSubscriptions'

// Mismo throttle que BudgetAlertWatcher.
const THROTTLE_MS = 5 * 60 * 1000

// Componente sin UI. Registra los avisos de "próximo cobro" al abrir la app y
// cada vez que vuelve a primer plano — necesario porque next_charge_date se
// evalúa contra la fecha de hoy, no contra una acción del usuario. Los avisos
// de cambio de precio no pasan por aquí: se insertan directo desde el edge
// function en el momento del cargo (ver _shared/subscriptionDetect.ts).
//
// Sin riesgo de avisos repetidos: el índice único
// (subscription_id, kind, dedupe_key) impide que el mismo ciclo avise dos veces.
export function SubscriptionAlertWatcher() {
  const { session } = useAuth()
  const userId = session?.user?.id
  const recordAlerts = useRecordSubscriptionAlerts()
  const lastRunRef = useRef(0)

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
