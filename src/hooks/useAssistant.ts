import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export type ProposalKind = 'account' | 'card' | 'credit_line' | 'category' | 'budget' | 'subscription'

/** Lo que el asistente propone crear; nada se guarda hasta que el usuario confirma. */
export interface AssistantProposal {
  kind: ProposalKind
  data: Record<string, any>
}

export interface AssistantMessage {
  role: 'user' | 'assistant'
  content: string
}

interface AssistantReply {
  reply: string
  proposals: AssistantProposal[]
  /** Mensajes que le quedan hoy y el tope diario; null = sin tope. */
  remaining: number | null
  limit: number | null
}

// Llama a la Edge Function app-assistant (ver finzen-backend). Solo manda el
// historial reciente; el servidor pone la guía de la app y los límites.
export function useAssistant() {
  return useMutation<AssistantReply, Error, AssistantMessage[]>({
    mutationFn: async (messages) => {
      const { data, error } = await supabase.functions.invoke('app-assistant', { body: { messages } })
      if (error) {
        // supabase-js pone la respuesta real en `error.context` en fallos non-2xx
        // Sin respuesta del servidor (función no desplegada, sin red): mensaje claro en vez del técnico.
        let detail =
          error.name === 'FunctionsFetchError' || error.name === 'FunctionsRelayError'
            ? 'El asistente no está disponible por ahora. Intenta más tarde.'
            : error.message
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
      return data as AssistantReply
    },
  })
}
