// Copia ligera del catálogo del backend (supabase/functions/_shared/subscriptionMerchants.ts),
// solo para el selector del alta manual — las Edge Functions no son importables
// desde el build de Vite, así que no se puede compartir el módulo directamente.
// Mantener sincronizadas key/name/icon si se agrega un comercio en el backend.

export interface SubscriptionMerchantOption {
  key: string
  name: string
  icon: string
  defaultCycle: 'monthly' | 'yearly'
}

export const SUBSCRIPTION_MERCHANT_OPTIONS: SubscriptionMerchantOption[] = [
  { key: 'netflix', name: 'Netflix', icon: '🎬', defaultCycle: 'monthly' },
  { key: 'spotify', name: 'Spotify', icon: '🎵', defaultCycle: 'monthly' },
  { key: 'amazon_prime', name: 'Amazon Prime', icon: '📦', defaultCycle: 'monthly' },
  { key: 'disney_plus', name: 'Disney+', icon: '🏰', defaultCycle: 'monthly' },
  { key: 'hbo_max', name: 'HBO Max / Max', icon: '🎞️', defaultCycle: 'monthly' },
  { key: 'apple', name: 'Apple (App Store / iCloud / Apple One)', icon: '🍎', defaultCycle: 'monthly' },
  { key: 'google_one', name: 'Google One / YouTube Premium', icon: '🔺', defaultCycle: 'monthly' },
  { key: 'anthropic', name: 'Claude (Anthropic)', icon: '🤖', defaultCycle: 'monthly' },
  { key: 'openai', name: 'ChatGPT (OpenAI)', icon: '🤖', defaultCycle: 'monthly' },
  { key: 'microsoft_365', name: 'Microsoft 365', icon: '🟦', defaultCycle: 'monthly' },
  { key: 'playstation_plus', name: 'PlayStation Plus', icon: '🎮', defaultCycle: 'monthly' },
  { key: 'xbox_game_pass', name: 'Xbox Game Pass', icon: '🎮', defaultCycle: 'monthly' },
  { key: 'canva', name: 'Canva', icon: '🎨', defaultCycle: 'monthly' },
]

export const SUBSCRIPTION_DEFAULT_ICON = '🔁'

export const SUBSCRIPTION_BILLING_CYCLES = ['weekly', 'monthly', 'yearly'] as const

export const SUBSCRIPTION_BILLING_CYCLE_LABELS: Record<string, string> = {
  weekly: 'Semanal',
  monthly: 'Mensual',
  yearly: 'Anual',
}

/** Total equivalente por mes según el ciclo — para sumar en una sola moneda de comparación. */
export function monthlyEquivalent(amount: number, cycle: string): number {
  if (cycle === 'yearly') return amount / 12
  if (cycle === 'weekly') return amount * 4.345 // semanas promedio por mes
  return amount
}
