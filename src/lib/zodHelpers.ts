import { z } from 'zod'

// Número opcional para campos de formulario: vacío = "sin valor" (undefined).
// z.coerce.number() convierte '' en 0, y un día de corte 0 se guardaba como dato real.
export function optionalInt(min: number, max: number, message: string) {
  return z.preprocess(
    (v) => (v === '' || v == null || (typeof v === 'number' && Number.isNaN(v)) ? undefined : v),
    z.coerce.number().int(message).min(min, message).max(max, message).optional(),
  )
}
