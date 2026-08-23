import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/store/useAuth'
import type { ReportEmailPeriod } from '@/types/db'

// Actualiza la moneda principal del usuario. La política profiles_update_own
// permite editar el propio perfil; el trigger protect_profile_privileged_cols
// impide tocar is_premium/is_admin. Tras guardar, refresca el perfil en el store.
export function useUpdateMainCurrency() {
  const refreshProfile = useAuth((s) => s.refreshProfile)
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { userId: string; mainCurrency: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ main_currency: input.mainCurrency })
        .eq('id', input.userId)
      if (error) throw error

      // Los presupuestos se crean en la moneda principal y su consumo se
      // calcula contra base_amount, que está convertido a esa misma moneda.
      // Si la principal cambia y los presupuestos se quedaran atrás, el
      // cálculo dejaría de cuadrar. Se arrastran con ella.
      const { error: budgetError } = await supabase
        .from('budgets')
        .update({ currency: input.mainCurrency })
        .eq('user_id', input.userId)
      if (budgetError) throw budgetError
    },
    onSuccess: async (_data, input) => {
      await refreshProfile()
      queryClient.invalidateQueries({ queryKey: ['budgets', input.userId] })
      queryClient.invalidateQueries({ queryKey: ['budget_status', input.userId] })
    },
  })
}

// Opt-in al aviso por correo. El envío lo hace un cron diario (Edge Function
// budget-alerts-email); aquí solo se guarda la preferencia.
export function useUpdateBudgetAlertsEmail() {
  const refreshProfile = useAuth((s) => s.refreshProfile)
  return useMutation({
    mutationFn: async (input: { userId: string; enabled: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ budget_alerts_email: input.enabled })
        .eq('id', input.userId)
      if (error) throw error
    },
    onSuccess: async () => {
      await refreshProfile()
    },
  })
}

// Opt-in a los recordatorios de próximo cobro de suscripción en Google
// Calendar. La conexión misma (useEnableGoogleCalendar) ya es un
// consentimiento; este toggle deja apagar ESTE tipo de recordatorio sin
// desconectar Calendar entero (ver también calendar_card_payment_reminders).
export function useUpdateCalendarSubscriptionReminders() {
  const refreshProfile = useAuth((s) => s.refreshProfile)
  return useMutation({
    mutationFn: async (input: { userId: string; enabled: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ calendar_subscription_reminders: input.enabled })
        .eq('id', input.userId)
      if (error) throw error
    },
    onSuccess: async () => {
      await refreshProfile()
    },
  })
}

// Opt-in a los recordatorios de pago de tarjeta/MSI en Google Calendar.
export function useUpdateCalendarCardPaymentReminders() {
  const refreshProfile = useAuth((s) => s.refreshProfile)
  return useMutation({
    mutationFn: async (input: { userId: string; enabled: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ calendar_card_payment_reminders: input.enabled })
        .eq('id', input.userId)
      if (error) throw error
    },
    onSuccess: async () => {
      await refreshProfile()
    },
  })
}

// Preferencias del reporte financiero periódico por correo (report-emails).
// El envío lo hace un cron diario que decide, por usuario, si hoy toca según
// esta configuración (ver pending_report_emails en 0058_report_emails.sql).
export interface ReportEmailSettings {
  enabled: boolean
  period: ReportEmailPeriod | null
  customDays: number | null
  weekday: number | null
  dayOfMonth: number | null
}

export function useUpdateReportEmailSettings() {
  const refreshProfile = useAuth((s) => s.refreshProfile)
  return useMutation({
    mutationFn: async (input: { userId: string } & ReportEmailSettings) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          report_email_enabled: input.enabled,
          report_email_period: input.period,
          report_email_custom_days: input.customDays,
          report_email_weekday: input.weekday,
          report_email_day_of_month: input.dayOfMonth,
        })
        .eq('id', input.userId)
      if (error) throw error
    },
    onSuccess: async () => {
      await refreshProfile()
    },
  })
}

// Tutorial guiado: marca (o reinicia, desde Configuración) has_seen_tutorial.
export function useMarkTutorialSeen() {
  const refreshProfile = useAuth((s) => s.refreshProfile)
  return useMutation({
    mutationFn: async (input: { userId: string; seen: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ has_seen_tutorial: input.seen })
        .eq('id', input.userId)
      if (error) throw error
    },
    onSuccess: async () => {
      await refreshProfile()
    },
  })
}

// Umbral de aviso por defecto para los presupuestos que no definen el suyo.
export function useUpdateBudgetAlertThreshold() {
  const refreshProfile = useAuth((s) => s.refreshProfile)
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { userId: string; threshold: number }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ budget_alert_threshold: input.threshold })
        .eq('id', input.userId)
      if (error) throw error
    },
    onSuccess: async (_data, input) => {
      await refreshProfile()
      // El umbral efectivo se calcula en servidor: hay que releer el estado.
      queryClient.invalidateQueries({ queryKey: ['budget_status', input.userId] })
    },
  })
}
