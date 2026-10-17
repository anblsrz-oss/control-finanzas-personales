interface BrandLogoProps {
  logoUrl: string | null | undefined
  size?: string
  emojiSize?: string
}

// Logo de marca: usa la imagen subida en Panel Admin (app_config.logo_url) si
// existe; si no, cae al emoji 💰 por defecto. Se usa en todas las pantallas
// con marca (app, landing, login, términos/privacidad) para que cambiarlo en
// un solo lugar (Admin) lo actualice en todas partes.
export function BrandLogo({ logoUrl, size = 'h-6 w-6', emojiSize = 'text-xl' }: BrandLogoProps) {
  if (logoUrl) {
    return <img src={logoUrl} alt="" className={`inline-block shrink-0 rounded object-cover ${size}`} />
  }
  // Marca por defecto: tramo de línea con parada (no depende de la fuente de emojis).
  void emojiSize
  return (
    <svg viewBox="0 0 24 24" className={`shrink-0 text-brand-600 dark:text-brand-500 ${size}`} aria-hidden="true">
      <rect width="24" height="24" rx="6" fill="currentColor" />
      <path d="M4.5 17 H10 L14 12 H19.5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="14" cy="12" r="2.6" fill="currentColor" stroke="#fff" strokeWidth="1.8" />
    </svg>
  )
}
