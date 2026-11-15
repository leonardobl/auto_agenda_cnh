import axios from 'axios'
import { clearSessionToken, getSessionToken } from '../utils/sessionToken'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const token = getSessionToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearSessionToken()
      // BASE_URL always ends in "/" (default "/", or "/<repo-name>/" on GitHub Pages —
      // see vite.config.ts), so this never produces a double slash.
      window.location.href = `${import.meta.env.BASE_URL}login`
    }
    return Promise.reject(error)
  },
)
