// Tipos de las tablas/vistas de Supabase (definidos a mano; en el futuro se pueden
// generar con `supabase gen types typescript`).

export type AccountType = 'checking' | 'savings' | 'investment' | 'cash' | 'voucher'
export type CardType = 'credit' | 'debit' | 'voucher'
export type TxKind = 'income' | 'expense' | 'transfer' | 'card_payment' | 'refund'
export type CategoryKind = 'income' | 'expense'
export type TxSource = 'manual' | 'import' | 'email' | 'sms' | 'aggregator' | 'receipt'
export type IngestChannel = 'csv' | 'pdf' | 'email' | 'sms'
export type ImportStatus = 'parsing' | 'staged' | 'confirmed' | 'failed'
export type StagingStatus = 'pending' | 'confirmed' | 'discarded' | 'duplicate'

export interface ProfileRow {
  id: string
  email: string | null
  full_name: string | null
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  is_premium: boolean
  is_admin: boolean
  main_currency: string
  /** Umbral de aviso por defecto (1-100) para presupuestos sin umbral propio. */
  budget_alert_threshold: number
  /** Opt-in al resumen diario por correo. Apagado por defecto. */
  budget_alerts_email: boolean
  /** Opt-in a los avisos de suscripciones por correo. Apagado por defecto. */
  subscription_alerts_email: boolean
  /** Opt-in a los recordatorios de suscripción en Google Calendar. Encendido por defecto (la conexión misma ya es el consentimiento). */
  calendar_subscription_reminders: boolean
  /** Opt-in a los recordatorios de pago de tarjeta/MSI en Google Calendar. */
  calendar_card_payment_reminders: boolean
  /** Opt-in al reporte financiero periódico por correo. Apagado por defecto. */
  report_email_enabled: boolean
  report_email_period: ReportEmailPeriod | null
  /** Días entre envíos, solo si report_email_period = 'custom'. */
  report_email_custom_days: number | null
  /** Día de la semana (0=domingo) de envío, para weekly/biweekly. */
  report_email_weekday: number | null
  /** Día del mes (1-28) de envío, para monthly/quarterly. */
  report_email_day_of_month: number | null
  report_email_last_sent_at: string | null
  /** Si ya vio el recorrido guiado inicial (una vez por cuenta, no por dispositivo). */
  has_seen_tutorial: boolean
  created_at: string
}

export type ReportEmailPeriod = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'custom'

export interface AccountRow {
  id: string
  user_id: string
  name: string
  bank_name: string | null
  /** CLABE completa (18 dígitos), opcional. Solo se usa para mostrarla al usuario. */
  clabe: string | null
  /** Últimos 4 dígitos de la CLABE. Es lo único que leen los edge functions para el matching automático. */
  account_last4: string | null
  /** Número de cuenta del banco (distinto de la CLABE), opcional. Solo se usa para mostrarlo al usuario. */
  account_number: string | null
  /** Últimos 4 dígitos del número de cuenta. No coinciden con los de la CLABE (esta trae un dígito verificador al final). */
  account_number_last4: string | null
  type: AccountType
  currency: string
  initial_balance: number
  has_yield: boolean
  yield_rate: number | null
  /** Si yield_rate se capturó como tasa mensual o anual (como la publica el banco). */
  yield_rate_period: 'monthly' | 'annual'
  /** A la vista (paga cada mes) o a plazo fijo (paga al vencimiento). */
  yield_kind: 'demand' | 'term'
  yield_term_days: number | null
  yield_term_end: string | null
  withhold_isr: boolean
  /** Tasa anual de retención sobre el capital (la fija la Ley de Ingresos). */
  isr_rate: number | null
  is_scholarship: boolean
  scholarship_name: string | null
  created_at: string
}

export interface CreditLineRow {
  id: string
  user_id: string
  name: string
  bank_name: string | null
  credit_limit: number
  currency: string
  cut_day: number | null
  payment_day: number | null
  dates_may_shift: boolean
  created_at: string
}

export interface CreditLinePeriodRow {
  id: string
  user_id: string
  credit_line_id: string
  /** Primer día del mes del corte. */
  period_month: string
  cut_date: string
  payment_date: string
  confirmed: boolean
  /** Saldo real confirmado contra el estado de cuenta ("a pagar" de ese periodo). Null si no se ha confirmado. */
  confirmed_balance: number | null
  created_at: string
}

