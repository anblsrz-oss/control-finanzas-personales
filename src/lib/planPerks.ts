import { useTranslation } from 'react-i18next'
import { useAppConfig } from '@/hooks/useAppConfig'
import { FEATURES, isFeaturePremium, type FeatureDef, type FeatureKey } from '@/lib/features'

// Los límites del plan gratis y qué funciones son de pago los define el admin
// en /admin y pueden cambiar. Se leen de la config en vez de escribirlos a mano
// para que landing y Suscripción nunca prometan algo distinto de lo que la app
// aplica de verdad. Convención del backend: 0 = ilimitado.
export function usePlanPerks() {
  const { t } = useTranslation()
  const { data: config } = useAppConfig()

  const cap = (n?: number) => (n && n > 0 ? n : null)
  const maxAccounts = cap(config?.free_max_accounts)
  const maxCards = cap(config?.free_max_cards)
  const maxBudgets = cap(config?.free_max_budgets)
  const hasFreeCaps = !!(maxAccounts || maxCards || maxBudgets)

  const freePerks = [
    maxAccounts ? t('Hasta {{n}} cuentas', { n: maxAccounts }) : t('Cuentas ilimitadas'),
    maxCards ? t('Hasta {{n}} tarjetas', { n: maxCards }) : t('Tarjetas ilimitadas'),
    maxBudgets ? t('Hasta {{n}} presupuestos', { n: maxBudgets }) : t('Presupuestos ilimitados'),
    ...(config && isFeaturePremium(config, 'receipts') ? [t('Reportes')] : [t('Escaneo de recibos y reportes')]),
  ]

  const premiumPerks = [
    ...(hasFreeCaps ? [t('Cuentas, tarjetas y presupuestos ilimitados')] : []),
    ...(config?.family_is_premium ? [t('Plan familiar: comparte con tu familia')] : []),
    ...(config?.installments_is_premium ? [t('MSI y diferidos mes a mes')] : []),
    ...(config?.yields_is_premium ? [t('Rendimientos de tus cuentas')] : []),
    ...(config?.budgets_is_premium ? [t('Presupuestos')] : []),
    ...(config?.reports_filters_is_premium ? [t('Filtros avanzados de reportes')] : []),
    // Funciones nuevas del registro (lib/features.ts) marcadas como premium.
    ...(config
      ? (FEATURES as readonly FeatureDef[])
          .filter((f) => f.premium && 'flag' in f.premium && isFeaturePremium(config, f.key as FeatureKey))
          .map((f) => t(f.label))
      : []),
  ]

  return { freePerks, premiumPerks }
}
