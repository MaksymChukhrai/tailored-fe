import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { ApiErrorBody } from '@/types/api'

const baseURL = import.meta.env.VITE_API_URL as string

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
})

export class ApiError extends Error {
  readonly statusCode: number
  readonly errorType: string
  readonly path: string

  constructor(body: ApiErrorBody) {
    const message = Array.isArray(body.message)
      ? body.message.join(', ')
      : body.message
    super(message)
    this.name = 'ApiError'
    this.statusCode = body.statusCode
    this.errorType = body.error
    this.path = body.path
  }
}

function isApiErrorBody(data: unknown): data is ApiErrorBody {
  return (
    typeof data === 'object' &&
    data !== null &&
    'statusCode' in data &&
    'message' in data
  )
}

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

let refreshPromise: Promise<void> | null = null

async function refreshAccessToken(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = apiClient
      .post('/auth/refresh')
      .then(() => undefined)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error)
    }

    const axiosError = error as AxiosError
    const originalRequest = axiosError.config as
      | RetryableRequestConfig
      | undefined

    const isAuthEndpoint = originalRequest?.url?.startsWith('/auth/')

    if (
      axiosError.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true
      try {
        await refreshAccessToken()
        return apiClient(originalRequest)
      } catch (refreshError: unknown) {
        return Promise.reject(refreshError)
      }
    }

    if (isApiErrorBody(axiosError.response?.data)) {
      return Promise.reject(new ApiError(axiosError.response.data))
    }

    return Promise.reject(error)
  },
)
