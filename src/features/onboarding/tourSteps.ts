// Contenido del recorrido guiado y de la ayuda por sección. Un solo lugar:
// el recorrido inicial (TourRunner) y el botón "?" de cada página
// (SectionHelpButton) leen de aquí. Al agregar una página o función nueva,
// agrega también su paso aquí (con route/target si tiene un control
// anclable, o tourTarget en su PageHeader si no) — de lo contrario queda
// fuera del recorrido guiado sin que nadie lo note, como pasó con
// /suscripciones.
//
// route/target describen cómo el recorrido ancla este paso a la página
// real: route es la ruta a la que navegar, target es el id a buscar como
// [data-tour="<target>"] en el DOM tras navegar. Si target no aparece a
// tiempo (o no se define), el paso cae a un callout centrado sin ancla.
// getSectionHelp()/SectionHelpButton ignoran estos dos campos — solo leen
// icon/title/body, así que no les afecta.

import { orderByPageOrder } from '@/lib/pageOrder'

export interface TourStep {
  id: string
  icon: string
  title: string
  body: string
  /** false = solo disponible como ayuda de sección, no aparece en el recorrido inicial. */
  inTour?: boolean
  /** Ruta a la que navegar antes de mostrar este paso. Omitida solo en "bienvenida". */
  route?: string
  /** Id a buscar como [data-tour="<target>"] tras navegar. Sin esto (o si no aparece), callout centrado. */
  target?: string
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'bienvenida',
    icon: '👋',
    title: '¡Bienvenido a {{app}}!',
    body: 'Un vistazo rápido a lo que puedes hacer aquí. Puedes saltarte esto y consultarlo después con el botón de ayuda de cada sección.',
  },
  {
    id: 'resumen',
    icon: '📊',
    title: 'Resumen',
    body: 'Tu panorama general: saldo total, gastos e ingresos del mes y gráficas rápidas de tus finanzas.',
    route: '/',
    target: 'resumen',
  },
  {
    id: 'cuentas',
    icon: '🏦',
    title: 'Cuentas',
    body: 'Registra tus cuentas de efectivo, débito o ahorro. Cada transacción que agregues se descuenta o suma aquí.',
    route: '/cuentas',
    target: 'cuentas',
  },
  {
    id: 'tarjetas',
    icon: '💳',
    title: 'Tarjetas',
    body: 'Tus tarjetas de crédito o débito. Las de crédito se agrupan en una línea de crédito (siguiente sección) para calcular su estado de cuenta.',
    route: '/tarjetas',
    target: 'tarjetas',
  },
  {
    id: 'credito',
    icon: '💠',
    title: 'Líneas de crédito',
    body: 'Fechas de corte y pago, cuánto llevas gastado del periodo y cuánto debes pagar. Cada cargo nuevo actualiza el monto a pagar automáticamente.',
    route: '/lineas-credito',
    target: 'credito',
  },
  {
    id: 'transacciones',
    icon: '💸',
    title: 'Transacciones',
    body: 'Todos tus movimientos: gastos, ingresos, pagos de tarjeta y transferencias. Aquí puedes editarlos o corregir su categoría.',
    route: '/transacciones',
    target: 'transacciones',
  },
  {
    id: 'presupuestos',
    icon: '🎯',
    title: 'Presupuestos',
    body: 'Define un límite mensual por categoría y recibe un aviso cuando estés por pasarte.',
    route: '/presupuestos',
    target: 'presupuestos',
  },
  {
    id: 'categorias',
    icon: '🏷️',
    title: 'Categorías',
    body: 'Organiza tus gastos e ingresos en categorías propias, con color e ícono, para que tus reportes tengan sentido.',
    route: '/categorias',
    target: 'categorias',
  },
  {
    id: 'reportes',
    icon: '📑',
    title: 'Reportes',
    body: 'Gráficas a fondo de tus finanzas por periodo: ingresos vs. gastos, gasto por categoría y más, exportables a Excel.',
    route: '/reportes',
    target: 'reportes',
  },
  {
    id: 'importar',
    icon: '📥',
    title: 'Importar',
    body: 'Sube un archivo (Excel/CSV) con movimientos ya existentes para no capturarlos uno por uno.',
    route: '/importar',
    target: 'importar',
  },
  {
    id: 'recibos',
    icon: '🧾',
    title: 'Escanear recibo',
    body: 'Toma una foto de un ticket o sube un PDF/XML y la app detecta los datos del gasto por ti.',
    route: '/recibos',
    target: 'recibos',
  },
  {
    id: 'familia',
    icon: '👨‍👩‍👧‍👦',
    title: 'Familia',
    body: 'Invita a otras personas a compartir cuentas o líneas de crédito y ver las finanzas familiares juntos.',
    route: '/familia',
    target: 'familia',
  },
  {
    id: 'correo',
    icon: '📧',
    title: 'Sincronizar correo',
    body: 'Conecta tu Gmail para detectar cargos y pagos automáticamente desde los correos de tu banco.',
    route: '/correo',
    target: 'correo',
  },
  {
    id: 'sms',
    icon: '📱',
    title: 'Sincronizar SMS',
    body: 'En Android, captura tus movimientos en tiempo real desde los SMS que te manda tu banco.',
    route: '/sms',
    target: 'sms',
  },
  {
    id: 'conectar',
    icon: '🔗',
    title: 'Conexión automática',
    body: 'Conecta tu banco directamente para traer tus movimientos sin capturarlos ni leer correos/SMS.',
    route: '/conectar',
    target: 'conectar',
  },
  {
    id: 'rendimientos',
    icon: '📈',
    title: 'Rendimientos',
    body: 'Da seguimiento a cuentas de inversión o ahorro con rendimiento, y a lo que van generando con el tiempo.',
    route: '/rendimientos',
    target: 'rendimientos',
  },
  {
    id: 'configuracion',
    icon: '⚙️',
    title: 'Configuración',
    body: 'Tema, moneda principal, privacidad (ocultar montos) y demás preferencias de tu cuenta.',
    inTour: false,
  },
  {
    id: 'admin',
    icon: '🛠️',
    title: 'Admin',
    body: 'Panel exclusivo de administración: límites del plan gratis, apariencia de la app y configuración global.',
    inTour: false,
  },
]

/**
 * Pasos del recorrido inicial, ordenados según pageOrder (el mismo
 * appConfig.page_order que reordena el sidebar/"Más" — ver lib/pageOrder.ts)
 * cuando se da. "bienvenida" no tiene route, así que el orden lo deja al
 * principio (posición relativa original); configuracion/admin quedan
 * excluidos por inTour: false, sin cambios.
 */
export function getTourSteps(pageOrder?: string[] | null): TourStep[] {
  const steps = TOUR_STEPS.filter((s) => s.inTour !== false)
  if (!pageOrder || pageOrder.length === 0) return steps
  // orderByPageOrder necesita un campo `to` — bienvenida no tiene route, se
  // le da un id único para que el sort estable lo deje en su posición inicial.
  const withTo = steps.map((s) => ({ ...s, to: s.route ?? `__${s.id}` }))
  return orderByPageOrder(withTo, pageOrder).map(({ to, ...step }) => step)
}

export function getSectionHelp(id: string): TourStep | undefined {
  return TOUR_STEPS.find((s) => s.id === id)
}
