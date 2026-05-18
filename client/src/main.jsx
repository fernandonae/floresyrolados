import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// --- ESTA LÍNEA ES VITAL PARA QUE SE VEA EL MAPA ---
import 'leaflet/dist/leaflet.css'; 

// Importamos el proveedor del carrito
import { CartProvider } from './context/CartContext' 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Envolvemos la App para que el carrito esté disponible en todas partes */}
    <CartProvider>
      <App />
    </CartProvider>
  </StrictMode>,
)