// ─── API Service Layer ────────────────────────────────────────────────────────
// Centralised fetch wrapper for all server communication.
// Follows the Lab05 Task1_RESTAPI fetch pattern.

import config from '../config';

const BASE = config.serverPath;

// Helper: throw on non-2xx with server error message
async function handleResponse(res) {
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) msg = body.error;
    } catch (_) {}
    throw new Error(msg);
  }
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) =>
    fetch(`${BASE}/api/register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    }).then(handleResponse),

  login: (data) =>
    fetch(`${BASE}/api/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    }).then(handleResponse),
};

// ── Stalls ────────────────────────────────────────────────────────────────────
export const stallsAPI = {
  getAll: () =>
    fetch(`${BASE}/api/stalls`).then(handleResponse),

  getById: (id) =>
    fetch(`${BASE}/api/stalls/${id}`).then(handleResponse),

  create: (data) =>
    fetch(`${BASE}/api/stalls`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    }).then(handleResponse),

  update: (id, data) =>
    fetch(`${BASE}/api/stalls/${id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    }).then(handleResponse),

  remove: (id) =>
    fetch(`${BASE}/api/stalls/${id}`, {
      method: 'DELETE',
    }).then(handleResponse),
};

// ── Reviews ───────────────────────────────────────────────────────────────────
export const reviewsAPI = {
  // Get all reviews, optionally filtered by stallId and/or userId
  getAll: ({ stallId, userId } = {}) => {
    const params = new URLSearchParams();
    if (stallId !== undefined) params.append('stallId', stallId);
    if (userId  !== undefined) params.append('userId',  userId);
    const qs = params.toString();
    return fetch(`${BASE}/api/reviews${qs ? `?${qs}` : ''}`).then(handleResponse);
  },

  getById: (id) =>
    fetch(`${BASE}/api/reviews/${id}`).then(handleResponse),

  create: (data) =>
    fetch(`${BASE}/api/reviews`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    }).then(handleResponse),

  update: (id, data) =>
    fetch(`${BASE}/api/reviews/${id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    }).then(handleResponse),

  remove: (id) =>
    fetch(`${BASE}/api/reviews/${id}`, {
      method: 'DELETE',
    }).then(handleResponse),
};