export interface CreditLineUsageRow {
  credit_line_id: string
  user_id: string
  name: string
  currency: string
  credit_limit: number
  used: number
  available: number
}

export interface CardRow {
  id: string
  user_id: string
  name: string
  brand: string | null
  bank_name: string | null
  type: CardType
  /** Físico o virtual; independiente de crédito/débito. */
  card_format: 'physical' | 'virtual'
  currency: string
  account_id: string | null
  credit_line_id: string | null
  // Legado: el límite y las fechas viven ahora en credit_lines. Se conservan
  // por si hay que revertir, pero el frontend ya no los lee.
  credit_limit: number | null
  cut_day: number | null
  payment_day: number | null
  last4: string | null
  color: string | null
  has_cashback: boolean
  is_scholarship: boolean
  scholarship_name: string | null
  created_at: string
}

export interface CategoryRow {
  id: string
  user_id: string | null
  name: string
  kind: CategoryKind
  icon: string | null
  color: string | null
  is_system: boolean
  created_at: string
}

export interface TransactionRow {
  id: string
  user_id: string
  kind: TxKind
  amount: number
  currency: string
  fx_rate: number | null
  base_amount: number | null
  concept: string | null
  category_id: string | null
  account_id: string | null
  to_account_id: string | null
  card_id: string | null
  /** Pago de tarjeta: línea de crédito a la que se abona. */
  to_credit_line_id: string | null
  /** Transferencia cuya cuenta destino no es del usuario (cuenta como egreso). */
  is_external: boolean
  tx_date: string
  notes: string | null
  source: TxSource
  external_id: string | null
  pending: boolean
  raw_ref: string | null
  family_id: string | null
  /** Suscripción recurrente a la que quedó vinculado este cargo, si la hay. */
  subscription_id: string | null
  /** Compra original que este reembolso cancela parcial o totalmente. */
  refund_of_transaction_id: string | null
  created_at: string
}

export interface InstallmentPlanPaymentRow {
  id: string
  user_id: string
  plan_id: string
  /** Primer día del mes de la mensualidad. */
  period_month: string
  amount: number
  paid: boolean
  paid_at: string
  created_at: string
}

// Plan familiar
export type FamilyMemberStatus = 'pending' | 'accepted' | 'rejected'

export interface FamilyRow {
  id: string
  owner_id: string
  name: string
  created_at: string
}

export interface FamilyMemberRow {
  id: string
  family_id: string
  user_id: string | null
  invited_email: string
  status: FamilyMemberStatus
  invited_at: string
  responded_at: string | null
}

export interface FamilySharedCardRow {
  id: string
  family_id: string
  card_id: string
  created_at: string
}

// Vista family_cards: lo que un miembro puede ver de una tarjeta compartida.
// A propósito NO tiene credit_limit/cut_day/payment_day.
export interface FamilyCardRow {
  family_id: string
  card_id: string
  name: string
  brand: string | null
  type: CardType
  currency: string
  owner_id: string
}

export interface FamilyCardUsageRow {
  family_id: string
  card_id: string
  name: string
  currency: string
  family_spent: number
}

export interface FamilyMemberProfileRow {
  family_id: string
  member_id: string
  user_id: string | null
  invited_email: string
  status: FamilyMemberStatus
  full_name: string | null
  avatar_url: string | null
}

export interface InstallmentPlanRow {
  id: string
  user_id: string
  card_id: string | null
  transaction_id: string | null
  description: string | null
  total_amount: number
  currency: string
  months: number
  is_interest_free: boolean
  interest_amount: number
  monthly_payment: number
  start_date: string
  /** Si la compra se reembolsó por completo, cuándo se canceló el plan. */
  cancelled_at: string | null
  created_at: string
}

export interface YieldRecordRow {
  id: string
  user_id: string
  account_id: string
  period_month: string
  expected_growth: number | null
  actual_growth: number | null
  verified: boolean
  created_at: string
}

