/**
 * API service for the Project Management module (Monday-like boards).
 *
 * NOTA: Este módulo tiene su propio wrapper `request` separado de api.js
 * porque apunta a un prefijo de URL diferente (/api/projects).
 * En un futuro refactor se puede unificar con una función base compartida.
 */
const API_URL = "http://localhost:8000/api/projects";

/**
 * Wrapper HTTP para el módulo de proyectos.
 * Idéntico en comportamiento al de api.js pero con base URL propia.
 */
async function request(url, options = {}) {
  const response = await fetch(`${API_URL}${url}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ detail: "Error de servidor" }));
    throw new Error(errorBody.detail || "Error desconocido");
  }
  return response.json();
}


// ── Tableros ────────────────────────────────────────────────

export const boardsAPI = {
  list: () => request("/boards"),
  get: (id) => request(`/boards/${id}`),
  create: (data) => request("/boards", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => request(`/boards/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => request(`/boards/${id}`, { method: "DELETE" }),
};


// ── Grupos ──────────────────────────────────────────────────

export const groupsAPI = {
  create: (data) => request("/groups", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => request(`/groups/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => request(`/groups/${id}`, { method: "DELETE" }),
};


// ── Columnas ────────────────────────────────────────────────

export const columnsAPI = {
  create: (data) => request("/columns", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => request(`/columns/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => request(`/columns/${id}`, { method: "DELETE" }),
};


// ── Items ───────────────────────────────────────────────────

export const itemsAPI = {
  create: (data) => request("/items", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => request(`/items/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => request(`/items/${id}`, { method: "DELETE" }),
};


// ── Sub-Items ───────────────────────────────────────────────

export const subItemsAPI = {
  create: (data) => request("/subitems", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => request(`/subitems/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => request(`/subitems/${id}`, { method: "DELETE" }),
};
