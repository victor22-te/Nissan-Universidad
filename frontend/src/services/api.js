/**
 * Servicio de conexión con el Backend API (módulo REPSE).
 * Centraliza todas las peticiones HTTP al servidor FastAPI.
 *
 * ARQUITECTURA:
 * - request(): wrapper base para fetch con manejo de errores y detección de archivos.
 * - downloadFile(): utilidad para descargar blobs como archivos del navegador.
 * - Cada módulo exporta un objeto con métodos CRUD mapeados a los endpoints.
 */
const API_URL = "http://localhost:8000/api";

/**
 * Ejecuta una petición HTTP al backend y devuelve la respuesta parseada.
 * - Si la respuesta es un archivo (content-type spreadsheet), retorna un Blob.
 * - Si es JSON, retorna el objeto parseado.
 * - Si hay error, lanza un Error con el mensaje de `detail` del backend.
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

  // Detección de archivos binarios (Excel)
  if (response.headers.get("content-type")?.includes("spreadsheet")) {
    return response.blob();
  }

  return response.json();
}

import { downloadFile } from "../shared/utils/fileDownloader";


// ── Cuatrimestres ────────────────────────────────────────────

export const cuatrimestresAPI = {
  listar: () => request("/cuatrimestres/"),
  crear: (data) => request("/cuatrimestres/", { method: "POST", body: JSON.stringify(data) }),
  obtener: (id) => request(`/cuatrimestres/${id}`),
  eliminar: (id) => request(`/cuatrimestres/${id}`, { method: "DELETE" }),
};


// ── Contratos ────────────────────────────────────────────────

export const contratosAPI = {
  listar: (cuatrimestreId) => request(`/contratos/cuatrimestre/${cuatrimestreId}`),
  crear: (data) => request("/contratos/", { method: "POST", body: JSON.stringify(data) }),
  obtener: (id) => request(`/contratos/${id}`),
  actualizar: (id, data) => request(`/contratos/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  eliminar: (id) => request(`/contratos/${id}`, { method: "DELETE" }),
};


// ── Objetos Contables ────────────────────────────────────────

export const objetosAPI = {
  listar: (cuatrimestreId) => request(`/objetos-contables/cuatrimestre/${cuatrimestreId}`),
  crear: (data) => request("/objetos-contables/", { method: "POST", body: JSON.stringify(data) }),
  actualizar: (id, data) => request(`/objetos-contables/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  eliminar: (id) => request(`/objetos-contables/${id}`, { method: "DELETE" }),
};


// ── Beneficiarios ────────────────────────────────────────────

export const beneficiariosAPI = {
  listar: (cuatrimestreId) => request(`/beneficiarios/cuatrimestre/${cuatrimestreId}`),
  crear: (data) => request("/beneficiarios/", { method: "POST", body: JSON.stringify(data) }),
  obtener: (id) => request(`/beneficiarios/${id}`),
  actualizar: (id, data) => request(`/beneficiarios/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  eliminar: (id) => request(`/beneficiarios/${id}`, { method: "DELETE" }),
};


// ── Empleados ────────────────────────────────────────────────

export const empleadosAPI = {
  listar: (cuatrimestreId) => request(`/empleados/cuatrimestre/${cuatrimestreId}`),
  crear: (data) => request("/empleados/", { method: "POST", body: JSON.stringify(data) }),
  actualizar: (id, data) => request(`/empleados/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  /** Carga XMLs de nómina CFDI. Usa FormData en vez del wrapper `request` (no es JSON). */
  cargarXML: async (cuatrimestreId, archivos) => {
    const formData = new FormData();
    archivos.forEach((archivo) => formData.append("files", archivo));

    const response = await fetch(`${API_URL}/empleados/xml/${cuatrimestreId}`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ detail: "Error" }));
      throw new Error(errorBody.detail);
    }
    return response.json();
  },

  eliminar: (id) => request(`/empleados/${id}`, { method: "DELETE" }),
};


// ── Asociaciones ─────────────────────────────────────────────

export const asociacionesAPI = {
  asociarObjeto: (data) => request("/asociaciones/objeto", { method: "POST", body: JSON.stringify(data) }),
  desasociarObjeto: (data) => request("/asociaciones/objeto", { method: "DELETE", body: JSON.stringify(data) }),
  asociarBeneficiario: (data) => request("/asociaciones/beneficiario", { method: "POST", body: JSON.stringify(data) }),
  desasociarBeneficiario: (data) => request("/asociaciones/beneficiario", { method: "DELETE", body: JSON.stringify(data) }),
  asociarEmpleado: (data) => request("/asociaciones/empleado", { method: "POST", body: JSON.stringify(data) }),
  desasociarEmpleado: (data) => request("/asociaciones/empleado", { method: "DELETE", body: JSON.stringify(data) }),
};


// ── Reportes (descargas Excel) ───────────────────────────────

export const reportesAPI = {
  descargarICSOE: async (cuatrimestreId) => {
    const blob = await request(`/reportes/icsoe/${cuatrimestreId}`);
    downloadFile(blob, "ICSOE_Reporte.xlsx");
  },
  descargarSISUBContratos: async (cuatrimestreId) => {
    const blob = await request(`/reportes/sisub-contratos/${cuatrimestreId}`);
    downloadFile(blob, "SISUB_Contratos.xlsx");
  },
  descargarSISUBTrabajadores: async (cuatrimestreId) => {
    const blob = await request(`/reportes/sisub-trabajadores/${cuatrimestreId}`);
    downloadFile(blob, "SISUB_Trabajadores.xlsx");
  },
};