// Ingesta de movimientos (Fase 8)
export interface StatementImportRow {
  id: string
  user_id: string
  account_id: string | null
  bank_name: string | null
  channel: IngestChannel
  file_name: string | null
  status: ImportStatus
  total_rows: number
  imported_rows: number
  created_at: string
}

export interface ImportStagingRow {
  id: string
  user_id: string
  import_id: string | null
  tx_date: string | null
  amount: number | null
  kind: TxKind | null
  concept: string | null
  category_id: string | null
  account_id: string | null
  card_id: string | null
  external_id: string | null
  raw_text: string | null
  status: StagingStatus
  created_at: string
}

export interface ParsingRuleRow {
  id: string
  user_id: string
  bank_name: string
  channel: IngestChannel
  config: ParsingRuleConfig
  created_at: string
}

// Config de una regla de parseo. Para CSV: mapeo de columnas (por índice o
// nombre de encabezado). Para email/sms: remitentes y regex de extracción.
export interface ParsingRuleConfig {
  // CSV
  columns?: {
    date?: string | number
    amount?: string | number
    concept?: string | number
    // columnas separadas de cargo/abono (algunos bancos las separan)
    debit?: string | number
    credit?: string | number
  }
  dateFormat?: string // ej. 'DD/MM/YYYY'
  hasHeader?: boolean
  decimalSeparator?: '.' | ','
  // email / sms
  senders?: string[]
  amountRegex?: string
  conceptRegex?: string
  dateRegex?: string
  // Moneda fija (ej. 'MXN', 'USD') o regex que la extrae (grupo 1). Si no se
  // define ninguna, la Edge Function usa MXN por compatibilidad.
  currency?: string
  currencyRegex?: string
  // Tipo de movimiento a crear. Por defecto 'expense'. Útil para remitentes de
  // ingresos (nómina, reembolsos) o proveedores.
  kind?: 'income' | 'expense'
  // Detección de dirección para SMS (channel='sms'). Si el cuerpo del SMS hace
  // match con alguna de incomeKeywords => 'income'; si no, 'expense'. Si no se
  // definen, la Edge Function usa listas por defecto en español. Útil para que
  // las transferencias recibidas entren como ingreso y las compras como gasto.
  incomeKeywords?: string[]
  expenseKeywords?: string[]
  // Regex que extrae la terminación (4 dígitos) de la tarjeta del correo. Se
  // cruza con cards.last4 para asignar la tarjeta/cuenta automáticamente.
  last4Regex?: string
  // Cuenta a usar cuando el correo no trae ninguna terminación de
  // tarjeta/cuenta (ej. pagos vía wallet de un gateway como EBANX/Xsolla).
  defaultAccountId?: string
  // Categoría fija para este remitente (ej. PlayStation Store -> Videojuegos).
  // Gana siempre sobre la categoría adivinada por texto.
  categoryId?: string
}

export interface TransactionDeletionRow {
  id: string
  user_id: string
  transaction_id: string
  kind: TxKind | null
  amount: number | null
  currency: string | null
  concept: string | null
  account_id: string | null
  to_account_id: string | null
  card_id: string | null
  tx_date: string | null
  source: TxSource | null
  reason: string
  snapshot: Record<string, unknown> | null
  deleted_at: string
}

export interface BankConnectionRow {
  id: string
  user_id: string
  provider: string
  external_id: string | null
  institution: string | null
  status: 'pending' | 'active' | 'error' | 'revoked'
  last_sync_at: string | null
  created_at: string
}

// Configuración global (una sola fila). Editable por admin.
export interface AppConfigRow {
  id: boolean
  free_max_accounts: number
  free_max_cards: number
  free_max_transactions: number
  family_is_premium: boolean
  yields_is_premium: boolean
  installments_is_premium: boolean
  reports_filters_is_premium: boolean
  dashboard_period_filter_is_premium: boolean
  transactions_period_filter_is_premium: boolean
  budgets_is_premium: boolean
  free_max_budgets: number
  // Colores de tema personalizados (null = tema por defecto). Ver ThemeColors.
  theme_colors: import('@/lib/themeColors').ThemeColors | null
  // Marca configurable (null = usar los valores por defecto de la app).
  app_title: string | null
  logo_url: string | null
  // Orden de páginas del sidebar/menú "Más" y del tutorial (null = orden por defecto). Ver lib/pageOrder.ts.
  page_order: string[] | null
  updated_at: string
}

