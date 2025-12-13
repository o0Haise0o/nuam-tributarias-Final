import { useState } from "react";
import { Link } from "react-router-dom";
import { createContribuyente } from "../api/calificaciones";

const ActionCard = ({ title, icon, description, action, delay }: any) => (
  <div 
    className="card-modern p-6 flex flex-col justify-between h-full animate-fade-in"
    style={{ animationDelay: `${delay}ms` }} // Efecto cascada
  >
    <div>
      <div className="text-4xl mb-4 transform transition-transform group-hover:scale-110">{icon}</div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed mb-6">{description}</p>
    </div>
    <div className="mt-auto">
      {action}
    </div>
  </div>
);

// Tipos
type CreateContribuyentePayload = {
    rut: string;
    razon_social: string;
    email: string;
    tipo_contribuyente: string;
    tipo_inscripcion: string;
    direccion: string;
}

export default function Home() {
  const [isCreatingContrib, setIsCreatingContrib] = useState(false);
  const [newContribData, setNewContribData] = useState<CreateContribuyentePayload>({
      rut: "", razon_social: "", email: "", tipo_contribuyente: "Juridica", tipo_inscripcion: "RUT", direccion: "Sin dirección"
  });

  // Manejadores
  const handleContribChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setNewContribData(prev => ({ ...prev, [name]: value }));
  }

  const onSaveContribuyente = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          await createContribuyente(newContribData);
          alert(`Contribuyente creado: ${newContribData.razon_social}`);
          setIsCreatingContrib(false);
          setNewContribData({ rut: "", razon_social: "", email: "", tipo_contribuyente: "Juridica", tipo_inscripcion: "RUT", direccion: "Sin dirección" });
      } catch (error) {
          console.error(error);
          alert("Error: Verifica si el RUT ya existe.");
      }
  }

  const cardsData = [
    {
      title: "Nuevo Contribuyente",
      icon: "🏢",
      description: "Registra empresas o personas naturales para habilitarlas en el sistema de calificación.",
      action: (
        <button 
            onClick={() => setIsCreatingContrib(true)}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-2 px-4 rounded-xl hover:from-orange-600 hover:to-orange-700 hover:shadow-lg transition-all transform active:scale-95"
        >
            + Registrar Ahora
        </button>
      )
    },
    {
      title: "Gestionar Calificaciones",
      icon: "📈",
      description: "Administra el ciclo de vida de las calificaciones tributarias, edita montos y vigencias.",
      action: (
        <Link to="/calificaciones" 
        className="block text-center w-full bg-orange-500 text-white border border-indigo-200 py-2 rounded-lg hover:bg-orange-600 font-semibold transition-colors">
            Ir al Dashboard
        </Link>
      )
    },
    {
      title: "Auditoría del Sistema",
      icon: "🛡️",
      description: "Traza cada movimiento. Revisa logs de seguridad, cambios de datos y accesos de usuarios.",
      action: (
        <Link to="/audit" className="block text-center w-full bg-orange-500 text-white border border-gray-200 py-2 rounded-lg hover:bg-orange-600 font-semibold transition-colors">
            Ver Registros
        </Link>
      )
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-10">
      
      {/* --- HEADER MODERNO CON DETALLE NARANJA --- */}
      <div className="text-center space-y-4 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
          Bienvenido a <span className="text-orange-500">Nuam</span><span className="text-gradient-orange">-Tributarias</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Plataforma integral para la gestión inteligente de cumplimiento tributario y calificaciones financieras.
        </p>
        <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 to-orange-500 mx-auto rounded-full mt-6"></div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {cardsData.map((card, index) => (
          <ActionCard 
            key={index}
            {...card}
            delay={index * 150} // Retraso escalonado para la animación
          />
        ))}
      </section>
      {isCreatingContrib && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
            
            <div className="bg-orange-600 p-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>🏢</span> Nuevo Contribuyente
              </h3>
              <p className="text-indigo-100 text-sm mt-1">Ingresa los datos fiscales para el registro.</p>
            </div>
            <form onSubmit={onSaveContribuyente} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">RUT (ID) *</label>
                <input 
                    type="text" 
                    name="rut" 
                    value={newContribData.rut} 
                    onChange={handleContribChange} 
                    placeholder="12.345.678-9" 
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2.5 border" 
                    required 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Razón Social / Nombre *</label>
                <input 
                    type="text" 
                    name="razon_social" 
                    value={newContribData.razon_social} 
                    onChange={handleContribChange} 
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2.5 border" 
                    required 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email *</label>
                <input 
                    type="email" 
                    name="email" 
                    value={newContribData.email} 
                    onChange={handleContribChange} 
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2.5 border" 
                    required 
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Tipo</label>
                    <select 
                        name="tipo_contribuyente" 
                        value={newContribData.tipo_contribuyente} 
                        onChange={handleContribChange} 
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2.5 border"
                    >
                        <option value="Natural">Natural</option>
                        <option value="Juridica">Jurídica</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Inscripción</label>
                    <select 
                        name="tipo_inscripcion" 
                        value={newContribData.tipo_inscripcion} 
                        onChange={handleContribChange} 
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2.5 border"
                    >
                        <option value="RUT">RUT</option>
                        <option value="Pasaporte">Pasaporte</option>
                    </select>
                  </div>
              </div>
              {/* BOTONES DE ACCIÓN */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
                <button 
                    type="button" 
                    onClick={() => setIsCreatingContrib(false)} 
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                    type="submit" 
                    className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-lg hover:from-orange-600 hover:to-orange-700 shadow-md transition-all"
                >
                  Guardar Contribuyente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
