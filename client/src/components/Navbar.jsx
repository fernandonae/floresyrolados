import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

// Iconos Profesionales
import { 
  FiSearch, FiUser, FiShoppingCart, FiMenu, 
  FiX, FiEye, FiLogOut, FiShield, FiEyeOff, FiChevronRight 
} from "react-icons/fi";

function Navbar() {
  const { isAuthenticated, logout, signin, user } = useAuth();
  // Traemos cartCount y cartTotal directamente del contexto
  // DESPUÉS
  const { cartCount, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const categorias = ["Flores", "Extractos", "Comestibles THC", "Pods", "CBD", "Accesorios", "Quimicos","psocodelicos"];

  const handleSidebarLogin = async (e) => {
    e.preventDefault();
    try {
      await signin({ email, password });
      setIsLoginOpen(false); 
      setEmail("");
      setPassword("");
      setShowPassword(false);
      setTimeout(() => { navigate("/"); }, 100);
    } catch (error) {
      console.error("Error en la autenticación:", error);
    }
  };

  return (
    <>
      <nav className="bg-[#050505] text-[#bbb] shadow-2xl sticky top-0 z-40 font-sans border-b border-zinc-900 backdrop-blur-md bg-black/90">
        
        {/* ================= FILA 1: LOGO, BUSCADOR, ICONOS ================= */}
        <div className="container mx-auto px-6 py-4 flex items-center justify-between gap-6">
          
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <span className="text-3xl text-green-500 transition-transform group-hover:rotate-12">🌿</span> 
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-white group-hover:text-green-400 transition leading-none">Flores</span>
              <span className="text-[10px] font-black text-zinc-500 tracking-[0.3em] uppercase">& Rolados</span>
            </div>
          </Link>

          <div className="relative flex-1 max-w-xl group hidden md:block">
            <input 
              type="text" 
              placeholder="Buscar flores, vapes, gummies..." 
              className="w-full bg-[#0a0a0a] border border-zinc-800 group-hover:border-zinc-700 rounded-full py-3 px-6 pr-14 text-white placeholder-zinc-600 focus:outline-none focus:border-green-600 transition-all shadow-inner" 
            />
            <button className="absolute right-2 top-2 bg-zinc-900 text-zinc-400 w-10 h-10 flex items-center justify-center rounded-full hover:bg-green-600 hover:text-white active:scale-95 transition">
              <FiSearch className="text-lg" />
            </button>
          </div>

          <div className="flex items-center gap-4 lg:gap-8">
            
            {/* ================= BOTÓN DEL CARRITO CONECTADO ================= */}
            <Link 
              to="/checkout" 
              className="bg-zinc-900/50 border border-zinc-800 px-5 py-2.5 rounded-full flex items-center gap-3 hover:border-green-600 transition cursor-pointer group shadow-xl relative"
            >
              <div className="relative">
                <FiShoppingCart className="text-xl group-hover:text-green-500 transition" />
                {cartCount > 0 && (
                  <span className="absolute -top-3 -right-3 bg-green-500 text-black text-[9px] w-5 h-5 flex items-center justify-center rounded-full font-black ring-4 ring-black animate-in zoom-in">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-white font-black text-sm group-hover:text-green-500 transition hidden sm:block">
                ${cartTotal.toFixed(2)}
              </span>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-3 border-l border-zinc-800 pl-4 lg:pl-8">
                <Link to={user?.role === 'admin' ? "/admin" : "/profile"} className="flex items-center gap-3 group">
                  <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700 group-hover:border-green-500 transition overflow-hidden">
                    {user?.role === 'admin' ? <FiShield className="text-green-500" /> : <FiUser className="text-zinc-400" />}
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">
                        {user?.role === 'admin' ? "Panel Control" : "Bienvenido"}
                    </span>
                    <span className="text-xs font-bold text-white uppercase italic group-hover:text-green-500 transition">
                      {user?.username}
                    </span>
                  </div>
                </Link>
                <button onClick={() => {logout(); clearCart();}} className="w-10 h-10 bg-zinc-900/50 text-zinc-500 hover:bg-red-600 hover:text-white rounded-full flex items-center justify-center transition-all border border-zinc-800 hover:border-transparent">
                  <FiLogOut className="text-lg" />
                </button>
              </div>
            ) : (
              <button onClick={() => setIsLoginOpen(true)} className="bg-white text-black px-10 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:bg-green-500 transition-all active:scale-95 shadow-xl shadow-white/5">
                Ingresar
              </button>
            )}
          </div>
        </div>

        {/* ================= FILA 2: NAVEGACIÓN RÁPIDA ================= */}
        <div className="bg-[#080808]/50 border-t border-zinc-900/50">
          <div className="container mx-auto px-6 py-2 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button onClick={() => setIsMenuOpen(true)} className="flex items-center gap-2 text-[10px] font-black text-zinc-400 hover:text-green-500 transition uppercase tracking-[0.2em]">
                <FiMenu className="text-lg" /> Menú
              </button>
              <div className="h-4 w-[1px] bg-zinc-800 hidden sm:block"></div>
              <ul className="hidden sm:flex items-center gap-8 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                {["Los más vendidos", "Nuevos", "Ofertas"].map(item => (
                  <li key={item} className="hover:text-white cursor-pointer transition-colors">{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* ... (Resto de los Sidebars y Overlay se mantienen igual) ... */}
      
      {/* SIDEBAR MENÚ */}
<div className={`fixed inset-y-0 left-0 w-full sm:w-[400px] bg-black text-white z-50 transform ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-500 ease-in-out shadow-[20px_0_80px_rgba(0,0,0,0.9)] border-r border-zinc-900`}>
  <div className="p-10 flex flex-col h-full">
    <div className="flex justify-between items-center mb-12">
      <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white">Menú</h2>
      <button onClick={() => setIsMenuOpen(false)} className="text-zinc-500 hover:text-white transition text-3xl">
        <FiX />
      </button>
    </div>
    
    {/* Contenedor con scroll por si tienes muchas categorías */}
    <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar">
      {categorias.map((cat) => (
        <button 
          key={cat} 
          onClick={() => {
            setIsMenuOpen(false); // Cierra el sidebar
            navigate(`/category/${cat}`); // <--- Manda al usuario a la ruta de la categoría
          }} 
          className="w-full flex items-center justify-between py-5 px-6 rounded-2xl bg-zinc-900/20 border border-zinc-800 hover:border-green-500 transition-all group active:scale-95"
        >
          <span className="text-sm font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">
            {cat}
          </span>
          <FiChevronRight className="text-zinc-700 group-hover:text-green-500 transition-transform group-hover:translate-x-1" />
        </button>
      ))}
    </div>
  </div>
</div>

      {/* SIDEBAR LOGIN */}
      <div className={`fixed inset-y-0 right-0 w-full sm:w-[450px] bg-black text-white z-50 transform ${isLoginOpen ? "translate-x-0" : "translate-x-full"} transition-transform duration-500 ease-in-out shadow-[-20px_0_80px_rgba(0,0,0,0.9)] border-l border-zinc-900`}>
        <div className="p-12 flex flex-col h-full overflow-y-auto">
          <div className="flex justify-between items-center mb-16">
            <h2 className="text-4xl font-black italic tracking-tighter uppercase">Inicia <span className="text-green-500">Sesión</span></h2>
            <button onClick={() => { setIsLoginOpen(false); setEmail(""); setPassword(""); }} className="text-zinc-500 hover:text-white transition text-3xl">
              <FiX />
            </button>
          </div>

          <form className="space-y-8" onSubmit={handleSidebarLogin}>
            <div className="group space-y-3">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Email corporativo</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-5 px-6 text-white focus:outline-none focus:border-green-500 transition" placeholder="tu@email.com" required />
            </div>

            <div className="group space-y-3 relative">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Contraseña</label>
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-5 px-6 text-white focus:outline-none focus:border-green-500 transition" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-[55px] text-zinc-600 hover:text-white">
                {showPassword ? <FiEyeOff size={22} /> : <FiEye size={22} />}
              </button>
            </div>

            <button type="submit" className="w-full bg-white text-black font-black py-5 rounded-2xl text-[11px] uppercase tracking-[0.2em] hover:bg-green-500 transition-all active:scale-95">
              Desbloquear catálogo
            </button>
          </form>

          <div className="mt-auto pt-10 text-center">
            <Link to="/register" onClick={() => setIsLoginOpen(false)} className="inline-block font-black text-xs text-white uppercase tracking-tighter border-b border-green-500 pb-1 hover:text-green-500 transition-all">
              Crear nueva cuenta de socio
            </Link>
          </div>
        </div>
      </div>

      {/* OVERLAY */}
      {(isMenuOpen || isLoginOpen) && (
        <div 
          onClick={() => { setIsMenuOpen(false); setIsLoginOpen(false); }} 
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-40"
        ></div>
      )}
    </>
  );
}

export default Navbar;