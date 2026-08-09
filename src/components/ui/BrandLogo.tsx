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
  return <span className={`inline-block ${emojiSize}`}>💰</span>
}
