import { useEffect, useRef } from 'react'
import { showAlert } from '@/components/ui/DialogHost'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'
import { useAuth } from '@/store/useAuth'
import { useStartCheckout, useOpenBillingPortal, type BillingPlan } from '@/hooks/useBilling'
import {
  usePlayProducts,
  usePlayPurchase,
  usePlayRestore,
  usePlayManageSubscription,
} from '@/hooks/usePlayBilling'
import { isPlayBuild, canUsePlayBilling } from '@/lib/distribution'
import { PRICES } from '@/lib/pricing'
import { usePlanPerks } from '@/lib/planPerks'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

function Perks({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 space-y-1.5">
      {items.map((p) => (
        <li key={p} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-line-green" strokeWidth={2.4} aria-hidden="true" />
          {p}
        </li>
      ))}
    </ul>
  )
}

// Planes y suscripción. En Google Play la compra va por Play Billing y nunca se
// menciona Stripe ni la web (ver lib/distribution.ts); en web/APK, por Stripe.
export function SubscriptionPage() {
  const { t } = useTranslation()
  const { profile } = useAuth()
  const { freePerks, premiumPerks } = usePlanPerks()

  const startCheckout = useStartCheckout()
  const openPortal = useOpenBillingPortal()
  const playBuild = isPlayBuild()
  const playBilling = canUsePlayBilling()
  const playProducts = usePlayProducts()
  const playPurchase = usePlayPurchase()
  const playRestore = usePlayRestore()
  const playManage = usePlayManageSubscription()
  const onError = (e: any) => showAlert(`${t('Error:')} ${e.message}`)

  // Compra hecha pero sin verificar (sin red, app cerrada) o teléfono nuevo:
  // al abrir esta página sin Premium se re-verifica lo que Play tenga. Una vez.
  const playRestoreTried = useRef(false)
  useEffect(() => {
    if (!playBilling || !profile || profile.is_premium || playRestoreTried.current) return
    playRestoreTried.current = true
    playRestore.mutate(undefined, { onError: () => {} })
  }, [playBilling, profile, playRestore])

  // Llegada desde un plan de la landing: /suscripcion?plan=monthly|yearly abre el
  // checkout de una vez. Se dispara una sola vez y se limpia el parámetro para que
  // recargar la página no vuelva a mandar al pago.
  const [searchParams, setSearchParams] = useSearchParams()
  const autoCheckoutDone = useRef(false)
  useEffect(() => {
    const plan = searchParams.get('plan')
    if (plan !== 'monthly' && plan !== 'yearly') return
    if (playBuild) {
      setSearchParams({}, { replace: true })
      return
    }
    // Espera a tener el perfil: sin él no se sabe si ya es premium.
    if (!profile) return
    setSearchParams({}, { replace: true })
    if (autoCheckoutDone.current || profile.is_premium) return
    autoCheckoutDone.current = true
    startCheckout.mutate(plan as BillingPlan, { onError })
  }, [searchParams, profile, setSearchParams, startCheckout, playBuild])

  const isPremium = !!profile?.is_premium
  const hasTrial = !!(playProducts.data?.monthly?.hasTrial || playProducts.data?.yearly?.hasTrial)

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={t('Suscripción')}
        subtitle={isPremium ? t('Tienes acceso a todas las funciones.') : t('Elige tu plan. Cancela cuando quieras.')}
        helpId="suscripcion"
        tourTarget="suscripcion"
      />

      {isPremium ? (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-line-amber/15 text-line-amber">Premium</Badge>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {t('Tienes acceso a todas las funciones.')}
              </p>
            </div>
            {!playBuild && (
              <Button variant="secondary" disabled={openPortal.isPending} onClick={() => openPortal.mutate(undefined, { onError })}>
                {t('Gestionar suscripción')}
              </Button>
            )}
            {playBilling && profile?.premium_source === 'google' && (
              <Button variant="secondary" disabled={playManage.isPending} onClick={() => playManage.mutate(undefined, { onError })}>
                {t('Gestionar suscripción')}
              </Button>
            )}
          </div>
          <Perks items={premiumPerks} />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">{t('Gratis')}</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight">$0</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('para siempre')}</p>
            <Perks items={freePerks} />
          </Card>

          <Card className="border-brand-600 ring-2 ring-brand-600/20">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Premium</h2>
            {playBuild ? (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {playBilling
                  ? t('El cobro lo hace Google Play. Cancela cuando quieras desde Google Play.') +
                    (hasTrial ? ` ${t('7 días de prueba gratis.')}` : '')
                  : ''}
              </p>
            ) : (
              <>
                <p className="mt-2 text-3xl font-bold tracking-tight">
                  {PRICES.monthly}
                  <span className="ms-1 text-sm font-normal text-slate-500 dark:text-slate-400">{t('al mes')}</span>
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t('7 días de prueba gratis. Cancela cuando quieras.')}
                </p>
              </>
            )}
            <Perks items={premiumPerks} />

            <div className="mt-5 flex flex-col gap-2">
              {playBilling ? (
                <>
                  {playProducts.data?.monthly && (
                    <Button disabled={playPurchase.isPending} onClick={() => playPurchase.mutate(playProducts.data!.monthly!, { onError })}>
                      {playPurchase.isPending ? t('Abriendo…') : `${t('Mensual')} · ${playProducts.data.monthly.priceString}`}
                    </Button>
                  )}
                  {playProducts.data?.yearly && (
                    <Button variant="secondary" disabled={playPurchase.isPending} onClick={() => playPurchase.mutate(playProducts.data!.yearly!, { onError })}>
                      {playPurchase.isPending ? t('Abriendo…') : `${t('Anual')} · ${playProducts.data.yearly.priceString}`}
                    </Button>
                  )}
                  {playProducts.isError && (
                    <p className="text-xs text-line-scarlet">
                      {t('No se pudieron cargar los planes de Google Play. Inténtalo más tarde.')}
                    </p>
                  )}
                  <button
                    type="button"
                    className="self-start text-xs text-brand-700 underline dark:text-brand-500"
                    disabled={playRestore.isPending}
                    onClick={() =>
                      playRestore.mutate(undefined, {
                        onSuccess: (n) => {
                          if (n === 0) showAlert(t('No encontramos compras de Google Play para restaurar.'))
                        },
                        onError,
                      })
                    }
                  >
                    {t('Restaurar compra')}
                  </button>
                </>
              ) : !playBuild ? (
                <>
                  <Button disabled={startCheckout.isPending} onClick={() => startCheckout.mutate('monthly', { onError })}>
                    {startCheckout.isPending ? t('Abriendo…') : `${t('Mensual')} · ${PRICES.monthly}`}
                  </Button>
                  <Button variant="secondary" disabled={startCheckout.isPending} onClick={() => startCheckout.mutate('yearly', { onError })}>
                    {startCheckout.isPending ? t('Abriendo…') : `${t('Anual')} · ${PRICES.yearly} · ${t('2 meses gratis')}`}
                  </Button>
                </>
              ) : null}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
