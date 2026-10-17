import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/Card'

/** Aviso ámbar para funciones premium bloqueadas (o límites alcanzados). */
export function PremiumLocked({ message, className = '' }: { message?: string; className?: string }) {
  const { t } = useTranslation()
  return (
    <Card className={`border-line-amber/30 bg-line-amber/10 ${className}`}>
      <p className="text-sm text-line-amber">
        {message ?? t('Esta función es solo para Premium. Actualiza tu plan para usarla.')}{' '}
        <Link to="/configuracion" className="font-medium underline">
          {t('Ver planes')}
        </Link>
      </p>
    </Card>
  )
}
