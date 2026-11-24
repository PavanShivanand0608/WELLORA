import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

interface ApiErrorPayload {
  error?: {
    code?: string
    message?: string
    details?: unknown
  }
}

interface CsrfResponse {
  csrfToken: string
}

export class ApiRequestError extends Error {
  readonly status?: number
  readonly code?: string
  readonly details?: unknown

  constructor(message: string, options: { status?: number; code?: string; details?: unknown } = {}) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = options.status
    this.code = options.code
    this.details = options.details
  }
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
let csrfToken: string | null = null
let csrfRequest: Promise<string> | null = null

export function clearApiCsrfToken(): void {
  csrfToken = null
  csrfRequest = null
}

export async function initializeCsrf(): Promise<string> {
  if (csrfToken) return csrfToken
  if (!csrfRequest) {
    csrfRequest = axios.get<CsrfResponse>(`${apiBaseUrl}/auth/csrf`, {
      withCredentials: true,
      headers: { Accept: 'application/json' },
    }).then(({ data }) => {
      csrfToken = data.csrfToken
      return data.csrfToken
    }).finally(() => {
      csrfRequest = null
    })
  }
  return csrfRequest
}

function isUnsafeMethod(method: string | undefined): boolean {
  return method !== undefined && !['get', 'head', 'options'].includes(method.toLowerCase())
}

async function addJsonAndCsrfHeaders(config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> {
  config.headers.set('Accept', 'application/json')
  if (isUnsafeMethod(config.method)) {
    config.headers.set('Content-Type', 'application/json')
    config.headers.set('X-CSRF-Token', await initializeCsrf())
  }
  return config
}

function normalizeApiError(error: AxiosError<ApiErrorPayload>): ApiRequestError {
  const payload = error.response?.data?.error
  return new ApiRequestError(payload?.message ?? (error.response ? 'The API request failed.' : 'The API could not be reached.'), {
    status: error.response?.status,
    code: payload?.code ?? (error.response ? 'API_ERROR' : 'NETWORK_ERROR'),
    details: payload?.details,
  })
}

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10_000,
  withCredentials: true,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use(addJsonAndCsrfHeaders)
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(axios.isAxiosError<ApiErrorPayload>(error) ? normalizeApiError(error) : error),
)

export default apiClient
