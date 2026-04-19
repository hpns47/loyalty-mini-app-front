import { useState, useEffect } from 'react'
import { apiClient, AuthError } from '../lib/api-client'
import type { User } from '../types'

type UserProfile = Pick<User, 'id' | 'telegram_id' | 'username' | 'first_name'>

interface AuthState {
  user: UserProfile | null
  loading: boolean
  error: string | null
}

function getSessionKey(): string {
  const tgUser = new URLSearchParams(window.location.search).get('tg_user')
  return tgUser ? `auth_user_${tgUser}` : 'auth_user'
}

export function useAuth(): AuthState {
  const sessionKey = getSessionKey()

  const [state, setState] = useState<AuthState>(() => {
    const cached = sessionStorage.getItem(sessionKey)
    if (cached) {
      return { user: JSON.parse(cached) as UserProfile, loading: false, error: null }
    }
    return { user: null, loading: true, error: null }
  })

  useEffect(() => {
    if (state.user !== null || !state.loading) return

    apiClient
      .post<{ user: UserProfile }>('/api/v1/auth/me', {})
      .then(({ user }) => {
        sessionStorage.setItem(sessionKey, JSON.stringify(user))
        setState({ user, loading: false, error: null })
      })
      .catch((err: unknown) => {
        const message =
          err instanceof AuthError || err instanceof Error ? err.message : 'AUTH_FAILED'
        setState({ user: null, loading: false, error: message })
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return state
}
