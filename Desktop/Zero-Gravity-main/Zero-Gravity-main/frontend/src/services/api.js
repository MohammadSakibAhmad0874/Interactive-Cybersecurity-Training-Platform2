// ===== DevMatch API Service =====
// Centralized API layer — all fetch calls go through here.

const BASE_URL = '/api'

// ---- Helpers ----

function getToken() {
  return localStorage.getItem('cm_token')
}

function authHeaders(extra = {}) {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  }
}

async function handleResponse(res) {
  let data
  try {
    data = await res.json()
  } catch {
    data = {}
  }
  if (!res.ok) {
    const message = data.error || data.message || `Request failed (${res.status})`
    throw new Error(message)
  }
  return data
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers || {}),
    },
  })
  return handleResponse(res)
}

// ===== AUTH =====

export const auth = {
  register: (body) =>
    apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  login: (body) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  logout: () =>
    apiFetch('/auth/logout', { method: 'POST' }),

  googleAuth: (body) =>
    apiFetch('/auth/google', { method: 'POST', body: JSON.stringify(body) }),

  getMe: () =>
    apiFetch('/users/me'),
}

// ===== USERS =====

export const users = {
  getMe: () =>
    apiFetch('/users/me'),

  updateMe: (body) =>
    apiFetch('/users/me', { method: 'PUT', body: JSON.stringify(body) }),

  getById: (id) =>
    apiFetch(`/users/${id}`),
}

// ===== MATCHES =====

export const matches = {
  getMatches: (limit = 10) =>
    apiFetch(`/matches?limit=${limit}`),
}

// ===== CHAT =====

export const chat = {
  getHistory: (userId) =>
    apiFetch(`/chat/${userId}`),

  sendMessage: (recipientId, text) =>
    apiFetch('/chat/send', {
      method: 'POST',
      body: JSON.stringify({ recipientId, text }),
    }),
}

// ===== MEETUPS =====

export const meetups = {
  list: () =>
    apiFetch('/meetups'),

  // alias
  getMeetups: () =>
    apiFetch('/meetups'),

  create: (body) =>
    apiFetch('/meetups', { method: 'POST', body: JSON.stringify(body) }),

  // alias
  createMeetup: (body) =>
    apiFetch('/meetups', { method: 'POST', body: JSON.stringify(body) }),
}

// ===== FEEDBACK =====

export const feedback = {
  submit: (body) =>
    apiFetch('/feedback', { method: 'POST', body: JSON.stringify(body) }),
}

// ===== HEALTH =====

export const health = {
  check: () =>
    apiFetch('/health'),
}

// Default export with all namespaced services
const api = { auth, users, matches, chat, meetups, feedback, health }
export default api
