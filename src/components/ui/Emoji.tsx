import emojiCodepoints from '../../data/emojiCodepoints.json'

const CODEPOINTS: Record<string, string> = emojiCodepoints

interface EmojiProps {
  emoji?: string | null
  className?: string
}

// Renderiza emojis como SVG de Twemoji (public/emoji/, generado con
// `npm run emoji:sync`) para verse igual en todas las plataformas en vez de
// depender de la fuente nativa del sistema. Si el emoji no está en el
// catálogo (p. ej. uno guardado antes de este cambio) cae al glifo nativo.
export function Emoji({ emoji, className }: EmojiProps) {
  if (!emoji) return null
  const codepoint = CODEPOINTS[emoji]
  if (!codepoint) {
    return <span className={className}>{emoji}</span>
  }
  return (
    <img
      src={`/emoji/${codepoint}.svg`}
      alt={emoji}
      draggable={false}
      className={`inline-block h-[1em] w-[1em] align-[-0.15em] ${className ?? ''}`}
    />
  )
}
