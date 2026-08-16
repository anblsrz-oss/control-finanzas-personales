import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface ReceiptExtraction {
  merchant: string | null
  amount: number | null
  currency: string | null
  txDate: string | null
  concept: string | null
  kind: 'income' | 'expense'
  /** Últimos 4 dígitos de la cuenta/tarjeta/CLABE de origen y destino de la
   * transferencia, si el comprobante los muestra (ej. "origen y destino" de
   * Mercado Pago). No asume cuál de las dos es la del usuario — el frontend
   * prueba ambas contra las cuentas/tarjetas propias, igual que hace la
   * captura automática por correo/SMS. */
  originLast4: string | null
  destinationLast4: string | null
}

export interface StatementExtraction {
  /** Últimos 4 dígitos de la tarjeta/cuenta a la que pertenece todo el
   * documento (impresos en el encabezado/pie del estado de cuenta). */
  accountLast4: string | null
  transactions: {
    amount: number
    currency: string | null
    txDate: string
    concept: string
    kind: 'income' | 'expense'
    /** Pago/abono recibido en la tarjeta (reduce su saldo), no una compra. */
    isCardPayment: boolean
    /** Compra diferida a meses sin intereses (MSI). */
    isInstallment: boolean
  }[]
}

interface OcrReceiptInput {
  mode: 'receipt' | 'statement'
  images?: string[]
  text?: string
}

// Llama a la Edge Function ocr-receipt: envía la imagen (data URL) o el texto
// ya extraído del documento y recibe los datos estructurados que devuelve el
// modelo de visión de OpenAI. No escribe nada en la base de datos — el
// llamador decide qué transacciones crear tras revisar el resultado.
export function useOcrReceipt() {
  return useMutation<ReceiptExtraction | StatementExtraction, Error, OcrReceiptInput>({
    mutationFn: async ({ mode, images, text }) => {
      const { data, error } = await supabase.functions.invoke('ocr-receipt', {
        body: { mode, images, text },
      })
      if (error) {
        // supabase-js pone la respuesta real en `error.context` en fallos non-2xx
        let detail = error.message
        try {
          const ctx = (error as { context?: Response }).context
          const body = ctx && typeof ctx.json === 'function' ? await ctx.json() : null
          if (body?.error) detail = body.error
        } catch {
          /* si no se puede leer el cuerpo, queda el mensaje genérico */
        }
        throw new Error(detail)
      }
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error)
      return (data as { data: ReceiptExtraction | StatementExtraction }).data
    },
  })
}
