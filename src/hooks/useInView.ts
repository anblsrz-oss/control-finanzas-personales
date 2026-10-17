import { useEffect, useRef, useState } from 'react'

// true cuando el elemento entra en pantalla (una sola vez). Sin IntersectionObserver
// (navegadores muy viejos) devuelve true de inmediato para no dejar contenido oculto.
export function useInView<T extends Element>(threshold = 0.2) {
  const ref = useRef<T | null>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setSeen(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true)
          io.disconnect()
        }
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return [ref, seen] as const
}
