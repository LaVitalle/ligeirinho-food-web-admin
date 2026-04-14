import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'

/** Resposta NestJS já normalizada pelo interceptor */
export interface ApiEnvelope<T> {
  data: T
  status: unknown
  message?: string
}

export const AUTH_TOKEN_KEY = 'ligeirinho.auth.token'
export const AUTH_USER_KEY = 'ligeirinho.auth.user'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response: AxiosResponse) => {
    const body = response.data as {
      data?: unknown
      status?: unknown
      message?: string
    }
    if (body && typeof body === 'object' && 'data' in body && 'status' in body) {
      const normalized: ApiEnvelope<typeof body.data> = {
        data: body.data,
        status: body.status,
        message: body.message,
      }
      response.data = normalized
    }
    return response
  },
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.data &&
      typeof error.response.data === 'object' &&
      'data' in error.response.data &&
      'status' in error.response.data
    ) {
      const raw = error.response.data as {
        data: unknown
        status: unknown
        message?: string
      }
      return Promise.reject({
        data: raw.data,
        status: raw.status,
        message: raw.message,
      })
    }
    return Promise.reject(error)
  },
)
