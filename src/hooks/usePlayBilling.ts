import { useMutation, useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/store/useAuth'
import { canUsePlayBilling } from '@/lib/distribution'
import type { BillingPlan } from '@/hooks/useBilling'

// Compras dentro de la app con Google Play Billing (solo build 'play', ver
// lib/distribution.ts). El estado Premium NUNCA se decide aquí: el cliente
// manda el purchaseToken a la edge function verify-play-purchase, que lo valida
// con la API de Google, lo reconoce (acknowledge) y activa is_premium. Después
// se refresca el perfil. El plugin se importa dinámicamente para que la web y el
// APK de GitHub no carguen nada de billing.
//
// Configuración en Play Console: una suscripción "premium" con dos planes base,
// "monthly" y "yearly" (ids = BillingPlan), cada uno con oferta de prueba de 7
// días. Los precios de Play incluyen IVA (ver README del backend).
export const PLAY_SUBSCRIPTION_ID = 'premium'

export interface PlayPlanInfo {
  plan: BillingPlan
  /** Precio ya formateado por Play en la moneda del usuario, p. ej. "$135.00". */
  priceString: string
  offerToken?: string
  /** true si Play ofrece la prueba gratis a esta cuenta. */
  hasTrial: boolean
}

async function loadPlugin() {
  const mod = await import('@capgo/native-purchases')
  return mod
}

async function verifyWithServer(purchaseToken: string, productId: string): Promise<void> {
  const { data: sess } = await supabase.auth.getSession()
  if (!sess.session) throw new Error('No session')
  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-play-purchase`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sess.session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ purchaseToken, productId }),
    },
  )
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.error) {
    throw new Error(data.error || 'No se pudo verificar la compra')
  }
}

/** Precios localizados de los dos planes, tal como los cobrará Google Play. */
export function usePlayProducts() {
  return useQuery({
    queryKey: ['play-products'],
    enabled: canUsePlayBilling(),
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<Partial<Record<BillingPlan, PlayPlanInfo>>> => {
      const { NativePurchases, PURCHASE_TYPE } = await loadPlugin()
      const { products } = await NativePurchases.getProducts({
        productIdentifiers: [PLAY_SUBSCRIPTION_ID],
        productType: PURCHASE_TYPE.SUBS,
      })
      const out: Partial<Record<BillingPlan, PlayPlanInfo>> = {}
      for (const plan of ['monthly', 'yearly'] as const) {
        // Play devuelve una entrada por oferta elegible: la oferta (prueba)
        // trae offerId y el plan base no. Si hay oferta, se prefiere.
        const entries = products.filter((p) => p.identifier === plan)
        const chosen = entries.find((p) => p.offerId) ?? entries[0]
        if (!chosen) continue
        out[plan] = {
          plan,
          priceString: chosen.priceString,
          offerToken: chosen.offerToken,
          hasTrial: !!chosen.offerId,
        }
      }
      return out
    },
  })
}

export function usePlayPurchase() {
  const refreshProfile = useAuth((s) => s.refreshProfile)
  return useMutation({
    mutationFn: async (info: PlayPlanInfo) => {
      const userId = useAuth.getState().session?.user?.id
      if (!userId) throw new Error('No session')
      const { NativePurchases, PURCHASE_TYPE } = await loadPlugin()
      const tx = await NativePurchases.purchaseProduct({
        productIdentifier: PLAY_SUBSCRIPTION_ID,
        planIdentifier: info.plan,
        offerToken: info.offerToken,
        productType: PURCHASE_TYPE.SUBS,
        // Id opaco (UUID, no es PII): el servidor exige que coincida con el
        // usuario autenticado para que un token no active la cuenta de otro.
        appAccountToken: userId,
        // El acknowledge lo hace el servidor tras validar; si no, Play reembolsa
        // a los 3 días.
        autoAcknowledgePurchases: false,
      })
      if (!tx.purchaseToken) throw new Error('Play no devolvió el token de compra')
      await verifyWithServer(tx.purchaseToken, PLAY_SUBSCRIPTION_ID)
      await refreshProfile()
    },
  })
}

/**
 * Re-verifica las suscripciones que Play reporta para este usuario. Cubre una
 * compra cuyo verify falló (sin red, app cerrada) y "Restaurar compra" en un
 * teléfono nuevo.
 */
export function usePlayRestore() {
  const refreshProfile = useAuth((s) => s.refreshProfile)
  return useMutation({
    mutationFn: async (): Promise<number> => {
      const userId = useAuth.getState().session?.user?.id
      if (!userId) throw new Error('No session')
      const { NativePurchases, PURCHASE_TYPE } = await loadPlugin()
      const { purchases } = await NativePurchases.getPurchases({
        productType: PURCHASE_TYPE.SUBS,
        appAccountToken: userId,
      })
      let verified = 0
      for (const p of purchases) {
        if (!p.purchaseToken) continue
        await verifyWithServer(p.purchaseToken, p.productIdentifier || PLAY_SUBSCRIPTION_ID)
        verified++
      }
      if (verified > 0) await refreshProfile()
      return verified
    },
  })
}

export function usePlayManageSubscription() {
  return useMutation({
    mutationFn: async () => {
      const { NativePurchases } = await loadPlugin()
      await NativePurchases.manageSubscriptions()
    },
  })
}
