import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ProductProvider } from "./context/ProductContext";

// --- PÁGINAS ---
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage"; 
import HomePage from "./pages/HomePage";     
import MapPage from "./pages/MapPage";       
import AdminPage from "./pages/AdminPage"; 
import CheckoutPage from "./pages/CheckoutPage"; // <--- NUEVA PÁGINA

// --- COMPONENTES ---
import Navbar from "./components/Navbar";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <ProductProvider> 
        <CartProvider>
          <BrowserRouter>
            <Navbar />
            
            <main className="min-h-screen bg-zinc-950"> 
              <Routes>
                {/* ================= RUTAS PÚBLICAS ================= */}
                <Route path="/" element={<HomePage />} /> 
                <Route path="/category/:categoryName" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* ================= RUTAS PROTEGIDAS (CLIENTES) ================= */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/profile" element={
                    <div className="p-10 text-white">
                      <h1 className="text-4xl font-black italic uppercase">👤 Mi Perfil</h1>
                      <p className="text-zinc-500 mt-2 font-bold uppercase tracking-widest text-[10px]">Configuración de cuenta Cannaland</p>
                    </div>
                  } />
                  
                  {/* AQUÍ VA EL CHECKOUT: Solo usuarios registrados pueden comprar */}
                  <Route path="/checkout" element={<CheckoutPage />} />
                </Route>

                {/* ================= REPARTIDORES Y ADMINS ================= */}
                <Route element={<ProtectedRoute allowedRoles={['delivery', 'admin']} />}>
                  <Route path="/mapa-pedido" element={<MapPage />} />
                </Route>

                {/* ================= SOLO ADMINS ================= */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/admin" element={<AdminPage />} />
                </Route>

                {/* ================= RUTA 404 (ESTILO PREMIUM) ================= */}
                <Route path="*" element={
                  <div className="h-[80vh] flex flex-col items-center justify-center text-white bg-black">
                    <h1 className="text-8xl font-black opacity-10 tracking-tighter italic mb-[-20px]">404</h1>
                    <h2 className="text-2xl font-black italic tracking-tighter text-zinc-600 uppercase">Lost in the weeds</h2>
                    <p className="text-[10px] font-black text-green-500 mt-4 uppercase tracking-[0.5em]">Regresa al camino principal</p>
                  </div>
                } />
              </Routes>
            </main>
          </BrowserRouter>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;