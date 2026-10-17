import {
  LayoutDashboard, Landmark, CreditCard, Layers, ArrowLeftRight, Target, Repeat, Download,
  ScanLine, Scale, Users, Mail, Smartphone, Bell, Tag, TrendingUp, FileBarChart, CircleHelp,
  Settings, Wrench, Ellipsis, Eye, EyeOff, DownloadCloud, Sparkles, type LucideIcon,
} from 'lucide-react'

// Un icono de trazo por ruta, en lugar de emojis del sistema (que cambian por dispositivo).
const ICONS: Record<string, LucideIcon> = {
  '/': LayoutDashboard,
  '/cuentas': Landmark,
  '/tarjetas': CreditCard,
  '/lineas-credito': Layers,
  '/transacciones': ArrowLeftRight,
  '/presupuestos': Target,
  '/suscripciones': Repeat,
  '/importar': Download,
  '/recibos': ScanLine,
  '/conciliacion': Scale,
  '/familia': Users,
  '/correo': Mail,
  '/sms': Smartphone,
  '/captura-notificaciones': Bell,
  '/categorias': Tag,
  '/rendimientos': TrendingUp,
  '/reportes': FileBarChart,
  '/ayuda': CircleHelp,
  '/configuracion': Settings,
  '/admin': Wrench,
  '/suscripcion': Sparkles,
  welcome: Sparkles,
  more: Ellipsis,
  eye: Eye,
  'eye-off': EyeOff,
  apk: DownloadCloud,
}

export function NavIcon({ to, className = 'h-5 w-5' }: { to: string; className?: string }) {
  const Icon = ICONS[to] ?? CircleHelp
  return <Icon className={className} strokeWidth={1.9} aria-hidden="true" />
}
