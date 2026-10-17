// Contenido de las 4 páginas de producto (docs/seo/copy.md §2). Los textos son las
// claves en español de i18n: ProductPage y la landing los pasan por t().

export type ProductPath =
  | '/registrar-gastos-automaticamente'
  | '/escanear-tickets'
  | '/control-de-tarjetas-y-msi'
  | '/presupuesto-personal-y-familiar'

export interface ProductPageData {
  /** Texto del enlace descriptivo hacia esta página (landing y "También te puede interesar"). */
  link: string
  h1: string
  intro: string
  sections: { h2: string; text: string }[]
  note?: string
}

export const PRODUCT_PAGES: Record<ProductPath, ProductPageData> = {
  '/registrar-gastos-automaticamente': {
    link: 'Cómo funciona la captura automática',
    h1: 'Registra tus gastos automáticamente desde las notificaciones de tu banco',
    intro: 'Cada vez que tu banco te avisa de una compra en el celular, la app de Android puede convertir ese aviso en un movimiento, sin que lo captures a mano.',
    sections: [
      { h2: 'Cómo funciona', text: 'Das permiso a la app para leer notificaciones. Cuando llega un aviso de compra, la app toma el monto, el comercio y la fecha, y crea el movimiento en la cuenta o tarjeta que corresponde.' },
      { h2: 'Sin acceso a tu banco', text: 'No te pedimos usuario ni contraseña del banco y no nos conectamos a tu banca en línea. Solo se usan los avisos que ya llegan a tu celular, y se ignoran las promociones.' },
      { h2: 'Tú tienes la última palabra', text: 'Revisa, edita o borra cualquier movimiento. Si un aviso llega duplicado, la app lo detecta para no registrarlo dos veces.' },
    ],
    note: 'La captura automática solo está disponible en la app de Android.',
  },
  '/escanear-tickets': {
    link: 'Cómo escanear tus tickets',
    h1: 'Escanea tus tickets y facturas para registrar tus gastos',
    intro: 'Guardar tickets en la cartera no sirve de mucho. Escanéalos y conviértelos en movimientos en segundos.',
    sections: [
      { h2: 'Foto o PDF', text: 'Usa la cámara del celular o sube un PDF. La app lee el monto, la fecha y el comercio, y tú confirmas antes de guardar.' },
      { h2: 'Detalle por artículo', text: 'Si el ticket trae varios artículos, puedes dividirlo en partidas con su propia categoría.' },
      { h2: 'También estados de cuenta', text: 'Importa tu estado de cuenta y compáralo con lo que registraste para encontrar diferencias.' },
    ],
  },
  '/control-de-tarjetas-y-msi': {
    link: 'Control de tarjetas y meses sin intereses',
    h1: 'Lleva el control de tus tarjetas de crédito y meses sin intereses',
    intro: 'Registra las tarjetas que ya tienes y deja de adivinar cuánto debes, cuándo corta cada una y cuánto te falta de cada compra a meses.',
    sections: [
      { h2: 'Fechas de corte y de pago', text: 'Indica el día de corte y de pago de cada tarjeta. La app agrupa tus compras por periodo y te muestra cuánto pagar.' },
      { h2: 'Meses sin intereses mes a mes', text: 'Registra tus compras a meses y ve cuánto toca pagar en cada periodo y cuánto te falta.' },
      { h2: 'Tarjetas compartidas y adicionales', text: 'Si varias tarjetas comparten una línea de crédito, regístralas juntas para ver tu crédito disponible real.' },
    ],
  },
  '/presupuesto-personal-y-familiar': {
    link: 'Presupuesto personal y familiar',
    h1: 'Haz tu presupuesto personal o familiar y cúmplelo',
    intro: 'Saber cuánto gastas es el primer paso; ponerte un límite es el segundo.',
    sections: [
      { h2: 'Presupuestos por categoría', text: 'Define cuánto quieres gastar en comida, transporte o lo que necesites, y mira tu avance durante el mes.' },
      { h2: 'Avisos antes de pasarte', text: 'La app te avisa cuando te acercas al límite.' },
      { h2: 'Plan familiar', text: 'Invita a tu familia y comparte solo las tarjetas y los gastos que decidas. Lo demás sigue siendo privado.' },
    ],
  },
}
