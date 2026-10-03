import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatMoney } from '@/lib/format'
import {
  inferFromExample,
  previewRule,
  regexError,
  regexesFromSimple,
  type SimpleRuleFields,
} from '@/lib/ruleBuilder'

// Cómo se le dice a la regla dónde está el monto, el concepto y la
// terminación de la tarjeta:
//  - 'example': pegar un correo real y escribir lo que se ve en él;
//  - 'simple' : "el monto viene después de: ___";
//  - 'advanced': regex a mano (lo de siempre).
// Los dos primeros generan los regex (lib/ruleBuilder.ts), así que el
// backend no cambia.
export type PatternMode = 'example' | 'simple' | 'advanced'

export interface RuleRegexes {
  amountRegex: string
  conceptRegex: string
  last4Regex: string
}

interface Props {
  mode: PatternMode
  onModeChange: (m: PatternMode) => void
  simple: SimpleRuleFields
  onSimpleChange: (f: SimpleRuleFields) => void
  regexes: RuleRegexes
  onRegexesChange: (r: RuleRegexes) => void
  sample: string
  onSampleChange: (s: string) => void
}

/** Regex que de verdad se guardan según el modo. */
export function effectiveRegexes(mode: PatternMode, simple: SimpleRuleFields, regexes: RuleRegexes): RuleRegexes {
  return mode === 'advanced' ? regexes : regexesFromSimple(simple)
}

