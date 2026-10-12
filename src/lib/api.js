// Thin client for the WheelSync FastAPI backend.
import AsyncStorage from '@react-native-async-storage/async-storage'

// Expo inlines EXPO_PUBLIC_* variables from .env at build time (see .env.example).
// NOTE: on a physical phone "localhost" is the phone itself - use your computer's LAN IP or a public URL.
const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '')
const TOKEN_KEY = 'wheelsync-staff-token'

export const apiUrl = API_URL
export const wsUrl = API_URL.replace(/^http/, 'ws')

let memoryToken = null
export const getToken = () => memoryToken

export async function loadToken() {
  try { memoryToken = await AsyncStorage.getItem(TOKEN_KEY) } catch { memoryToken = null }
  return memoryToken
}

export async function setToken(token) {
  memoryToken = token || null
  try {
    if (token) await AsyncStorage.setItem(TOKEN_KEY, token)
    else await AsyncStorage.removeItem(TOKEN_KEY)
  } catch { /* storage unavailable */ }
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

let unauthorizedHandler = null
export const onUnauthorized = (handler) => { unauthorizedHandler = handler }

function messageFrom(data, fallback) {
  const detail = data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail.length) {
    const first = detail[0]
    const field = Array.isArray(first.loc) ? first.loc.filter((p) => p !== 'body' && p !== 'query').join('.') : ''
    return field ? `${field}: ${first.msg}` : first.msg
  }
  return fallback
}

async function request(method, path, { body, query } = {}) {
  const headers = {}
  if (memoryToken) headers.Authorization = `Bearer ${memoryToken}`
  let payload
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  let url = API_URL + path
  if (query) {
    const qs = Object.entries(query)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&')
    if (qs) url += `?${qs}`
  }

  let response
  try {
    response = await fetch(url, { method, headers, body: payload })
  } catch {
    throw new ApiError(`Cannot reach the WheelSync server at ${API_URL}. Check your connection and the EXPO_PUBLIC_API_URL setting.`, 0)
  }

  const data = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) {
    if (response.status === 401 && memoryToken && unauthorizedHandler) unauthorizedHandler()
    throw new ApiError(messageFrom(data, `Request failed (HTTP ${response.status})`), response.status, data)
  }
  return data
}

// Photo uploads use XMLHttpRequest on purpose: Expo's fetch (which replaces the global fetch in
// SDK 57) cannot send React Native FormData files given as { uri, name, type }, such as camera
// photos. React Native's XMLHttpRequest can.
function uploadForm(path, form) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', API_URL + path)
    if (memoryToken) xhr.setRequestHeader('Authorization', `Bearer ${memoryToken}`)
    xhr.timeout = 60000
    xhr.onload = () => {
      let data = null
      try { data = xhr.responseText ? JSON.parse(xhr.responseText) : null } catch { data = null }
      if (xhr.status >= 200 && xhr.status < 300) return resolve(data)
      if (xhr.status === 401 && memoryToken && unauthorizedHandler) unauthorizedHandler()
      reject(new ApiError(messageFrom(data, `Upload failed (HTTP ${xhr.status})`), xhr.status, data))
    }
    xhr.onerror = () => reject(new ApiError(`Cannot reach the WheelSync server at ${API_URL}. Check your connection and the EXPO_PUBLIC_API_URL setting.`, 0))
    xhr.ontimeout = () => reject(new ApiError('The photo upload took too long. Check your connection and try again.', 0))
    xhr.send(form) // the multipart Content-Type boundary is set automatically
  })
}

export const api = {
  get: (path, query) => request('GET', path, { query }),
  post: (path, body) => request('POST', path, { body }),
  put: (path, body) => request('PUT', path, { body }),
  patch: (path, body) => request('PATCH', path, { body }),
  delete: (path) => request('DELETE', path),
  upload: uploadForm,
}
