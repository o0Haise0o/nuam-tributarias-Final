import { useEffect, useState } from "react";
import { type AuditLog, listAuditLogs } from "../api/audit";

export default function AuditList() {
  const [rows, setRows] = useState<AuditLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null); // Para el modal
  
  // Cargar datos al iniciar
  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await listAuditLogs({ page_size: 100 });
      setRows(data.results);
    } catch (error) {
      console.error("Error cargando auditoría:", error);
    }
  }

  // Función para formatear fechas de forma legible
  const formatDate = (isoString: string) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleString("es-CL");
  };

  // Función para asignar colores según la acción
  const getBadgeColor = (accion: string) => {
    switch (accion?.toUpperCase()) {
      case "CREATE": return "bg-green-100 text-green-800";
      case "UPDATE": return "bg-blue-100 text-blue-800";
      case "DELETE": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <section className="space-y-4 p-4">
      <h2 className="text-xl font-semibold">Registro de Auditoría</h2>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tabla / Registro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalles</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.map((log) => (
                <tr key={log.id_auditoria} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.id_auditoria}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(log.fecha_operacion)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {log.usuario_responsable}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getBadgeColor(log.accion)}`}>
                      {log.accion}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="font-medium">{log.nombre_tabla}</div>
                    <div className="text-xs">ID: {log.id_registro}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => setSelectedLog(log)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Ver Cambios
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No hay registros de auditoría aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL DE DETALLES --- */}
      {selectedLog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">
                    Detalle de Auditoría #{selectedLog.id_auditoria}
                </h3>
                <button 
                    onClick={() => setSelectedLog(null)}
                    className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                >
                    &times;
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Columna: Datos Anteriores */}
                <div className="bg-red-50 p-4 rounded border border-red-200">
                    <h4 className="font-semibold text-red-800 mb-2 border-b border-red-200 pb-1">
                        Datos Anteriores
                    </h4>
                    {selectedLog.datos_anteriores ? (
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                            {JSON.stringify(selectedLog.datos_anteriores, null, 2)}
                        </pre>
                    ) : (
                        <span className="text-sm text-gray-500 italic">No aplica (Creación)</span>
                    )}
                </div>

                {/* Columna: Datos Nuevos */}
                <div className="bg-green-50 p-4 rounded border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2 border-b border-green-200 pb-1">
                        Datos Nuevos
                    </h4>
                    {selectedLog.datos_nuevos ? (
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                            {JSON.stringify(selectedLog.datos_nuevos, null, 2)}
                        </pre>
                    ) : (
                        <span className="text-sm text-gray-500 italic">No aplica (Eliminación)</span>
                    )}
                </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setSelectedLog(null)} 
                className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
