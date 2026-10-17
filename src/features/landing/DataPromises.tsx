import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'

// Las 4 promesas de privacidad (copy.md §1 "Tus datos son solo tuyos"). Las comparten
// la landing y Quiénes somos para que no se desfasen.
export function DataPromises() {
  const { t } = useTranslation()
  const promises = [
    t('No somos un banco: no pedimos tu usuario ni tu contraseña de banca en línea.'),
    t('Nadie más ve tus cuentas, salvo lo que tú compartas en el plan familiar.'),
    t('No vendemos tus datos ni los usamos para publicidad.'),
    t('Sin cookies de rastreo ni anuncios.'),
  ]
  return (
    <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
      {promises.map((p) => (
        <li key={p} className="flex items-start gap-2">
          <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-line-green" strokeWidth={2.6} />
          <span>{p}</span>
        </li>
      ))}
    </ul>
  )
}
