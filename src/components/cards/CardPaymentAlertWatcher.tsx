import { useEffect, useRef } from 'react'
import { useAuth } from '@/store/useAuth'
import { useRecordCardPaymentAlerts } from '@/hooks/useCardPaymentAlerts'

// Mismo throttle que SubscriptionAlertWatcher/BudgetAlertWatcher.
const THROTTLE_MS = 5 * 60 * 1000

// Componente sin UI. Registra los avisos de pago de tarjeta/MSI al abrir la
// app y cada vez que vuelve a primer plano — necesario porque due_date se
// evalúa contra la fecha de hoy, no contra una acción del usuario.
//
// Sin riesgo de avisos repetidos: los índices únicos de dedupe en
// card_payment_alerts (0051) impiden que la misma fecha de pago avise dos
// veces.
export function CardPaymentAlertWatcher() {
  const { session } = useAuth()
  const userId = session?.user?.id
  const recordAlerts = useRecordCardPaymentAlerts()
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
