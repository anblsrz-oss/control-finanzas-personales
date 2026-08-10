import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/store/useAuth'
import {
  useParsingRules,
  useSaveParsingRule,
  useDeleteParsingRule,
} from '@/hooks/useImports'
import { useQueryClient } from '@tanstack/react-query'
import type { ParsingRuleRow } from '@/types/db'
import {
  isAndroidNative,
  isSmsCaptureEnabled,
  enableSmsCapture,
  disableSmsCapture,
  updateSmsSenders,
  syncSmsNow,
} from '@/lib/smsSync'
import { getPlatform } from '@/lib/nativeAuth'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function SmsSyncPage() {
  const { t } = useTranslation()
  const { session } = useAuth()
  const userId = session?.user?.id
  const queryClient = useQueryClient()

  const rulesQuery = useParsingRules(userId, 'sms')
  const saveRule = useSaveParsingRule()
  const deleteRule = useDeleteParsingRule()

  const rules = rulesQuery.data || []

  const [bankName, setBankName] = useState('')
  const [senders, setSenders] = useState('')
  const [amountRegex, setAmountRegex] = useState('')
  const [incomeKeywords, setIncomeKeywords] = useState('')
  const [expenseKeywords, setExpenseKeywords] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const [enabled, setEnabled] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const platform = getPlatform()
  const available = isAndroidNative()

  // Lista de remitentes de todas las reglas (para el receptor nativo).
  const allSenders = rules.flatMap((r) => r.config.senders ?? [])

  useEffect(() => {
    if (available) void isSmsCaptureEnabled().then(setEnabled)
  }, [available])

  function resetForm() {
    setBankName('')
    setSenders('')
    setAmountRegex('')
    setIncomeKeywords('')
    setExpenseKeywords('')
    setEditingId(null)
  }

  async function handleSaveRule() {
    if (!userId || !bankName.trim() || !senders.trim()) return
    if (
      editingId &&
      rules.find((r) => r.id === editingId)?.bank_name !== bankName.trim()
    ) {
      await deleteRule.mutateAsync({ userId, id: editingId })
    }
    await saveRule.mutateAsync({
      userId,
      bankName: bankName.trim(),
      channel: 'sms',
      config: {
        senders: senders.split(',').map((s) => s.trim()).filter(Boolean),
        amountRegex: amountRegex.trim() || undefined,
        incomeKeywords: incomeKeywords
          ? incomeKeywords.split(',').map((s) => s.trim()).filter(Boolean)
          : undefined,
        expenseKeywords: expenseKeywords
          ? expenseKeywords.split(',').map((s) => s.trim()).filter(Boolean)
          : undefined,
      },
    })
    // Mantener sincronizados los remitentes que el receptor nativo filtra.
    const updated = [
      ...allSenders,
      ...senders.split(',').map((s) => s.trim()).filter(Boolean),
    ]
    await updateSmsSenders(updated)
    resetForm()
  }

  function handleEditRule(r: ParsingRuleRow) {
    setEditingId(r.id)
    setBankName(r.bank_name)
    setSenders((r.config.senders ?? []).join(', '))
    setAmountRegex(r.config.amountRegex ?? '')
    setIncomeKeywords((r.config.incomeKeywords ?? []).join(', '))
    setExpenseKeywords((r.config.expenseKeywords ?? []).join(', '))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDeleteRule(r: ParsingRuleRow) {
    if (!userId) return
    if (!window.confirm(t('¿Borrar el remitente "{{name}}"?', { name: r.bank_name }))) return
    if (editingId === r.id) resetForm()
    await deleteRule.mutateAsync({ userId, id: r.id })
  }

  async function handleToggle() {
    if (!userId) return
    setBusy(true)
    setMsg(null)
    try {
      if (enabled) {
        await disableSmsCapture(userId)
        setEnabled(false)
        setMsg(t('Captura automática desactivada.'))
      } else {
        if (allSenders.length === 0) {
          setMsg(t('Agrega al menos un remitente de tu banco antes de activar.'))
          return
        }
        await enableSmsCapture(userId, allSenders)
        setEnabled(true)
        setMsg(
          t('Captura automática activada. Los SMS de tus bancos se registrarán solos como pendientes.'),
        )
      }
    } catch (e) {
      setMsg(`${t('Error:')} ${(e as Error).message}`)
    } finally {
      setBusy(false)
    }
  }

  async function handleSyncNow() {
    if (!userId) return
    setBusy(true)
    setMsg(null)
    try {
      const res = await syncSmsNow()
      setMsg(
        t('SMS leídos: {{found}}. Movimientos nuevos (pendientes): {{inserted}}{{dups}}.', {
          found: res.found,
          inserted: res.inserted,
          dups: res.duplicates ? t(', {{n}} duplicados', { n: res.duplicates }) : '',
        }),
      )
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] })
    } catch (e) {
      setMsg(`${t('Error:')} ${(e as Error).message}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader
        title={t('Captura automática de SMS')}
        subtitle={t('Registra solo las alertas de compra y transferencia por SMS de tu banco. Disponible solo en la app de Android.')}
        helpId="sms"
      />

      {!available ? (
        <Card className="border-dashed">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {platform === 'ios'
              ? t('📵 Apple no permite que las apps lean SMS. En iPhone usa "Sincronizar correo" o "Importar" tu estado de cuenta.')
              : t('Esta función solo está disponible en la app instalada de Android. En el navegador no se pueden leer SMS.')}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          <Card className="grid gap-3">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {editingId
                ? t('Editando: {{name}}', { name: bankName })
                : t('1. Remitentes de SMS de tu banco')}
            </h3>
            {rules.length > 0 && (
              <ul className="grid gap-1 text-sm text-slate-600 dark:text-slate-300">
                {rules.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-2 rounded-md px-1 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  >
                    <span className="min-w-0 truncate">
                      <strong>{r.bank_name}:</strong>{' '}
                      {(r.config.senders ?? []).join(', ')}
                    </span>
                    <span className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditRule(r)}
                        className="text-xs font-medium text-brand-700 dark:text-brand-500 hover:underline"
                      >
                        {t('Editar')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRule(r)}
                        disabled={deleteRule.isPending}
                        className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                      >
                        {t('Borrar')}
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="grid gap-3 sm:grid-cols-3">
              <Input
                label={t('Banco')}
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="BBVA"
              />
              <Input
                label={t('Remitentes (coma)')}
                value={senders}
                onChange={(e) => setSenders(e.target.value)}
                placeholder="BBVA, 33000"
              />
              <Input
                label={t('Regex de monto (opcional)')}
                value={amountRegex}
                onChange={(e) => setAmountRegex(e.target.value)}
                placeholder="por \\$([\\d,]+\\.\\d{2})"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label={t('Palabras de ingreso (coma, opcional)')}
                value={incomeKeywords}
                onChange={(e) => setIncomeKeywords(e.target.value)}
                placeholder="recibiste, abono, depósito"
              />
              <Input
                label={t('Palabras de gasto (coma, opcional)')}
                value={expenseKeywords}
                onChange={(e) => setExpenseKeywords(e.target.value)}
                placeholder="compra, cargo, pago"
              />
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {t('Si el SMS contiene una palabra de ingreso se registra como ingreso (ej. transferencias recibidas); si no, como gasto. Si lo dejas vacío se usan listas por defecto en español.')}
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={handleSaveRule}
                disabled={!bankName.trim() || !senders.trim() || saveRule.isPending}
              >
                {editingId ? t('Guardar cambios') : t('Guardar remitente')}
              </Button>
              {editingId && (
                <Button variant="ghost" onClick={resetForm}>
                  {t('Cancelar')}
                </Button>
              )}
            </div>
          </Card>

          <Card className="grid gap-3">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {t('2. Captura automática')}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {enabled
                ? t('✅ Activada. Los SMS de tus bancos se registran solos como pendientes en cuanto llegan.')
                : t('Actívala para que los SMS se registren solos, sin abrir la app. Se pedirá permiso para leer y recibir SMS.')}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleToggle} disabled={busy}>
                {busy
                  ? t('Un momento…')
                  : enabled
                    ? t('Desactivar captura')
                    : t('Activar captura automática')}
              </Button>
              {enabled && (
                <Button variant="secondary" onClick={handleSyncNow} disabled={busy}>
                  {t('Sincronizar ahora')}
                </Button>
              )}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {t('Los movimientos se crean como pendientes; confírmalos en Transacciones para que cuenten en tus saldos. Para que funcione con la app cerrada, excluye la app de la optimización de batería.')}
            </p>
          </Card>

          {msg && (
            <Card className="border-brand-200 bg-brand-50 dark:bg-brand-800/40">
              <p className="text-sm font-medium text-brand-700 dark:text-brand-500">{msg}</p>
            </Card>
          )}
        </div>
      )}
    </>
  )
}
