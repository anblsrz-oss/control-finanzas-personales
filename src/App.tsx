import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuth } from '@/store/useAuth'
import { useAppConfig } from '@/hooks/useAppConfig'
import { applyThemeColors } from '@/lib/themeColors'
import { AppShell } from '@/components/layout/AppShell'
import { PageGuard } from '@/components/layout/PageGuard'
import { FeatureGate } from '@/components/ui/FeatureGate'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { LoginPage } from '@/features/auth/LoginPage'
import { ResetPasswordPage } from '@/features/auth/ResetPasswordPage'
import { LandingPage } from '@/features/landing/LandingPage'
import { PrivacyPolicyPage } from '@/features/legal/PrivacyPolicyPage'
import { TermsPage } from '@/features/legal/TermsPage'
import { CookiePolicyPage } from '@/features/legal/CookiePolicyPage'
import { NotFoundPage } from '@/features/legal/NotFoundPage'
import { DashboardPage } from '@/features/reports/DashboardPage'
import { NotificationsPage } from '@/features/notifications/NotificationsPage'
import { AccountsPage } from '@/features/accounts/AccountsPage'
import { CardsPage } from '@/features/cards/CardsPage'
import { CreditLinesPage } from '@/features/credit/CreditLinesPage'
import { TransactionsPage } from '@/features/transactions/TransactionsPage'
import { BudgetsPage } from '@/features/budgets/BudgetsPage'
import { SubscriptionsPage } from '@/features/subscriptions/SubscriptionsPage'
import { ImportPage } from '@/features/import/ImportPage'
import { ReceiptPage } from '@/features/receipts/ReceiptPage'
import { ReconcilePage } from '@/features/reconcile/ReconcilePage'
import { FamilyPage } from '@/features/family/FamilyPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { EmailSyncPage } from '@/features/email/EmailSyncPage'
import { SmsSyncPage } from '@/features/sms/SmsSyncPage'
import { NotificationCapturePage } from '@/features/notification-capture/NotificationCapturePage'
import { HelpFaqPage } from '@/features/help/HelpFaqPage'
import { CategoriesPage } from '@/features/categories/CategoriesPage'
import { YieldsPage } from '@/features/yields/YieldsPage'
import { ReportsPage } from '@/features/reports/ReportsPage'
import { AdminPage } from '@/features/admin/AdminPage'
import { WebUpdatePrompt } from '@/components/WebUpdatePrompt'
import { NativeUpdatePrompt } from '@/components/NativeUpdatePrompt'
import { isNative } from '@/lib/nativeAuth'

export default function App() {
  const init = useAuth((s) => s.init)
  const { data: appConfig } = useAppConfig()

  useEffect(() => {
    void init()
  }, [init])

  // Aplica los colores de tema personalizados por el admin (o los limpia si no hay).
  useEffect(() => {
    applyThemeColors(appConfig?.theme_colors ?? null)
  }, [appConfig?.theme_colors])

  // Refleja el título configurado por el admin en la pestaña del navegador.
  useEffect(() => {
    document.title = appConfig?.app_title || 'Mi Control de Finanzas Personales'
  }, [appConfig?.app_title])

  return (
    <>
      {isNative() ? <NativeUpdatePrompt /> : <WebUpdatePrompt />}
    <Routes>
      <Route path="/bienvenida" element={<PageGuard to="/bienvenida"><LandingPage /></PageGuard>} />
      <Route path="/privacidad" element={<PageGuard to="/privacidad"><PrivacyPolicyPage /></PageGuard>} />
      <Route path="/terminos" element={<PageGuard to="/terminos"><TermsPage /></PageGuard>} />
      <Route path="/cookies" element={<PageGuard to="/cookies"><CookiePolicyPage /></PageGuard>} />
      <Route path="/login" element={<PageGuard to="/login"><LoginPage /></PageGuard>} />
      <Route path="/reset-password" element={<PageGuard to="/reset-password"><ResetPasswordPage /></PageGuard>} />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/notificaciones" element={<NotificationsPage />} />
        <Route path="/cuentas" element={<PageGuard to="/cuentas"><AccountsPage /></PageGuard>} />
        <Route path="/tarjetas" element={<PageGuard to="/tarjetas"><CardsPage /></PageGuard>} />
        <Route path="/lineas-credito" element={<PageGuard to="/lineas-credito"><FeatureGate feature="credit_lines"><CreditLinesPage /></FeatureGate></PageGuard>} />
        <Route path="/transacciones" element={<PageGuard to="/transacciones"><TransactionsPage /></PageGuard>} />
        <Route path="/presupuestos" element={<PageGuard to="/presupuestos"><FeatureGate feature="budgets"><BudgetsPage /></FeatureGate></PageGuard>} />
        <Route path="/suscripciones" element={<PageGuard to="/suscripciones"><FeatureGate feature="subscriptions"><SubscriptionsPage /></FeatureGate></PageGuard>} />
        <Route path="/importar" element={<PageGuard to="/importar"><FeatureGate feature="import"><ImportPage /></FeatureGate></PageGuard>} />
        <Route path="/recibos" element={<PageGuard to="/recibos"><FeatureGate feature="receipts"><ReceiptPage /></FeatureGate></PageGuard>} />
        <Route path="/conciliacion" element={<PageGuard to="/conciliacion"><ReconcilePage /></PageGuard>} />
        <Route path="/familia" element={<PageGuard to="/familia"><FamilyPage /></PageGuard>} />
        <Route path="/configuracion" element={<SettingsPage />} />
        <Route path="/correo" element={<PageGuard to="/correo"><FeatureGate feature="email_sync"><EmailSyncPage /></FeatureGate></PageGuard>} />
        <Route path="/sms" element={<PageGuard to="/sms"><FeatureGate feature="sms_sync"><SmsSyncPage /></FeatureGate></PageGuard>} />
        <Route path="/captura-notificaciones" element={<PageGuard to="/captura-notificaciones"><FeatureGate feature="notification_capture"><NotificationCapturePage /></FeatureGate></PageGuard>} />
        <Route path="/ayuda" element={<PageGuard to="/ayuda"><HelpFaqPage /></PageGuard>} />
        <Route path="/categorias" element={<PageGuard to="/categorias"><CategoriesPage /></PageGuard>} />
        <Route path="/rendimientos" element={<PageGuard to="/rendimientos"><YieldsPage /></PageGuard>} />
        <Route path="/reportes" element={<PageGuard to="/reportes"><ReportsPage /></PageGuard>} />
        <Route path="/admin" element={<AdminPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </>
  )
}
