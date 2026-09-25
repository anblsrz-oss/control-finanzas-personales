import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useEntitlements } from '@/hooks/useAppConfig'
import { PageHeader } from '@/components/ui/PageHeader'
import { PremiumLocked } from '@/components/ui/PremiumLocked'
import { FEATURES, type FeatureKey } from '@/lib/features'

/**
 * Bloquea una página completa si el admin marcó la función como premium y el
 * usuario no lo es (ver lib/features.ts). Envuelve la ruta en App.tsx.
 */
export function FeatureGate({ feature, children }: { feature: FeatureKey; children: ReactNode }) {
  const { t } = useTranslation()
  const { canUse } = useEntitlements()
  if (canUse(feature)) return <>{children}</>
  const label = FEATURES.find((f) => f.key === feature)?.label ?? ''
  return (
    <>
      <PageHeader title={t(label)} />
      <PremiumLocked />
    </>
  )
}