export function RulePatternEditor({
  mode,
  onModeChange,
  simple,
  onSimpleChange,
  regexes,
  onRegexesChange,
  sample,
  onSampleChange,
}: Props) {
  const { t } = useTranslation()
  const [seenAmount, setSeenAmount] = useState('')
  const [seenConcept, setSeenConcept] = useState('')
  const [seenLast4, setSeenLast4] = useState('')
  const [detectMsg, setDetectMsg] = useState<string | null>(null)

  const effective = effectiveRegexes(mode, simple, regexes)
  const preview = sample.trim() ? previewRule(sample, effective) : null

  function changeMode(next: PatternMode) {
    // Al pasar a avanzado se llevan los regex generados, para ajustarlos.
    if (next === 'advanced' && mode !== 'advanced') {
      onRegexesChange(regexesFromSimple(simple))
    }
    onModeChange(next)
  }

  function detect() {
    const { fields, notFound } = inferFromExample(sample, {
      amount: seenAmount,
      concept: seenConcept,
      last4: seenLast4,
    })
    onSimpleChange({ ...simple, ...fields })
    const labels: Record<string, string> = {
      amount: t('el monto'),
      concept: t('el concepto'),
      last4: t('la terminación'),
    }
    setDetectMsg(
      notFound.length
        ? t('No encontré {{what}} en el correo. Revisa que lo hayas escrito igual que aparece.', {
            what: notFound.map((k) => labels[k]).join(', '),
          })
        : Object.keys(fields).length
          ? t('✓ Listo. Revisa la vista previa y ajusta los textos si hace falta.')
          : null,
    )
  }

  const tabs: { id: PatternMode; label: string }[] = [
    { id: 'example', label: t('Con un correo de ejemplo') },
    { id: 'simple', label: t('Texto antes / después') },
    { id: 'advanced', label: t('Avanzado (regex)') },
  ]

  const setField = (k: keyof SimpleRuleFields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onSimpleChange({ ...simple, [k]: e.target.value })

  const sampleBox = (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
        {t('Correo de ejemplo')}
      </label>
      <textarea
        value={sample}
        onChange={(e) => onSampleChange(e.target.value)}
        rows={4}
        placeholder={t('Pega aquí el texto de un correo de tu banco (asunto y cuerpo)…')}
        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-2 text-sm placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      />
    </div>
  )

  return (
    <div className="grid min-w-0 grid-cols-1 gap-3 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {t('¿Dónde viene el monto, el concepto y la tarjeta?')}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('Opcional: si lo dejas vacío, el sistema los busca solo (Total, monto con $, terminación de tarjeta).')}
        </p>
      </div>

      <div className="flex flex-wrap gap-1" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={mode === tab.id}
            onClick={() => changeMode(tab.id)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              mode === tab.id
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mode === 'example' && (
        <>
          {sampleBox}
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('Escribe lo que ves en ese correo, tal cual aparece:')}
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Input
              label={t('Monto')}
              value={seenAmount}
              onChange={(e) => setSeenAmount(e.target.value)}
              placeholder="$1,234.56"
            />
            <Input
              label={t('Comercio o concepto')}
              value={seenConcept}
              onChange={(e) => setSeenConcept(e.target.value)}
              placeholder="OXXO"
            />
            <Input
              label={t('Terminación de tarjeta')}
              value={seenLast4}
              onChange={(e) => setSeenLast4(e.target.value)}
              placeholder="1234"
              inputMode="numeric"
              maxLength={4}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={detect}
              disabled={!sample.trim() || !(seenAmount || seenConcept || seenLast4)}
            >
              {t('Detectar')}
            </Button>
            {detectMsg && <p className="text-xs text-slate-600 dark:text-slate-300">{detectMsg}</p>}
          </div>
        </>
      )}

      {(mode === 'example' || mode === 'simple') && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label={t('El monto viene después de')}
            value={simple.amountBefore}
            onChange={setField('amountBefore')}
            placeholder={t('ej. por')}
          />
          <Input
            label={t('La tarjeta viene después de')}
            value={simple.last4Before}
            onChange={setField('last4Before')}
            placeholder={t('ej. terminada en')}
          />
          <Input
            label={t('El concepto viene después de')}
            value={simple.conceptBefore}
            onChange={setField('conceptBefore')}
            placeholder={t('ej. en')}
          />
          <Input
            label={t('…y termina antes de (opcional)')}
            value={simple.conceptAfter}
            onChange={setField('conceptAfter')}
            placeholder={t('ej. con')}
          />
        </div>
      )}

      {mode === 'advanced' && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Input
            label={t('Regex de monto (opcional)')}
            value={regexes.amountRegex}
            onChange={(e) => onRegexesChange({ ...regexes, amountRegex: e.target.value })}
            placeholder="por \$([\d,]+\.\d{2})"
            error={regexError(regexes.amountRegex) ?? undefined}
          />
          <Input
            label={t('Regex de concepto (opcional)')}
            value={regexes.conceptRegex}
            onChange={(e) => onRegexesChange({ ...regexes, conceptRegex: e.target.value })}
            placeholder="en (.+?) por"
            error={regexError(regexes.conceptRegex) ?? undefined}
          />
          <Input
            label={t('Regex de terminación de tarjeta (opcional)')}
            value={regexes.last4Regex}
            onChange={(e) => onRegexesChange({ ...regexes, last4Regex: e.target.value })}
            placeholder="terminada en (\d{4})"
            error={regexError(regexes.last4Regex) ?? undefined}
          />
          <p className="text-xs text-slate-400 dark:text-slate-500 sm:col-span-3">
            {t('El monto toma el primer grupo entre paréntesis; el concepto y la terminación, el grupo 1. Se ignoran mayúsculas/minúsculas.')}
          </p>
        </div>
      )}

      {mode !== 'example' && (
        <details className="text-xs text-slate-500 dark:text-slate-400" open={!!sample}>
          <summary className="cursor-pointer select-none">{t('Probar con un correo de ejemplo')}</summary>
          <div className="mt-2">{sampleBox}</div>
        </details>
      )}

      {preview && (
        <div className="rounded-md bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-xs text-slate-700 dark:text-slate-200">
          <p className="mb-1 font-semibold">{t('Vista previa con el correo de ejemplo:')}</p>
          <p>
            {t('Monto')}:{' '}
            {preview.amount != null ? formatMoney(preview.amount, 'MXN') : <span className="text-red-600">{t('no encontrado (el correo se omitiría)')}</span>}
            {preview.autoAmount && preview.amount != null && <span className="text-slate-400"> · {t('automático')}</span>}
          </p>
          <p>
            {t('Concepto')}:{' '}
            {preview.concept ?? <span className="text-slate-400">{t('el asunto del correo')}</span>}
          </p>
          <p>
            {t('Tarjeta')}:{' '}
            {preview.last4 ? `•••• ${preview.last4}` : <span className="text-slate-400">{t('sin terminación (usa la cuenta por defecto)')}</span>}
            {preview.autoLast4 && preview.last4 && <span className="text-slate-400"> · {t('automático')}</span>}
          </p>
        </div>
      )}

      {mode !== 'advanced' && (effective.amountRegex || effective.conceptRegex || effective.last4Regex) && (
        <details className="text-xs text-slate-400 dark:text-slate-500">
          <summary className="cursor-pointer select-none">{t('Ver regex generado')}</summary>
          <ul className="mt-1 space-y-0.5 break-all font-mono">
            {effective.amountRegex && <li>{t('Monto')}: {effective.amountRegex}</li>}
            {effective.conceptRegex && <li>{t('Concepto')}: {effective.conceptRegex}</li>}
            {effective.last4Regex && <li>{t('Tarjeta')}: {effective.last4Regex}</li>}
          </ul>
        </details>
      )}
    </div>
  )
}
