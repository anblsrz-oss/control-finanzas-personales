// Taffy, la mascota del asistente: poodle blanco con moño amarillo (ilustración vectorial propia,
// sin fondo: el contenedor pone el color). Tamaño por className (h-/w-).
export const ASSISTANT_NAME = 'Taffy'

export function TaffyAvatar({ className = 'h-full w-full' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
      <g fill="#F3E6D0">
        <circle cx="20" cy="50" r="10" /><circle cx="15" cy="62" r="9" /><circle cx="22" cy="72" r="8" /><circle cx="26" cy="58" r="10" />
        <circle cx="80" cy="50" r="10" /><circle cx="85" cy="62" r="9" /><circle cx="78" cy="72" r="8" /><circle cx="74" cy="58" r="10" />
      </g>
      <g fill="#FBF4E6">
        <circle cx="38" cy="26" r="10" /><circle cx="50" cy="21" r="11" /><circle cx="62" cy="26" r="10" />
        <circle cx="30" cy="35" r="9" /><circle cx="70" cy="35" r="9" />
        <ellipse cx="50" cy="54" rx="27" ry="26" />
        <circle cx="30" cy="62" r="8" /><circle cx="70" cy="62" r="8" /><circle cx="38" cy="75" r="9" /><circle cx="62" cy="75" r="9" />
      </g>
      <ellipse cx="50" cy="65" rx="13" ry="10" fill="#FFFBF2" />
      <circle cx="39" cy="50" r="4.2" fill="#2B2220" /><circle cx="61" cy="50" r="4.2" fill="#2B2220" />
      <circle cx="40.2" cy="48.6" r="1.3" fill="#fff" /><circle cx="62.2" cy="48.6" r="1.3" fill="#fff" />
      <ellipse cx="50" cy="59" rx="5.6" ry="4" fill="#3A2E2C" />
      <ellipse cx="48.6" cy="57.6" rx="1.6" ry="1" fill="#6b5a57" />
      <path d="M50 63 v4 M50 67 q-4 4 -8 1 M50 67 q4 4 8 1" fill="none" stroke="#3A2E2C" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M46 70 q4 7 8 0 z" fill="#F29BA8" />
      <g fill="#F5C531">
        <path d="M50 18 L36 10 Q32 18 36 25 Z" /><path d="M50 18 L64 10 Q68 18 64 25 Z" />
        <circle cx="50" cy="18" r="4.2" fill="#E5A91A" />
      </g>
    </svg>
  )
}
