import { useQuery, useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  is_premium: boolean
  is_admin: boolean
  is_gmail_tester: boolean
  created_at: string
}

export function useListUsers() {
  return useQuery({
    queryKey: ['list_users'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) throw new Error('No session')

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/list-users`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${data.session.access_token}`,
            'Content-Type': 'application/json',
          },
        },
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to list users')
      }

      return response.json() as Promise<UserProfile[]>
    },
  })
}

export function useSetUserPremium() {
  return useMutation({
    mutationFn: async ({ userId, isPremium }: { userId: string; isPremium: boolean }) => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) throw new Error('No session')

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/set-premium`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${data.session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, isPremium }),
        },
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to set premium')
      }

      return response.json()
    },
  })
}

// Puede ver/usar "Conectar Gmail" en Sincronizar correo mientras ese scope
// siga sin la auditoría CASA (ver 0082_gmail_tester_role.sql). Solo un
// admin puede marcarlo.
export function useSetUserGmailTester() {
  return useMutation({
    mutationFn: async ({
      userId,
      isGmailTester,
    }: {
      userId: string
      isGmailTester: boolean
    }) => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) throw new Error('No session')

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/set-gmail-tester`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${data.session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, isGmailTester }),
        },
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to set gmail tester')
      }

      return response.json()
    },
  })
}

export function useSetUserAdmin() {
  return useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) throw new Error('No session')

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/set-admin`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${data.session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, isAdmin }),
        },
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to set admin')
      }

      return response.json()
    },
  })
}
