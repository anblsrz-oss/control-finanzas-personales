// Contenido del tutorial guiado y de la ayuda por sección. Un solo lugar:
// el recorrido inicial y el botón "?" de cada página leen de aquí. Al
// agregar o cambiar una sección, actualiza su entrada aquí (y agrega una
// línea en changelog.ts si el cambio vale la pena avisarlo).

// Cuentas creadas antes de esta fecha no reciben el recorrido automático al
// entrar (ya conocen la app) — solo lo ven mediante el botón de ayuda.
export const ONBOARDING_LAUNCH_DATE = '2026-08-09'

export interface TourStep {
  id: string
  icon: string
  title: string
  body: string
  /** false = solo disponible como ayuda de sección, no aparece en el recorrido inicial. */
  inTour?: boolean
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
  },
  {
    id: 'cuentas',
    icon: '🏦',
    title: 'Cuentas',
    body: 'Registra tus cuentas de efectivo, débito o ahorro. Cada transacción que agregues se descuenta o suma aquí.',
  },
  {
    id: 'tarjetas',
    icon: '💳',
    title: 'Tarjetas',
    body: 'Tus tarjetas de crédito o débito. Las de crédito se agrupan en una línea de crédito (siguiente sección) para calcular su estado de cuenta.',
  },
  {
    id: 'credito',
    icon: '💠',
    title: 'Líneas de crédito',
    body: 'Fechas de corte y pago, cuánto llevas gastado del periodo y cuánto debes pagar. Cada cargo nuevo actualiza el monto a pagar automáticamente.',
  },
  {
    id: 'transacciones',
    icon: '💸',
    title: 'Transacciones',
    body: 'Todos tus movimientos: gastos, ingresos, pagos de tarjeta y transferencias. Aquí puedes editarlos o corregir su categoría.',
  },
  {
    id: 'presupuestos',
    icon: '🎯',
    title: 'Presupuestos',
    body: 'Define un límite mensual por categoría y recibe un aviso cuando estés por pasarte.',
  },
  {
    id: 'categorias',
    icon: '🏷️',
    title: 'Categorías',
    body: 'Organiza tus gastos e ingresos en categorías propias, con color e ícono, para que tus reportes tengan sentido.',
  },
  {
    id: 'reportes',
    icon: '📑',
    title: 'Reportes',
    body: 'Gráficas a fondo de tus finanzas por periodo: ingresos vs. gastos, gasto por categoría y más, exportables a Excel.',
  },
  {
    id: 'importar',
    icon: '📥',
    title: 'Importar',
    body: 'Sube un archivo (Excel/CSV) con movimientos ya existentes para no capturarlos uno por uno.',
  },
  {
    id: 'recibos',
    icon: '🧾',
    title: 'Escanear recibo',
    body: 'Toma una foto de un ticket o sube un PDF/XML y la app detecta los datos del gasto por ti.',
  },
  {
    id: 'familia',
    icon: '👨‍👩‍👧‍👦',
    title: 'Familia',
    body: 'Invita a otras personas a compartir cuentas o líneas de crédito y ver las finanzas familiares juntos.',
  },
  {
    id: 'correo',
    icon: '📧',
    title: 'Sincronizar correo',
    body: 'Conecta tu Gmail para detectar cargos y pagos automáticamente desde los correos de tu banco.',
  },
  {
    id: 'sms',
    icon: '📱',
    title: 'Sincronizar SMS',
    body: 'En Android, captura tus movimientos en tiempo real desde los SMS que te manda tu banco.',
  },
  {
    id: 'conectar',
    icon: '🔗',
    title: 'Conexión automática',
    body: 'Conecta tu banco directamente para traer tus movimientos sin capturarlos ni leer correos/SMS.',
  },
  {
    id: 'rendimientos',
    icon: '📈',
    title: 'Rendimientos',
    body: 'Da seguimiento a cuentas de inversión o ahorro con rendimiento, y a lo que van generando con el tiempo.',
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

export function getTourSteps(): TourStep[] {
  return TOUR_STEPS.filter((s) => s.inTour !== false)
}

export function getSectionHelp(id: string): TourStep | undefined {
  return TOUR_STEPS.find((s) => s.id === id)
}
