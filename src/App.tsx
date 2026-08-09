import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/store/useAuth'
import { useAppConfig } from '@/hooks/useAppConfig'
import { applyThemeColors } from '@/lib/themeColors'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { LoginPage } from '@/features/auth/LoginPage'
import { ResetPasswordPage } from '@/features/auth/ResetPasswordPage'
import { LandingPage } from '@/features/landing/LandingPage'
import { PrivacyPolicyPage } from '@/features/legal/PrivacyPolicyPage'
import { TermsPage } from '@/features/legal/TermsPage'
import { DashboardPage } from '@/features/reports/DashboardPage'
import { AccountsPage } from '@/features/accounts/AccountsPage'
import { CardsPage } from '@/features/cards/CardsPage'
import { CreditLinesPage } from '@/features/credit/CreditLinesPage'
import { TransactionsPage } from '@/features/transactions/TransactionsPage'
import { BudgetsPage } from '@/features/budgets/BudgetsPage'
import { ImportPage } from '@/features/import/ImportPage'
import { ReceiptPage } from '@/features/receipts/ReceiptPage'
import { FamilyPage } from '@/features/family/FamilyPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { EmailSyncPage } from '@/features/email/EmailSyncPage'
import { SmsSyncPage } from '@/features/sms/SmsSyncPage'
import { ConnectBankPage } from '@/features/connect/ConnectBankPage'
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
      <Route path="/bienvenida" element={<LandingPage />} />
      <Route path="/privacidad" element={<PrivacyPolicyPage />} />
      <Route path="/terminos" element={<TermsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/cuentas" element={<AccountsPage />} />
        <Route path="/tarjetas" element={<CardsPage />} />
        <Route path="/lineas-credito" element={<CreditLinesPage />} />
        <Route path="/transacciones" element={<TransactionsPage />} />
        <Route path="/presupuestos" element={<BudgetsPage />} />
        <Route path="/importar" element={<ImportPage />} />
        <Route path="/recibos" element={<ReceiptPage />} />
        <Route path="/familia" element={<FamilyPage />} />
        <Route path="/configuracion" element={<SettingsPage />} />
        <Route path="/correo" element={<EmailSyncPage />} />
        <Route path="/sms" element={<SmsSyncPage />} />
        <Route path="/conectar" element={<ConnectBankPage />} />
        <Route path="/categorias" element={<CategoriesPage />} />
        <Route path="/rendimientos" element={<YieldsPage />} />
        <Route path="/reportes" element={<ReportsPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}
