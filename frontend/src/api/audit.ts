import { api, type Paginated } from "./client";

export type AuditLog = {
  id_auditoria: number;
  nombre_tabla: string;
  id_registro: string;
  accion: string;     // CREATE, UPDATE, DELETE
  fecha_operacion: string;
  usuario_responsable: string;
  direccion_ip?: string;
  // Estos campos vienen como objetos JSON desde Django
  datos_anteriores?: Record<string, any> | null;
  datos_nuevos?: Record<string, any> | null;
};

export async function listAuditLogs(params: Record<string, any>) {
  // Ordenamos por defecto por fecha descendente
  const { data } = await api.get<Paginated<AuditLog>>("/audit/", { 
    params: { ...params, ordering: "-fecha_operacion" } 
  });
  return data;
}