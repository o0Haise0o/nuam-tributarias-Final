import { Link, NavLink } from "react-router-dom";

const navClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? "nav-link text-orange-600 bg-orange-50 rounded-lg px-3 py-2 font-bold" : "nav-link text-gray-600 hover:text-orange-500 px-3 py-2";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", color: "#222" }}>
      <header style={{ 
          display: "flex", 
          justifyContent: "space-between", // Separa logo y menú
          alignItems: "center",
          padding: "16px 32px", 
          background: "rgba(255, 255, 255, 0.8)", 
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(249, 115, 22, 0.1)", // Borde naranja muy suave
          position: "sticky", top: 0, zIndex: 50
      }}>
        {/* LOGO NARANJA */}
        <Link to="/" className="text-2xl font-extrabold text-orange-600 tracking-tighter hover:scale-105 transition-transform">
          NUAM
        </Link>

        <nav style={{ display: "flex", gap: 16 }}>
          <NavLink to="/" className={navClass}>Inicio</NavLink>
        </nav>
      </header>
      
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px" }}>
        {children}
      </main>
    </div>
  );
}