// Presupuestos ------------------------------------------------------------

export type BudgetPeriod = 'daily' | 'weekly' | 'biweekly' | 'monthly'
export type BudgetStatus = 'ok' | 'warn' | 'over'
export type BudgetAlertLevel = 'warn' | 'over'

export interface BudgetRow {
  id: string
  user_id: string
  /** null = presupuesto general (todas las categorías de gasto). */
  category_id: string | null
  amount: number
  currency: string
  period: BudgetPeriod
  /** Reservado para periodos anclados; hoy el cálculo usa calendario fijo. */
  anchor_day: number | null
  /** null = hereda profiles.budget_alert_threshold. */
  alert_threshold: number | null
  is_active: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface BudgetAlertRow {
  id: string
  user_id: string
  budget_id: string
  period_start: string
  level: BudgetAlertLevel
  percent: number
  spent: number
  amount: number
  notified_in_app: boolean
  notified_email: boolean
  notified_push: boolean
  read_at: string | null
  created_at: string
}

// Vistas calculadas
export interface AccountBalanceRow {
  account_id: string
  user_id: string
  name: string
  currency: string
  current_balance: number
}

export interface CardUsageRow {
  card_id: string
  user_id: string
  name: string
  currency: string
  credit_limit: number | null
  used: number
  available: number
}

/** Fila de budget_status_at(): estado calculado en servidor, nunca en cliente. */
export interface BudgetStatusRow {
  budget_id: string
  user_id: string
  category_id: string | null
  /** null = presupuesto general. */
  category_name: string | null
  category_icon: string | null
  category_color: string | null
  period: BudgetPeriod
  period_start: string
  period_end: string
  amount: number
  currency: string
  /** Gasto confirmado del periodo (pending = false). Es el que dispara avisos. */
  spent: number
  /** Gasto por confirmar: informativo, no dispara avisos. */
  spent_pending: number
  remaining: number
  /** Sin capar: puede pasar de 100. */
  percent: number | null
  /** Umbral efectivo: el del presupuesto o, si no tiene, el del perfil. */
  alert_threshold: number
  status: BudgetStatus
}

// Suscripciones recurrentes ------------------------------------------------

export type SubscriptionStatus = 'suggested' | 'active' | 'paused' | 'cancelled' | 'ignored'
export type SubscriptionBillingCycle = 'weekly' | 'monthly' | 'yearly'
export type SubscriptionDetectionSource = 'catalog' | 'heuristic' | 'manual'
export type SubscriptionAlertKind = 'upcoming_charge' | 'price_change'

export interface SubscriptionRow {
  id: string
  user_id: string
  card_id: string | null
  account_id: string | null
  category_id: string | null
  /** Clave estable del comercio: la del catálogo ('netflix', …) o 'generic:<hash>'. */
  merchant_key: string
  name: string
  icon: string | null
  amount: number
  currency: string
  billing_cycle: SubscriptionBillingCycle
  next_charge_date: string | null
  status: SubscriptionStatus
  detection_source: SubscriptionDetectionSource
  last_transaction_id: string | null
  confirmed_at: string | null
  created_at: string
  updated_at: string
}

export interface SubscriptionAlertRow {
  id: string
  user_id: string
  subscription_id: string
  kind: SubscriptionAlertKind
  dedupe_key: string
  old_amount: number | null
  new_amount: number
  currency: string
  charge_date: string | null
  notified_in_app: boolean
  notified_email: boolean
  notified_push: boolean
  notified_calendar: boolean
  calendar_event_id: string | null
  read_at: string | null
  created_at: string
}

export type CardPaymentAlertKind = 'card_due' | 'msi_due'

export interface CardPaymentAlertRow {
  id: string
  user_id: string
  card_id: string | null
  credit_line_id: string | null
  installment_plan_id: string | null
  kind: CardPaymentAlertKind
  dedupe_key: string
  due_date: string
  amount: number | null
  currency: string
  notified_in_app: boolean
  notified_calendar: boolean
  calendar_event_id: string | null
  read_at: string | null
  created_at: string
}
