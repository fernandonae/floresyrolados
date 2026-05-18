import { useEffect } from "react";
import { useProducts } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

import { Link, useParams } from "react-router-dom";
import { FiPlus, FiStar, FiLock, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

function HomePage() {
  const { categoryName } = useParams();
  const { products, getProducts } = useProducts();
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  

  // Filtramos la lista original de productos
  const productosFiltrados = categoryName 
  ? products.filter(p => p.category === categoryName) 
  : products;
  // Carga inicial de productos desde la base de datos local
  useEffect(() => {
    getProducts();
  }, []);

  // Bloqueo de compra si no está logueado o está pendiente de validación
  const isBlocked = !isAuthenticated || user?.status === "pending";

  const handlePurchase = (prod) => {
    if (!isAuthenticated) {
      alert("⚠️ Debes iniciar sesión para comprar.");
      return;
    }
    if (user?.status === "pending") {
      alert("🚨 CUENTA EN REVISIÓN: Tu documentación está siendo procesada.");
      return;
    }
    addToCart(prod);
  };

  return (
    <div className="bg-zinc-950 min-h-screen pb-20 font-sans selection:bg-green-500 selection:text-black">
      
      {/* HERO BANNER - IMAGEN CORREGIDA */}
      <div className="relative h-[500px] flex items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/30 via-zinc-950/80 to-zinc-950 z-10"></div>
        <img 
          src="https://wallpapers.com/images/featured/one-piece-c0pujiakubq5rwas.jpg" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105"
          alt="Cannaland Banner"
        />
        
        <div className="relative z-20 animate-in fade-in zoom-in duration-1000">
          <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter text-white leading-none">
            Flores<span className="text-green-500">& Rolados</span>
          </h1>
          <p className="text-zinc-400 font-bold tracking-[0.4em] uppercase text-[10px] md:text-xs mt-6 flex items-center justify-center gap-3">
            <span className="w-8 md:w-12 h-[1px] bg-zinc-800"></span>
            Premium Delivery Service
            <span className="w-8 md:w-12 h-[1px] bg-zinc-800"></span>
          </p>

          <div className="flex justify-center mt-8">
            {isAuthenticated ? (
              user?.status === "pending" ? (
                <div className="bg-orange-500/10 border border-orange-500/20 px-6 py-3 rounded-full flex items-center gap-2 text-orange-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
                  <FiAlertCircle /> Verificación en curso
                </div>
              ) : (
                <div className="bg-green-500/10 border border-green-500/20 px-6 py-3 rounded-full flex items-center gap-2 text-green-500 text-[10px] font-black uppercase tracking-widest">
                  <FiCheckCircle /> Socio Verificado
                </div>
              )
            ) : (
              <Link to="/login" className="bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-3 rounded-full text-zinc-400 text-[10px] font-black uppercase tracking-widest transition-all">
                Inicia sesión para comprar
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN DE PRODUCTOS */}
      <div className="container mx-auto px-6 mt-[-80px] relative z-30">
        <div className="flex items-center justify-between mb-12">
          <div className="flex flex-col">
            <h2 className="text-4xl font-black text-white italic leading-none">
              FLORES DE <span className="text-green-500 underline decoration-zinc-800 decoration-4 underline-offset-8">AUTOR</span>
            </h2>
            <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em] mt-4">Catálogo Real Time</p>
          </div>
          <div className="h-[1px] flex-1 bg-zinc-900 mx-10 hidden lg:block"></div>
        </div>

        {/* RENDERIZADO DINÁMICO */}
        {productosFiltrados.length === 0 ? (
          <div className="text-center py-20 bg-black/40 border border-dashed border-zinc-800 rounded-[45px]">
            <p className="text-zinc-500 font-black uppercase tracking-widest text-xs italic">
              No hay productos disponibles en el dispensario...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {productosFiltrados.map((prod) => (
              <div 
                key={prod._id} 
                className="group bg-black border border-zinc-900 rounded-[45px] overflow-hidden hover:border-green-600/50 transition-all duration-500 shadow-2xl flex flex-col"
              >
                {/* IMAGEN DEL PRODUCTO */}
                <div className="relative h-80 overflow-hidden">
                  <img 
  src={
    prod.image?.startsWith('http') 
      ? prod.image                                 // Si ya es URL completa (las viejas)
      : `http://localhost:5000/uploads/${prod.image}` // Si es solo el nombre (las nuevas)
  } 
  className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${isBlocked ? 'grayscale opacity-40' : 'grayscale-0 opacity-100'}`} 
  alt={prod.name}
  onError={(e) => {
    // Si sigue fallando, es que el nombre del archivo no existe en el server
    e.target.src = "https://via.placeholder.com/500?text=Error+de+Archivo";
  }}
/>
                  
                  <div className="absolute top-6 left-6 bg-white text-black text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] z-20">
                    {prod.category}
                  </div>

                  {isBlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                      <div className="bg-black/80 p-5 rounded-full border border-zinc-800 shadow-2xl transform group-hover:scale-110 transition-transform">
                        <FiLock className="text-white text-2xl" />
                      </div>
                    </div>
                  )}
                </div>

                {/* DETALLES */}
                <div className="p-10 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-black text-white uppercase italic leading-none tracking-tighter">
                      {prod.name}
                    </h3>
                    <div className="flex text-green-500 text-[10px] gap-0.5">
                      <FiStar /><FiStar /><FiStar /><FiStar /><FiStar />
                    </div>
                  </div>
                  
                  <p className="text-zinc-500 text-sm font-medium mb-8 leading-relaxed line-clamp-3">
                    {prod.description}
                  </p>
                  
                  <div className="mt-auto flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-1">Precio x Grm</span>
                      <span className="text-4xl font-black text-white tracking-tighter">${prod.price}</span>
                    </div>

                    <button 
                      onClick={() => handlePurchase(prod)}
                      className={`w-16 h-16 rounded-[2rem] flex items-center justify-center transition-all active:scale-95 shadow-2xl border
                        ${isBlocked 
                          ? 'bg-zinc-900 border-zinc-800 text-zinc-700 cursor-not-allowed' 
                          : 'bg-white hover:bg-green-500 text-black border-transparent hover:shadow-green-500/20'}
                      `}
                    >
                      {isBlocked ? <FiLock className="text-xl" /> : <FiPlus className="text-3xl" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* NOTIFICACIÓN FLOTANTE PARA USUARIOS PENDIENTES */}
      {isAuthenticated && user?.status === "pending" && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-md">
          <div className="bg-orange-600 text-white px-6 py-4 rounded-[2rem] shadow-[0_20px_50px_rgba(234,88,12,0.3)] flex items-center justify-between border border-orange-400/30 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-full animate-bounce">
                <FiAlertCircle className="text-xl" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest">Cuenta en revisión</span>
                <span className="text-[9px] opacity-80 font-bold uppercase">Validando ID: Acceso restringido</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;