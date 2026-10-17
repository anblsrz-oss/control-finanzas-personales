import { useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/Card'
import { LinesDiagram } from '@/components/ui/LinesDiagram'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { supabase } from '@/lib/supabase'
import { signInWithGoogle, isNative } from '@/lib/nativeAuth'
import { useAuth } from '@/store/useAuth'
import { useAppConfig } from '@/hooks/useAppConfig'
import { useLocalePath } from '@/hooks/useLocalePath'

// Login con tres opciones:
// - Google (OAuth, adaptado a web/nativo en nativeAuth).
// - Correo + contraseña (registro con nombre/apellido, inicio de sesión y
//   recuperación de contraseña) vía Supabase Auth.
// - Código de 6 dígitos a cualquier correo (OTP) como alternativa sin contraseña.

type Method = 'password' | 'otp'
type PwMode = 'signin' | 'signup' | 'forgot'
type OtpStep = 'email' | 'code'

export function LoginPage() {
  const { t } = useTranslation()
  const lp = useLocalePath()
  const { session } = useAuth()
  const { data: appConfig } = useAppConfig()
  const [searchParams] = useSearchParams()
  // La landing enlaza a /login?mode=signup para abrir directo el registro.
  const [method, setMethod] = useState<Method>('password')
  const [pwMode, setPwMode] = useState<PwMode>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'signin',
  )
  const [otpStep, setOtpStep] = useState<OtpStep>('email')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [code, setCode] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  // Si ya hay sesión (p. ej. tras iniciar sesión o verificar el código), salir.
  // Si venía de un plan de la landing (/login?mode=signup&plan=…), se pasa a
  // Suscripción, que arranca el checkout de ese plan.
  if (session) {
    const plan = searchParams.get('plan')
    const to = plan === 'monthly' || plan === 'yearly'
      ? `/suscripcion?plan=${plan}`
      : '/'
    return <Navigate to={to} replace />
  }

  function resetFeedback() {
    setError(null)
    setInfo(null)
  }

  async function handleSignUp() {
    const normalized = email.trim().toLowerCase()
    if (!firstName.trim() || !lastName.trim()) {
      setError(t('Escribe tu nombre y apellido.'))
      return
    }
    if (!normalized) {
      setError(t('Escribe tu correo.'))
      return
    }
    if (password.length < 8) {
      setError(t('La contraseña debe tener al menos 8 caracteres.'))
      return
    }
    setLoading(true)
    resetFeedback()
    const first = firstName.trim()
    const last = lastName.trim()
    const { data, error: err } = await supabase.auth.signUp({
      email: normalized,
      password,
      options: {
        data: {
          first_name: first,
          last_name: last,
          full_name: `${first} ${last}`,
        },
      },
    })
    setLoading(false)
    if (err) {
      // Supabase puede responder "User already registered" en algunos casos.
      setError(
        /already registered|already exists/i.test(err.message)
          ? t('Este correo ya tiene una cuenta. Inicia sesión o usa "¿Olvidaste tu contraseña?".')
          : err.message,
      )
      return
    }
    // Para no filtrar qué correos existen, Supabase devuelve un usuario sin
    // identidades (identities: []) cuando el correo YA está registrado, en vez
    // de un error. Lo detectamos y guiamos a iniciar sesión / recuperar.
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      setError(
        t('Este correo ya tiene una cuenta. Inicia sesión o usa "¿Olvidaste tu contraseña?".'),
      )
      return
    }
    // Con confirmación de correo activada no hay sesión hasta confirmar: se
    // envía un enlace de verificación (que vence) al correo indicado.
    if (!data.session) {
      setInfo(
        t('Te enviamos un correo a {{email}} para confirmar que es tuyo. Abre el enlace para activar tu cuenta.', {
          email: normalized,
        }),
      )
      return
    }
    // Si sí hay sesión (confirmación desactivada), el <Navigate> redirige.
  }

  async function handleSignIn() {
    const normalized = email.trim().toLowerCase()
    if (!normalized || !password) {
      setError(t('Escribe tu correo y contraseña.'))
      return
    }
    setLoading(true)
    resetFeedback()
    const { error: err } = await supabase.auth.signInWithPassword({
      email: normalized,
      password,
    })
    setLoading(false)
    if (err) {
      setError(t('Correo o contraseña incorrectos.'))
      return
    }
    // onAuthStateChange (useAuth) carga la sesión y el <Navigate> redirige.
  }

  async function handleForgot() {
    const normalized = email.trim().toLowerCase()
    if (!normalized) {
      setError(t('Escribe tu correo.'))
      return
    }
    setLoading(true)
    resetFeedback()
    const { error: err } = await supabase.auth.resetPasswordForEmail(normalized, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (err) {
      setError(err.message)
      return
    }
    setInfo(
      t('Te enviamos un enlace a {{email}} para restablecer tu contraseña.', {
        email: normalized,
      }),
    )
  }

  async function sendCode() {
    const normalized = email.trim().toLowerCase()
    if (!normalized) {
      setError(t('Escribe tu correo.'))
      return
    }
    setLoading(true)
    resetFeedback()
    const { error: err } = await supabase.auth.signInWithOtp({
      email: normalized,
      options: { shouldCreateUser: true },
    })
    setLoading(false)
    if (err) {
      setError(err.message)
      return
    }
    setEmail(normalized)
    setOtpStep('code')
    setInfo(t('Te enviamos un código de acceso a {{email}}.', { email: normalized }))
  }

  async function verifyCode() {
    const token = code.trim()
    if (token.length < 6) {
      setError(t('Escribe el código completo que te llegó al correo.'))
      return
    }
    setLoading(true)
    setError(null)
    const { error: err } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    })
    setLoading(false)
    if (err) {
      setError(t('Código incorrecto o expirado. Intenta de nuevo.'))
      return
    }
    // onAuthStateChange (useAuth) cargará la sesión y el <Navigate> redirige.
  }

  function switchMethod(next: Method) {
    setMethod(next)
    resetFeedback()
  }

  function switchPwMode(next: PwMode) {
    setPwMode(next)
    resetFeedback()
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas md:flex-row">
      {/* Panel de marca: esmalte medianoche, un tono más claro que la página para separarse en oscuro */}
      <aside className="flex flex-col bg-[rgb(13_21_50)] px-6 py-6 text-white md:min-h-screen md:w-1/2 md:px-12 md:py-10">
        <div className="flex items-center gap-2">
          <BrandLogo logoUrl={appConfig?.logo_url} size="h-8 w-8" />
          <span className="text-sm font-bold">Mi Control de Finanzas Personales</span>
        </div>
        <div className="hidden flex-1 flex-col justify-center gap-8 md:flex">
          <LinesDiagram className="w-full max-w-lg" />
          <div className="max-w-md">
            <p className="text-balance text-4xl font-bold leading-[1.05] tracking-tight">
              {t('Tu dinero, en un mapa claro')}
            </p>
            <ul className="mt-6 space-y-3 text-base text-white/75">
              {[
                t('Tus movimientos se registran solos desde correos y notificaciones.'),
                t('Tarjetas, meses sin intereses y rendimientos explicados.'),
                t('Todas tus cuentas en un solo lugar.'),
              ].map((text) => (
                <li key={text} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-line-green" strokeWidth={2.6} aria-hidden="true" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      <main className="flex flex-1 items-center justify-center p-6">
      <Card className="enter w-full max-w-sm text-center">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{t('Entra a tu cuenta')}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t('Organiza tus ingresos, gastos y cuentas en un solo lugar.')}
        </p>

        {/* Estilo estándar de "continuar con proveedor": píldora blanca, logo a color. */}
        <button
          type="button"
          onClick={signInWithGoogle}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition-[background-color,transform] duration-150 hover:bg-slate-50 active:scale-[0.98] dark:border-slate-600"
        >
          <svg viewBox="0 0 48 48" className="h-5 w-5 shrink-0" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.99 23.99 0 0 0 0 24c0 3.77.9 7.35 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          {t('Continuar con Google')}
        </button>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          <span className="text-xs text-slate-400 dark:text-slate-500">{t('o con tu correo')}</span>
          <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Selector de método */}
        <div className="mb-4 flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 text-sm">
          <button
            type="button"
            onClick={() => switchMethod('password')}
            className={`flex-1 rounded-md px-3 py-1.5 font-medium transition-colors ${
              method === 'password'
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {t('Contraseña')}
          </button>
          <button
            type="button"
            onClick={() => switchMethod('otp')}
            className={`flex-1 rounded-md px-3 py-1.5 font-medium transition-colors ${
              method === 'otp'
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {t('Código')}
          </button>
        </div>

        {method === 'password' && (
          <div className="space-y-3 text-left">
            {pwMode === 'signup' && (
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label={t('Nombre')}
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <Input
                  label={t('Apellido')}
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            )}

            <Input
              type="email"
              label={t('Correo')}
              autoComplete="email"
              placeholder={t('tucorreo@ejemplo.com')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {pwMode !== 'forgot' && (
              <Input
                type="password"
                label={t('Contraseña')}
                autoComplete={pwMode === 'signup' ? 'new-password' : 'current-password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    void (pwMode === 'signup' ? handleSignUp() : handleSignIn())
                  }
                }}
              />
            )}

            {pwMode === 'signin' && (
              <>
                <Button className="w-full" onClick={handleSignIn} disabled={loading}>
                  {loading ? t('Entrando…') : t('Iniciar sesión')}
                </Button>
                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    className="text-slate-500 dark:text-slate-400 underline"
                    onClick={() => switchPwMode('forgot')}
                  >
                    {t('¿Olvidaste tu contraseña?')}
                  </button>
                  <button
                    type="button"
                    className="text-brand-700 dark:text-brand-500 underline"
                    onClick={() => switchPwMode('signup')}
                  >
                    {t('Crear cuenta')}
                  </button>
                </div>
              </>
            )}

            {pwMode === 'signup' && (
              <>
                <Button className="w-full" onClick={handleSignUp} disabled={loading}>
                  {loading ? t('Creando cuenta…') : t('Crear cuenta')}
                </Button>
                <button
                  type="button"
                  className="w-full text-center text-xs text-slate-500 dark:text-slate-400 underline"
                  onClick={() => switchPwMode('signin')}
                >
                  {t('Ya tengo cuenta, iniciar sesión')}
                </button>
              </>
            )}

            {pwMode === 'forgot' && (
              <>
                <Button className="w-full" onClick={handleForgot} disabled={loading}>
                  {loading ? t('Enviando…') : t('Enviar enlace de recuperación')}
                </Button>
                <button
                  type="button"
                  className="w-full text-center text-xs text-slate-500 dark:text-slate-400 underline"
                  onClick={() => switchPwMode('signin')}
                >
                  {t('← Volver a iniciar sesión')}
                </button>
              </>
            )}
          </div>
        )}

        {method === 'otp' && (
          <>
            {otpStep === 'email' ? (
              <div className="space-y-3 text-left">
                <Input
                  type="email"
                  label={t('Correo')}
                  autoComplete="email"
                  placeholder={t('tucorreo@ejemplo.com')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void sendCode()
                  }}
                />
                <Button className="w-full" onClick={sendCode} disabled={loading}>
                  {loading ? t('Enviando…') : t('Enviar código')}
                </Button>
              </div>
            ) : (
              <div className="space-y-3 text-left">
                <Input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={10}
                  placeholder="12345678"
                  className="text-center text-lg tracking-[0.4em]"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void verifyCode()
                  }}
                />
                <Button className="w-full" onClick={verifyCode} disabled={loading}>
                  {loading ? t('Verificando…') : t('Verificar y entrar')}
                </Button>
                <button
                  type="button"
                  className="w-full text-center text-xs text-slate-400 dark:text-slate-500 underline"
                  onClick={() => {
                    setOtpStep('email')
                    setCode('')
                    resetFeedback()
                  }}
                >
                  {t('Usar otro correo')}
                </button>
              </div>
            )}
          </>
        )}

        {info && <p className="mt-3 text-xs text-brand-700 dark:text-brand-500">{info}</p>}
        {error && <p className="mt-3 text-xs text-line-scarlet">{error}</p>}

        <div className="mt-5 border-t border-slate-100 dark:border-slate-700 pt-4">
          <Link
            to={isNative() ? '/inicio' : lp('/')}
            className="text-xs text-slate-400 dark:text-slate-500 underline"
          >
            {t('← Volver al inicio')}
          </Link>
        </div>

        <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
          {t('Al continuar aceptas nuestros')}{' '}
          <Link to={lp('/terminos')} className="underline">
            {t('Términos y Condiciones')}
          </Link>{' '}
          {t('y nuestra')}{' '}
          <Link to={lp('/privacidad')} className="underline">
            {t('Política de Privacidad')}
          </Link>
          .
        </p>
      </Card>
      </main>
    </div>
  )
}
