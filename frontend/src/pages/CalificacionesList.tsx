import { useEffect, useState } from "react";
import { 
  type Calificacion, 
  listCalificaciones, 
  exportCSV, 
  createCalificacion, 
  updateCalificacion, 
  deleteCalificacion,
  createContribuyenteDemo,
  createTipoDemo,
  bulkUpload,
} from "../api/calificaciones";

// Tipo para el formulario de edición
type EditPayload = {
  monto_anual: string;
  periodo: number;
  estado: string;
  vigente: boolean;
  observaciones: string;
}

// Tipo para el formulario de CREACIÓN (necesita más datos)
type CreatePayload = {
  rut_contribuyente_id: string;
  codigo_tipo_calificacion_id: string;
  fecha_calificacion: string;
  monto_anual: string;
  periodo: number;
  estado: string;
  vigente: boolean;
  observaciones: string;
}

export default function CalificacionesList() {
  const [rows, setRows] = useState<Calificacion[]>([]);
  
  // Estados para Edición
  const [editingCalificacion, setEditingCalificacion] = useState<Calificacion | null>(null);
  
  // Estados para Creación Manual
  const [isCreating, setIsCreating] = useState(false);
  const [newData, setNewData] = useState<CreatePayload>({
    rut_contribuyente_id: "",
    codigo_tipo_calificacion_id: "",
    fecha_calificacion: new Date().toISOString().split('T')[0], // Fecha de hoy
    monto_anual: "",
    periodo: new Date().getFullYear(),
    estado: "PENDIENTE",
    vigente: true,
    observaciones: ""
  });

  // Filtros
  const [q] = useState({ search: "" });

  async function load() {
    try {
      const data = await listCalificaciones({
        ordering: "-fecha_calificacion",
        page_size: 100,
        search: q.search || undefined, 
      });
      setRows(data.results);
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  }

  useEffect(() => { load(); }, []);

  async function onExport() {
    try {
      const blob = await exportCSV({});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "calificaciones.csv"; a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Error exportando.");
    }
  }

  async function quickCreate() {
    try {
        const randomId = Math.floor(Math.random() * 9000) + 1000;
        const rutDemo = `99.999.999-${randomId}`; 
        try {
            await createContribuyenteDemo({
                rut: rutDemo,
                razon_social: `Empresa Demo ${randomId} SpA`,
                direccion: "Calle Falsa 123",
                email: "demo@empresa.com",
                tipo_inscripcion: "RUT",
                tipo_contribuyente: "Juridica"
            });
        } catch (e) {  }

        const codigoTipo = "F-CL";
        try {
            await createTipoDemo({
                codigo: codigoTipo,
                descripcion: "Clasificación Financiera",
                categoria: "Finanzas",
                monto_minimo: "0",
                monto_maximo: "999999999",
                requisitos: "Balance",
                impuesto: "19.00"
            });
        } catch (e) { }

        await createCalificacion({
            rut_contribuyente_id: rutDemo,
            codigo_tipo_calificacion_id: codigoTipo,
            fecha_calificacion: new Date().toISOString().split('T')[0],
            monto_anual: "5000000.00",
            periodo: 2025,
            estado: "APROBADO",
            observaciones: "Demo Automático",
            vigente: true
        });
        alert("¡Demo creado!");
        await load();
    } catch (error) {
        alert("Error al crear demo.");
    }
  }

  // --- Lógica de EDICIÓN ---
  function onEdit(calif: Calificacion) { setEditingCalificacion(calif); }
  function onCancelEdit() { setEditingCalificacion(null); }
  
  function handleEditChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setEditingCalificacion((prev) => {
      if (!prev) return null;
      return { ...prev, [name]: type === 'checkbox' ? checked : value } as Calificacion; 
    });
  }

  async function onSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCalificacion) return;
    try {
      const payload: EditPayload = {
          monto_anual: editingCalificacion.monto_anual,
          periodo: Number(editingCalificacion.periodo),
          estado: editingCalificacion.estado,
          vigente: editingCalificacion.vigente,
          observaciones: editingCalificacion.observaciones || "",
      };
      await updateCalificacion(editingCalificacion.id_calificacion, payload);
      alert("Actualizado con éxito.");
      onCancelEdit();
      await load();
    } catch (error) {
      alert("Error al actualizar.");
    }
  }

  // --- Lógica de ELIMINACIÓN ---
  async function onDelete(id: number) {
    if (!window.confirm(`¿Eliminar calificación ID ${id}?`)) return;
    try {
      await deleteCalificacion(id);
      await load();
    } catch (error) {
      alert("Error al eliminar.");
    }
  }
 // botón de exportar
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Pregunta de seguridad
    if (!window.confirm("¿Seguro que deseas importar este archivo CSV?")) {
        e.target.value = ""; // Limpia el input si cancela
        return;
    }

