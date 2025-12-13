import { api, type Paginated  } from "./client";

//(Dependencias)
export type Contribuyente = {
  rut: string;
  razon_social: string;
  email: string;
};

export type TipoCalificacion = {
  codigo: string;
  descripcion: string;
  categoria: string;
};

export type Calificacion = {
  id_calificacion: number;
  
  // Datos para leer (vienen del serializer anidado)
  contribuyente_data?: Contribuyente;
  tipo_data?: TipoCalificacion;
  
  // Datos para escribir (IDs)
  rut_contribuyente_id?: string;
  codigo_tipo_calificacion_id?: string;

  fecha_calificacion: string;
  monto_anual: string; // Decimal viene como string en JSON a veces
  periodo: number;
  estado: string;
  vigente: boolean;
  observaciones?: string;
  
  fecha_creacion?: string;
  fecha_actualizacion?: string;
};

// 3. Funciones de la API

export async function listCalificaciones(params: Record<string, any>) {
  // Ajustamos endpoint a la nueva URL base
  const { data } = await api.get<Paginated<Calificacion>>("/calificaciones/", { params });
  return data;
}

export const createCalificacion = async (data: any) => {
  // Usamos api.post para seguridad y CSRF
  const response = await api.post("/calificaciones/", data);
  return response.data;
};

export async function updateCalificacion(id: number, payload: Partial<Calificacion> | any) {
  const { data } = await api.patch<Calificacion>(`/calificaciones/${id}/`, payload);
  return data;
}

export async function deleteCalificacion(id: number) {
  await api.delete(`/calificaciones/${id}/`);
}

export async function exportCSV(params: Record<string, any>) {
  // Endpoint de exportación (si lo mantienes)
  const res = await api.get("/calificaciones/export/", { params, responseType: "blob" });
  return res.data;
}

// --- FUNCIONES AUXILIARES PARA EL DEMO ---
// Necesitamos crear dependencias antes de crear una calificación demo

export async function createContribuyenteDemo(data: any) {
    return api.post("/contribuyentes/", data);
}

export async function createTipoDemo(data: any) {
    return api.post("/tipos/", data);
}
export async function bulkUpload(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  
  // ELIMINA la línea de headers, deja que axios lo haga automático
  const response = await api.post("/calificaciones/bulk-upload/", formData);
  
  return response.data;
}
export async function createContribuyente(data: any) {
  const response = await api.post("/contribuyentes/", data);
  return response.data;
}