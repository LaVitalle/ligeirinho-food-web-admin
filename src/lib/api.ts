const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "https://apps-gateway.6x97ra.easypanel.host";

/**
 * Envelope padrão de resposta da API (TransformInterceptor do backend).
 * `pagination` só aparece em listagens paginadas.
 */
export interface ApiResponse<T> {
  data: T;
  status: {
    code: number;
    message: string;
  };
  pagination?: {
    page: number;
    perPage: number;
    hasNextPage: boolean;
  };
}

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export function getAuthToken() {
  return localStorage.getItem("ligeirinho_auth_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers);

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    let message = data?.message || data?.status?.message || (data?.error && String(data.error)) || response.statusText;
    
    if (Array.isArray(message)) {
      message = message.join("\\n");
    }

    throw new ApiError(message || "Erro na requisição", response.status, data);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: unknown, options?: RequestInit) => {
    const isFormData = body instanceof FormData;
    const headers = new Headers(options?.headers);
    if (!isFormData && body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return request<T>(path, {
      ...options,
      method: "POST",
      headers,
      body: isFormData ? body : JSON.stringify(body),
    });
  },

  put: <T>(path: string, body?: unknown, options?: RequestInit) => {
    const isFormData = body instanceof FormData;
    const headers = new Headers(options?.headers);
    if (!isFormData && body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return request<T>(path, {
      ...options,
      method: "PUT",
      headers,
      body: isFormData ? body : JSON.stringify(body),
    });
  },

  patch: <T>(path: string, body?: unknown, options?: RequestInit) => {
    const isFormData = body instanceof FormData;
    const headers = new Headers(options?.headers);
    if (!isFormData && body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return request<T>(path, {
      ...options,
      method: "PATCH",
      headers,
      body: isFormData ? body : JSON.stringify(body),
    });
  },

  delete: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