try {
        const result = await bulkUpload(file);
        
        alert(`Carga finalizada.\nCreados: ${result.creados}\nErrores: ${result.errores?.length || 0}`);
        
        if (result.errores?.length > 0) {
            console.warn("Errores en la carga:", result.errores);
            alert("Hubo algunos errores. Revisa la consola para más detalles.");
        }
        await load(); // Recargar la tabla para ver los cambios
    } catch (error) {
        console.error(error);
        alert("Error al subir el archivo.");
    } finally {
        e.target.value = ""; // Limpiar para permitir subir el mismo archivo de nuevo
    }
  }

  // --- Lógica de CREACIÓN MANUAL (NUEVA) ---
  
  function handleCreateChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setNewData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  async function onSaveCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      // Validaciones básicas
      if (!newData.rut_contribuyente_id || !newData.codigo_tipo_calificacion_id) {
        alert("El RUT y el Tipo de Calificación son obligatorios.");
        return;
      }

      await createCalificacion(newData);
      alert("Calificación creada exitosamente.");
      setIsCreating(false); // Cerrar modal
      // Resetear formulario
      setNewData({
        rut_contribuyente_id: "",
        codigo_tipo_calificacion_id: "",
        fecha_calificacion: new Date().toISOString().split('T')[0],
        monto_anual: "",
        periodo: new Date().getFullYear(),
        estado: "PENDIENTE",
        vigente: true,
        observaciones: ""
      });
      await load();
    } catch (error) {
      console.error(error);
      alert("Error al crear. Verifica que el RUT y el Tipo existan en la base de datos.");
    }
  }

  return (
    <section className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Gestión de Calificaciones</h2>
        <div className="flex gap-2">
          {/* BOTÓN NUEVO */}
          <button 
            onClick={() => setIsCreating(true)} 
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium"
          >
            + Nueva Calificación
          </button>
          <input type="file" id="csvInput" accept=".csv" style={{ display: 'none' }} onChange={handleFileUpload} />
          <button onClick={() => document.getElementById('csvInput')?.click()} className="btn-outline px-4 py-2 border rounded hover:bg-gray-100">
            Importar CSV
          </button>
          {/* ----------------------------- */}
          <button onClick={onExport} className="btn-outline px-4 py-2 border rounded hover:bg-gray-100">
            Exportar CSV
            
          </button>
          <button onClick={quickCreate} className="btn-primary px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Crear Demo
          </button>
        </div>
      </div>

      {/* TABLA DE DATOS */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contribuyente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Periodo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
             {rows.map((calif) => (
                <tr key={calif.id_calificacion}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{calif.id_calificacion}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{calif.contribuyente_data?.razon_social || "N/A"}</div>
                    <div className="text-sm text-gray-500">{calif.contribuyente_data?.rut || calif.rut_contribuyente_id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{calif.tipo_data?.descripcion || calif.codigo_tipo_calificacion_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{calif.periodo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${parseFloat(calif.monto_anual).toLocaleString('es-CL')}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${calif.vigente ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {calif.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => onEdit(calif)} className="text-indigo-600 hover:text-indigo-900 mr-4">Editar</button>
                    <button onClick={() => onDelete(calif.id_calificacion)} className="text-red-600 hover:text-red-900">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* --- MODAL DE EDICIÓN (Existente) --- */}
      {editingCalificacion && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
            <h3 className="text-lg font-bold mb-4">Editar Calificación #{editingCalificacion.id_calificacion}</h3>
            <form onSubmit={onSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Monto Anual</label>
                    <input type="number" name="monto_anual" value={editingCalificacion.monto_anual} onChange={handleEditChange} className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2" step="0.01"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Periodo</label>
                    <input type="number" name="periodo" value={editingCalificacion.periodo} onChange={handleEditChange} className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2"/>
                  </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                <select name="estado" value={editingCalificacion.estado} onChange={handleEditChange} className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2">
                    <option value="PENDIENTE">PENDIENTE</option>
                    <option value="APROBADO">APROBADO</option>
                    <option value="RECHAZADO">RECHAZADO</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Observaciones</label>
                <input type="text" name="observaciones" value={editingCalificacion.observaciones || ""} onChange={handleEditChange} className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2"/>
              </div>
              <div className="flex items-center">
                <input id="vigente_edit" name="vigente" type="checkbox" checked={editingCalificacion.vigente} onChange={handleEditChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded"/>
                <label htmlFor="vigente_edit" className="ml-2 block text-sm text-gray-900">Vigente</label>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancelEdit} className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">Cancelar</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DE CREACIÓN MANUAL (NUEVO) --- */}
      {isCreating && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
            <h3 className="text-lg font-bold mb-4">Nueva Calificación Manual</h3>
            
            <form onSubmit={onSaveCreate} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                {/* Campos Obligatorios de Relación */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">RUT Contribuyente *</label>
                    <input 
                        type="text" 
                        name="rut_contribuyente_id" 
                        placeholder="Ej: 12.345.678-9"
                        value={newData.rut_contribuyente_id} 
                        onChange={handleCreateChange} 
                        className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">Debe existir previamente en el sistema.</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Cód. Tipo Calificación *</label>
                    <input 
                        type="text" 
                        name="codigo_tipo_calificacion_id" 
                        placeholder="Ej: F-CL"
                        value={newData.codigo_tipo_calificacion_id} 
                        onChange={handleCreateChange} 
                        className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
                        required
                    />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha</label>
                    <input type="date" name="fecha_calificacion" value={newData.fecha_calificacion} onChange={handleCreateChange} className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Monto Anual</label>
                    <input type="number" name="monto_anual" value={newData.monto_anual} onChange={handleCreateChange} className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border" step="0.01"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Periodo</label>
                    <input type="number" name="periodo" value={newData.periodo} onChange={handleCreateChange} className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"/>
                  </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                <select name="estado" value={newData.estado} onChange={handleCreateChange} className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border">
                    <option value="PENDIENTE">PENDIENTE</option>
                    <option value="APROBADO">APROBADO</option>
                    <option value="RECHAZADO">RECHAZADO</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Observaciones</label>
                <input type="text" name="observaciones" value={newData.observaciones} onChange={handleCreateChange} className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"/>
              </div>

              <div className="flex items-center">
                <input id="vigente_new" name="vigente" type="checkbox" checked={newData.vigente} onChange={handleCreateChange} className="h-4 w-4 text-green-600 border-gray-300 rounded"/>
                <label htmlFor="vigente_new" className="ml-2 block text-sm text-gray-900">Es Vigente</label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                <button type="button" onClick={() => setIsCreating(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">
                  Cancelar
                </button>
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                  Crear Calificación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
}