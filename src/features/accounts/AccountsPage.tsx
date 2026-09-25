import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/store/useAuth'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAccounts, useDeleteAccount, useUpdateAccount } from '@/hooks/useAccounts'
import { useEntitlements } from '@/hooks/useAppConfig'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { PremiumGate } from '@/components/ui/PremiumGate'
import { AccountForm } from './AccountForm'
import { Money } from '@/components/ui/Money'
import { useSettings } from '@/store/useSettings'
import type { AccountRow } from '@/types/db'

export function AccountsPage() {
  const { t } = useTranslation()
  const { session, profile } = useAuth()
  const userId = session?.user?.id
  const [showForm, setShowForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState<AccountRow | null>(null)
  const [pocketParent, setPocketParent] = useState<AccountRow | null>(null)
  // Convertir una cuenta ya existente (creada antes de que existieran los
  // apartados) en apartado de otra, sin tocar sus transacciones — solo
  // cambia parent_account_id, la cuenta y su historial siguen siendo la
  // misma fila.
  const [movingAccount, setMovingAccount] = useState<AccountRow | null>(null)
  const [moveTargetId, setMoveTargetId] = useState('')
  const formRef = useRef<HTMLDivElement>(null)

  // En móvil el formulario queda fuera de pantalla: hay que desplazarse a él.
  useEffect(() => {
    if (editingAccount || pocketParent) {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [editingAccount, pocketParent])

  const showAccountsTotal = useSettings((s) => s.showAccountsTotal)
  const accountsQuery = useAccounts(userId)
  const deleteAccount = useDeleteAccount()
  const updateAccount = useUpdateAccount()
  const { accountLimit, canUse, limitFor } = useEntitlements()
  const canUsePockets = canUse('pockets')
  const pocketLimit = limitFor('pockets')

  // Consultar la vista account_balances para saldos actuales
  const balancesQuery = useQuery({
    queryKey: ['account_balances', userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('account_balances')
        .select('*')
        .eq('user_id', userId)
      if (error) {
        console.error('Error cargando saldos:', error)
        return []
      }
      return data || []
    },
    enabled: !!userId,
  })

  const accounts = accountsQuery.data || []
  const balances = balancesQuery.data || []

  const getBalance = (accountId: string) => {
    const balance = balances.find((b: any) => b.account_id === accountId)
    return balance?.current_balance ?? accounts.find(a => a.id === accountId)?.initial_balance ?? 0
  }

  const handleDelete = (id: string) => {
    if (confirm(t('¿Eliminar esta cuenta?'))) {
      deleteAccount.mutate({ id, userId: userId! })
    }
  }

  const handleConfirmMove = () => {
    if (!movingAccount || !moveTargetId || !userId) return
    updateAccount.mutate(
      { id: movingAccount.id, userId, parent_account_id: moveTargetId },
      {
        onSuccess: () => {
          setMovingAccount(null)
          setMoveTargetId('')
        },
        onError: (error: any) => {
          alert(`Error: ${error.message || 'Error desconocido'}`)
        },
      },
    )
  }

  // Total por moneda: sumar MXN con USD daría una cifra sin sentido, así que
  // cada moneda lleva su propio renglón. Cada apartado ya es su propia fila
  // de accounts/account_balances, así que entra sin doble conteo (lo que se
  // transfiere a un apartado sale del saldo de la madre y entra al suyo).
  const totalsByCurrency = accounts.reduce<Record<string, number>>((acc, a) => {
    acc[a.currency] = (acc[a.currency] ?? 0) + getBalance(a.id)
    return acc
  }, {})
  const currencies = Object.keys(totalsByCurrency).sort()

  // Los apartados (cajitas) se anidan bajo su cuenta madre; no cuentan como
  // cuentas "raíz" para el límite del plan.
  const rootAccounts = accounts.filter((a) => !a.parent_account_id)
  const pocketCount = accounts.length - rootAccounts.length
  const pocketTooltip = t('Plan gratis: máximo {{n}} apartados. Actualiza a Premium para agregar más.', { n: pocketLimit })
  const pocketsByParent = accounts.reduce<Record<string, AccountRow[]>>((acc, a) => {
    if (a.parent_account_id) {
      ;(acc[a.parent_account_id] ??= []).push(a)
    }
    return acc
  }, {})

  return (
    <>
      <PageHeader
        title={t('Cuentas')}
        subtitle={t('Tus cuentas y bancos, con saldo y rendimientos.')}
        helpId="cuentas"
        actions={
          <PremiumGate
            count={rootAccounts.length}
            limit={accountLimit}
            lockedTooltip={t('Plan gratis: máximo {{n}} cuentas. Actualiza a Premium para agregar más.', { n: accountLimit })}
          >
            <Button
              data-tour="cuentas"
              onClick={() => {
                setEditingAccount(null)
                setShowForm(!showForm)
              }}
            >
              {showForm ? t('Cancelar') : t('+ Agregar cuenta')}
            </Button>
          </PremiumGate>
        }
      />

      {showForm && !editingAccount && (
        <AccountForm onSuccess={() => setShowForm(false)} />
      )}

      {editingAccount && (
        <div ref={formRef} className="scroll-mt-4">
          <AccountForm
            account={editingAccount}
            onSuccess={() => setEditingAccount(null)}
            onCancel={() => setEditingAccount(null)}
          />
        </div>
      )}

      {pocketParent && (
        <div ref={formRef} className="scroll-mt-4">
          <AccountForm
            parentAccount={pocketParent}
            onSuccess={() => setPocketParent(null)}
            onCancel={() => setPocketParent(null)}
          />
        </div>
      )}

      {/* Total de todas las cuentas. Se puede quitar por completo desde
          Ajustes; el botón 👁 solo enmascara la cifra, no el apartado. */}
      {showAccountsTotal && accounts.length > 0 && (
        <Card className="mb-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {t('Total en cuentas')}
          </p>
          <div className="mt-1 space-y-0.5">
            {currencies.map((cur) => (
              <p
                key={cur}
                className="text-2xl font-semibold text-slate-800 dark:text-slate-100"
              >
                <Money amount={totalsByCurrency[cur]} currency={cur} />
              </p>
            ))}
          </div>
        </Card>
      )}

      {rootAccounts.length === 0 ? (
        <Card className="animate-empty-state-in border-dashed text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('Sin cuentas. Crea una para empezar.')}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {rootAccounts.map((acc) => {
            const balance = getBalance(acc.id)
            const pockets = pocketsByParent[acc.id] || []
            return (
              <div key={acc.id} className="space-y-2">
                <Card className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                      {acc.name}
                      {acc.is_scholarship && (
                        <span className="inline-flex items-center rounded-full bg-violet-100 dark:bg-violet-900/40 px-2 py-0.5 text-xs font-medium text-violet-700 dark:text-violet-300">
                          🎓 {acc.scholarship_name || t('Beca')}
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {acc.bank_name || t('Sin banco')} • {acc.type} • {acc.currency}
                    </p>
                    {acc.has_yield && (
                      <p className="mt-1 text-xs text-green-600">
                        📈 {t('Rendimiento:')} {acc.yield_rate}%{' '}
                        {acc.yield_rate_period === 'annual' ? t('anual') : t('mensual')}
                        {acc.yield_kind === 'term' && <> · {t('plazo fijo')}</>}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                      <Money amount={balance} currency={acc.currency} />
                    </p>
                    <div className="mt-3 flex flex-wrap justify-end gap-2">
                      {canUsePockets && (
                        <PremiumGate count={pocketCount} limit={pocketLimit} lockedTooltip={pocketTooltip}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowForm(false)
                              setEditingAccount(null)
                              setPocketParent(acc)
                            }}
                          >
                            {t('+ Apartado')}
                          </Button>
                        </PremiumGate>
                      )}
                      {canUsePockets && rootAccounts.length > 1 && pockets.length === 0 && (
                        <PremiumGate count={pocketCount} limit={pocketLimit} lockedTooltip={pocketTooltip}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowForm(false)
                              setEditingAccount(null)
                              setPocketParent(null)
                              setMovingAccount(acc)
                              setMoveTargetId('')
                            }}
                          >
                            {t('Mover a apartado')}
                          </Button>
                        </PremiumGate>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowForm(false)
                          setPocketParent(null)
                          setEditingAccount(acc)
                        }}
                      >
                        {t('Editar')}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(acc.id)}
                        disabled={deleteAccount.isPending}
                      >
                        {t('Eliminar')}
                      </Button>
                    </div>
                  </div>
                </Card>

                {movingAccount?.id === acc.id && (
                  <Card className="ml-6 border-dashed">
                    <p className="mb-2 text-xs font-medium text-slate-700 dark:text-slate-200">
                      {t('Convertir "{{name}}" en apartado de…', { name: acc.name })}
                    </p>
                    <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
                      {t('Sus transacciones no se tocan: solo pasa a mostrarse anidada bajo la cuenta que elijas.')}
                    </p>
                    <div className="flex flex-wrap items-end gap-2">
                      <Select
                        options={[
                          { value: '', label: t('Elige una cuenta…') },
                          ...rootAccounts
                            .filter((a) => a.id !== acc.id)
                            .map((a) => ({
                              value: a.id,
                              label: `${a.name} (${a.currency})`,
                            })),
                        ]}
                        value={moveTargetId}
                        onChange={(e) => setMoveTargetId(e.target.value)}
                      />
                      <Button
                        size="sm"
                        disabled={!moveTargetId || updateAccount.isPending}
                        onClick={handleConfirmMove}
                      >
                        {updateAccount.isPending ? t('Guardando…') : t('Confirmar')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setMovingAccount(null)
                          setMoveTargetId('')
                        }}
                      >
                        {t('Cancelar')}
                      </Button>
                    </div>
                    {moveTargetId &&
                      rootAccounts.find((a) => a.id === moveTargetId)?.currency !== acc.currency && (
                        <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                          {t('Ojo: quedará en {{cur1}} dentro de una cuenta en {{cur2}}.', {
                            cur1: acc.currency,
                            cur2: rootAccounts.find((a) => a.id === moveTargetId)?.currency,
                          })}
                        </p>
                      )}
                  </Card>
                )}

                {pockets.map((pocket) => {
                  const pocketBalance = getBalance(pocket.id)
                  return (
                    <Card
                      key={pocket.id}
                      className="ml-6 flex items-start justify-between border-dashed"
                    >
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                          ↳ {pocket.name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {t('Apartado')} • {pocket.currency}
                        </p>
                        {pocket.has_yield && (
                          <p className="mt-1 text-xs text-green-600">
                            📈 {t('Rendimiento:')} {pocket.yield_rate}%{' '}
                            {pocket.yield_rate_period === 'annual' ? t('anual') : t('mensual')}
                            {pocket.yield_kind === 'term' && <> · {t('plazo fijo')}</>}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-base font-semibold text-slate-800 dark:text-slate-100">
                          <Money amount={pocketBalance} currency={pocket.currency} />
                        </p>
                        <div className="mt-3 flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowForm(false)
                              setPocketParent(null)
                              setEditingAccount(pocket)
                            }}
                          >
                            {t('Editar')}
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(pocket.id)}
                            disabled={deleteAccount.isPending}
                          >
                            {t('Eliminar')}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}

      {!profile?.is_premium && accountLimit !== Infinity && rootAccounts.length >= accountLimit && (
        <Card className="mt-4 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            {t('Plan gratis: máximo {{n}} cuentas. Actualiza a Premium para agregar más.', { n: accountLimit })}
          </p>
        </Card>
      )}
    </>
  )
}
