import axios from 'axios'
import { create } from 'zustand'

import {
  api,
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  type ApiEnvelope,
} from './api'

// --- Tipos (podem mudar para alinhar ao contrato real do backend) ---

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
}

export interface AuthUser {
  id: string
  email: string
  role: string
  permissions: string[]
}

export type User = AuthUser

/**
 * Credenciais de exemplo para apresentação / ambiente de demonstração.
 * O backend deve ter este utilizador em seed (ou equivalente) para o login funcionar.
 */
export const DEMO_CREDENTIALS = {
  email: 'operador.demo@ligeirinho.food',
  password: 'Apresentacao.Ligeirinho#2025',
} as const

// --- JWT (payload apenas; sem validar assinatura no browser) ---

function base64UrlToJson(segment: string): Record<string, unknown> | null {
  try {
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const json = atob(padded)
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}

/**
 * Client-side exp check (não valida assinatura). Sem `exp` numérico → não considera expirado.
 * Payload ilegível → considera expirado.
 */
export function isAccessTokenExpired(accessToken: string): boolean {
  const parts = accessToken.split('.')
  if (parts.length < 2) return true
  const payload = base64UrlToJson(parts[1])
  if (!payload) return true
  const exp = payload.exp
  if (typeof exp !== 'number') return false
  return exp < Date.now() / 1000
}

function authUserFromAccessToken(
  accessToken: string,
  fallbackEmail?: string,
): AuthUser | null {
  const parts = accessToken.split('.')
  if (parts.length < 2) return null
  const payload = base64UrlToJson(parts[1])
  if (!payload) return null

  const id =
    typeof payload.sub === 'string'
      ? payload.sub
      : typeof payload.id === 'string'
        ? payload.id
        : null
  const email =
    typeof payload.email === 'string'
      ? payload.email
      : fallbackEmail?.trim()
        ? fallbackEmail.trim()
        : null
  if (!id || !email) return null

  const role = typeof payload.role === 'string' ? payload.role : 'user'
  const rawPerms = payload.permissions
  const permissions =
    Array.isArray(rawPerms) && rawPerms.every((p): p is string => typeof p === 'string')
      ? rawPerms
      : []

  return { id, email, role, permissions }
}

// --- API de sessão ---

async function loginRequest(body: LoginRequest) {
  return api.post<ApiEnvelope<LoginResponse>>('/auth/login', body)
}

/** Aceita `accessToken` (camelCase) ou `access_token` / `token` (comum em APIs Nest/Java). */
function extractAccessToken(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null
  const p = payload as Record<string, unknown>
  const raw =
    typeof p.accessToken === 'string'
      ? p.accessToken
      : typeof p.access_token === 'string'
        ? p.access_token
        : typeof p.token === 'string'
          ? p.token
          : null
  const v = raw?.trim()
  return v || null
}

function loginErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message.trim()) {
    return err.message
  }
  if (axios.isAxiosError(err)) {
    if (!err.response) {
      return 'Não foi possível contactar o servidor. Verifique se a API está a correr, a porta em VITE_API_URL e se não há bloqueio de rede/CORS.'
    }
    const status = err.response.status
    if (status === 401 || status === 403) {
      return 'E-mail ou palavra-passe incorretos (ou utilizador inexistente no servidor).'
    }
    if (status === 404) {
      return 'Endpoint de login não encontrado (404). Confirme no backend o caminho, por exemplo /auth/login.'
    }
  }
  if (err && typeof err === 'object' && 'message' in err) {
    const m = (err as { message?: unknown }).message
    if (typeof m === 'string' && m.trim()) return m
  }
  if (axios.isAxiosError(err) && typeof err.message === 'string') {
    return err.message
  }
  return 'Não foi possível iniciar sessão.'
}

function readPersistedAuth(): {
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean
} {
  if (typeof window === 'undefined') {
    return { token: null, user: null, isAuthenticated: false }
  }
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    const userRaw = localStorage.getItem(AUTH_USER_KEY)
    if (!token || !userRaw) {
      return { token: null, user: null, isAuthenticated: false }
    }
    const user = JSON.parse(userRaw) as AuthUser
    if (!user?.id || !user?.email) {
      return { token: null, user: null, isAuthenticated: false }
    }
    return { token, user, isAuthenticated: true }
  } catch {
    return { token: null, user: null, isAuthenticated: false }
  }
}

// --- Store ---

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loadFromStorage: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  ...readPersistedAuth(),

  loadFromStorage: () => {
    set(readPersistedAuth())
  },

  login: async (email, password) => {
    try {
      const response = await loginRequest({ email, password })
      const envelope = response.data
      const accessToken = extractAccessToken(envelope.data)
      if (!accessToken) {
        throw new Error(
          'Resposta do servidor sem token (esperado accessToken, access_token ou token dentro de data).',
        )
      }
      const user = authUserFromAccessToken(accessToken, email)
      if (!user) {
        throw new Error(
          'Token recebido sem dados de utilizador reconhecíveis. Verifique o formato do JWT.',
        )
      }
      localStorage.setItem(AUTH_TOKEN_KEY, accessToken)
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
      set({
        token: accessToken,
        user,
        isAuthenticated: true,
      })
    } catch (err) {
      throw new Error(loginErrorMessage(err))
    }
  },

  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_USER_KEY)
    set({
      token: null,
      user: null,
      isAuthenticated: false,
    })
    window.location.assign('/login')
  },
}))
