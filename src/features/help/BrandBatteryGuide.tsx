import { useState } from 'react'
import { useTranslation } from 'react-i18next'

// Pasos para que el sistema deje viva la captura en segundo plano, por
// fabricante — son los que de verdad matan el "oyente" de notificaciones
// aunque el permiso siga dado. Verificado en un Xiaomi (MIUI): sin esto,
// la app puede decir "Acceso concedido" y aun así no capturar nada porque
// el sistema mató el proceso. Lo usan la página de Captura por
// notificaciones y la de Preguntas frecuentes.
interface BrandGuide {
  key: string
  brands: string
  steps: string[]
}

export const BRAND_GUIDES: BrandGuide[] = [
  {
    key: 'xiaomi',
    brands: 'Xiaomi, Redmi, POCO (MIUI o HyperOS)',
    steps: [
      'Ajustes del teléfono → Aplicaciones → Gestionar aplicaciones → busca esta app → Ahorro de batería → elige "Sin restricciones".',
      'En esa misma pantalla, activa "Inicio automático".',
      'Abre las apps recientes (botón cuadrado), mantén presionada la tarjeta de esta app hasta que aparezca un candado, y actívalo para que no se cierre sola.',
      'Si después de esto sigue sin registrar nada: desinstala la app y vuelve a instalarla. A veces el sistema deja el permiso en un estado raro que solo se arregla reinstalando.',
    ],
  },
  {
    key: 'huawei',
    brands: 'Huawei, Honor (EMUI o MagicOS)',
    steps: [
      'Ajustes → Batería → Inicio de apps → busca esta app y desactiva la gestión automática.',
      'Activa a mano las tres opciones que aparecen: "Inicio automático", "Inicio secundario" y "Ejecutar en segundo plano".',
    ],
  },
  {
    key: 'oppo',
    brands: 'Oppo, Realme, OnePlus (ColorOS)',
    steps: [
      'Ajustes → Batería → Uso de batería por app → busca esta app → permite "Actividad en segundo plano".',
      'Ajustes → Administración de apps (o "Inicio automático de apps") → actívalo para esta app.',
    ],
  },
  {
    key: 'samsung',
    brands: 'Samsung (One UI)',
    steps: [
      'Mantén presionado el ícono de la app → Info de la app → Batería → elige "Sin restricciones".',
      'Ajustes → Cuidado del dispositivo → Batería → Límites de uso en segundo plano → confirma que esta app NO esté en "Apps que no se usan" ni en "Apps en reposo profundo".',
    ],
  },
  {
    key: 'otro',
    brands: 'Otra marca',
    steps: [
      'Busca en Ajustes algo como "Optimización de batería" o "Ahorro de energía" y pon esta app en "Sin restricciones" o "No optimizar".',
      'Revisa que no tenga activado ningún modo de "suspender apps no usadas" para ella.',
    ],
  },
]

/** Lista de marcas desplegables, una abierta a la vez. */
export function BrandBatteryGuide() {
  const { t } = useTranslation()
  const [expandedBrand, setExpandedBrand] = useState<string | null>(null)

  return (
    <div className="grid gap-2">
      {BRAND_GUIDES.map((guide) => {
        const isOpen = expandedBrand === guide.key
        return (
          <div
            key={guide.key}
            className="rounded-lg border border-slate-200 dark:border-slate-700"
          >
            <button
              type="button"
              onClick={() => setExpandedBrand(isOpen ? null : guide.key)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              {t(guide.brands)}
              <span className="text-xs text-slate-400">{isOpen ? '▲' : '▼'}</span>
            </button>
            {isOpen && (
              <ol className="grid gap-1.5 border-t border-slate-200 dark:border-slate-700 px-3 py-2 text-sm text-slate-600 dark:text-slate-300">
                {guide.steps.map((step, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="shrink-0 font-semibold text-brand-600 dark:text-brand-400">
                      {i + 1}.
                    </span>
                    <span>{t(step)}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )
      })}
    </div>
  )
}
