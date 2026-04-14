import axios from 'axios'

import { api, AUTH_TOKEN_KEY, type ApiEnvelope } from './api'

export interface Institution {
  id: string
  name: string
  photoUrl?: string | null
  stateId: number
  cityId: number
  cityName?: string
  stateName?: string
  stateAbbreviation?: string
  /** Se a API não enviar, assume-se ativa */
  isActive?: boolean
}

export interface CreateInstitutionResult {
  id: string
  name?: string
  photoUrl?: string | null
}

function getBaseUrl() {
  return import.meta.env.VITE_API_URL || 'http://localhost:3333'
}

function normalizeInstitution(raw: Record<string, unknown>): Institution {
  const id = raw.id != null ? String(raw.id) : ''
  const name = typeof raw.name === 'string' ? raw.name : ''
  const photoUrl =
    (typeof raw.photoUrl === 'string' ? raw.photoUrl : null) ??
    (typeof raw.photo_url === 'string' ? raw.photo_url : null)
  const stateId = Number(raw.stateId ?? raw.state_id ?? 0)
  const cityId = Number(raw.cityId ?? raw.city_id ?? 0)
  const cityName =
    typeof raw.cityName === 'string'
      ? raw.cityName
      : typeof raw.city_name === 'string'
        ? raw.city_name
        : undefined
  const stateName =
    typeof raw.stateName === 'string'
      ? raw.stateName
      : typeof raw.state_name === 'string'
        ? raw.state_name
        : undefined
  const stateAbbreviation =
    typeof raw.stateAbbreviation === 'string'
      ? raw.stateAbbreviation
      : typeof raw.state_abbreviation === 'string'
        ? raw.state_abbreviation
        : undefined
  const isActiveRaw = raw.isActive ?? raw.is_active
  const isActive =
    typeof isActiveRaw === 'boolean'
      ? isActiveRaw
      : typeof isActiveRaw === 'string'
        ? isActiveRaw === 'true'
        : undefined

  return {
    id,
    name,
    photoUrl,
    stateId,
    cityId,
    cityName,
    stateName,
    stateAbbreviation,
    isActive,
  }
}

export async function fetchInstitutions(): Promise<Institution[]> {
  const { data } = await api.get<ApiEnvelope<unknown>>('/institutions')
  const raw = data.data
  if (!Array.isArray(raw)) return []
  return raw
    .filter((row): row is Record<string, unknown> => row !== null && typeof row === 'object')
    .map(normalizeInstitution)
}

async function parseJsonEnvelope(res: Response) {
  let body: unknown
  try {
    body = await res.json()
  } catch {
    body = null
  }
  return body as {
    data?: unknown
    status?: unknown
    message?: string
  } | null
}

function authHeaders(): HeadersInit {
  const token =
    typeof localStorage !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * POST multipart: name, stateId, cityId, photo (opcional).
 */
export async function createInstitution(
  formData: FormData,
): Promise<ApiEnvelope<CreateInstitutionResult>> {
  const res = await fetch(`${getBaseUrl()}/institutions`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  })

  const envelope = await parseJsonEnvelope(res)

  if (!res.ok) {
    const msg =
      (envelope && typeof envelope.message === 'string' && envelope.message.trim()) ||
      `Erro ao cadastrar (${res.status})`
    throw Object.assign(new Error(msg), {
      status: envelope?.status,
      data: envelope?.data,
    })
  }

  return {
    data: envelope?.data as CreateInstitutionResult,
    status: envelope?.status,
    message: envelope?.message,
  }
}

/**
 * PATCH multipart: name, stateId, cityId, photo (opcional — só enviar se substituir).
 */
export async function updateInstitution(
  id: string,
  formData: FormData,
): Promise<ApiEnvelope<CreateInstitutionResult>> {
  const res = await fetch(`${getBaseUrl()}/institutions/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: formData,
  })

  const envelope = await parseJsonEnvelope(res)

  if (!res.ok) {
    const msg =
      (envelope && typeof envelope.message === 'string' && envelope.message.trim()) ||
      `Erro ao atualizar (${res.status})`
    throw Object.assign(new Error(msg), {
      status: envelope?.status,
      data: envelope?.data,
    })
  }

  return {
    data: envelope?.data as CreateInstitutionResult,
    status: envelope?.status,
    message: envelope?.message,
  }
}

export async function deleteInstitution(id: string): Promise<void> {
  try {
    await api.delete(`/institutions/${id}`)
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'message' in err) {
      const m = (err as { message?: unknown }).message
      if (typeof m === 'string' && m.trim()) throw new Error(m)
    }
    if (axios.isAxiosError(err) && err.response?.data) {
      const d = err.response.data as { message?: string }
      if (typeof d.message === 'string' && d.message.trim()) {
        throw new Error(d.message)
      }
    }
    throw err instanceof Error ? err : new Error('Erro ao excluir instituição.')
  }
}

/**
 * Ativar / desativar. Ajuste o path se o backend usar outro (ex: PATCH /institutions/:id com JSON).
 */
export async function patchInstitutionActive(id: string, isActive: boolean): Promise<void> {
  try {
    await api.patch(`/institutions/${id}/status`, { isActive })
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'message' in err) {
      const m = (err as { message?: unknown }).message
      if (typeof m === 'string' && m.trim()) throw new Error(m)
    }
    if (axios.isAxiosError(err) && err.response?.data) {
      const d = err.response.data as { message?: string }
      if (typeof d.message === 'string' && d.message.trim()) {
        throw new Error(d.message)
      }
    }
    throw err instanceof Error ? err : new Error('Erro ao atualizar estado da instituição.')
  }
}
